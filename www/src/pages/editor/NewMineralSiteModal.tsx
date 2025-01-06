import React, { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { Button, Form, Input, Modal, Space, message, Row, Col, Select, Divider, Radio, RadioChangeEvent } from "antd";
import { useStores, Commodity, DraftCreateMineralSite, CandidateEntity } from "models";
import { LocationInfo } from "../../models/mineralSite/LocationInfo";
import { Reference, Document } from "../../models/mineralSite/Reference";
import { GradeTonnage } from "../../models/mineralSite/GradeTonnage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MineralInventory, Measure } from "../../models/mineralSite/MineralInventory";
import { useMemo } from "react";
import { observer } from "mobx-react-lite";

interface NewMineralSiteModalProps {
  commodity: Commodity | undefined;
}
export interface NewMineralSiteFormRef {
  open: () => void;
  close: () => void;
}
interface FormValues {
  latitude?: number;
  longitude?: number;
  country?: string;
  stateOrProvince?: string;
  name: string;
  refDoc: string;
  refComment: string;
  sourceType: string;
  depositType: string;
  depositTypeConfidence: number;
  tonnage?: number;
  grade?: number;
  gradeUnit?: string;
  tonnageUnit?: string;
}

const NewMineralSiteForm = ({ commodity }: NewMineralSiteModalProps, ref: ForwardedRef<NewMineralSiteFormRef>) => {
  const { mineralSiteStore, dedupMineralSiteStore, userStore, commodityStore, countryStore, stateOrProvinceStore, depositTypeStore, unitStore } = useStores();
  const [form] = Form.useForm();
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));
  const commodityOptions = useMemo(() => {
    return commodityStore.list.map((comm) => ({
      value: comm.uri,
      label: comm.name,
    }));
  }, [commodityStore.records.size]);
  const countryOptions = useMemo(() => {
    return countryStore.list.map((country) => ({
      value: country.uri,
      label: country.name,
    }));
  }, [countryStore.records.size]);

  const stateOptions = useMemo(() => {
    return stateOrProvinceStore.list.map((state) => ({
      value: state.uri,
      label: state.name,
    }));
  }, [stateOrProvinceStore.records.size]);

  const depositTypeOptions = useMemo(() => {
    return depositTypeStore.list.map((type) => ({
      value: type.uri,
      label: type.name,
    }));
  }, [depositTypeStore.records.size]);

  const unitOptions = useMemo(() => {
    return unitStore.list.map((unit) => ({
      value: unit.uri,
      label: unit.name,
    }));
  }, [unitStore.records.size]);

  // we need source type and reference to update the source id
  const handleSourceTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setSelectedSourceType(value);
  };
  const handleSave = async (values: FormValues) => {
    const currentUserUrl = userStore.getCurrentUser()!.url;
    let location = undefined;
    if (values.latitude !== undefined && values.longitude !== undefined) {
      location = `POINT (${values.longitude} ${values.latitude})`;
    }

    if (commodity === undefined) {
      console.log("commodity not chosen")
      return
    }
    const countries = values.country
      ? [
        new CandidateEntity({
          observedName: countryStore.getByURI(values.country)!.name,
          source: currentUserUrl,
          normalizedURI: values.country,
          confidence: 1.0,
        }),
      ]
      : [];

    const statesOrProvinces = values.stateOrProvince
      ? [
        new CandidateEntity({
          observedName: stateOrProvinceStore.getByURI(values.stateOrProvince)!.name,
          source: currentUserUrl,
          normalizedURI: values.stateOrProvince,
          confidence: 1.0,
        }),
      ]
      : [];
    const commodity1 = commodity.id;
    const referenceDocument = new Document({
      uri: values.refDoc,
    });

    const reference = new Reference({
      document: referenceDocument,
      comment: values.refComment,
    });

    const mineralInventory = new MineralInventory({
      category: ["Inferred", "Indicated", "Measured"].map(
        (name) =>
          new CandidateEntity({
            source: currentUserUrl,
            confidence: 1.0,
            observedName: name,
            normalizedURI: `https://minmod.isi.edu/resource/${name}`,
          })
      ),
      commodity: new CandidateEntity({
        source: currentUserUrl,
        confidence: 1.0,
        observedName: commodity.name,
        normalizedURI: commodity.uri,
      }),
      grade: values.grade !== undefined
        ? new Measure({
          value: values.grade,
          unit: new CandidateEntity({
            source: currentUserUrl,
            confidence: 1,
            observedName: unitStore.getByURI(values.gradeUnit!)!.name,
            normalizedURI: values.gradeUnit,
          }),
        })
        : undefined,
      ore: values.tonnage !== undefined
        ? new Measure({
          value: values.tonnage,
          unit: new CandidateEntity({
            source: currentUserUrl,
            confidence: 1,
            observedName: unitStore.getByURI(values.tonnageUnit!)!.name,
            normalizedURI: values.tonnageUnit,
          }),
        })
        : undefined,
      reference: reference,
    });

    const sourceType = values.sourceType;
    const refDocUrl = values.refDoc;
    let combinedSourceId = "";

    if (sourceType === "unpublished") {
      combinedSourceId = `unpublished::${currentUserUrl}`;
    } else if (sourceType !== "unpublished") {
      combinedSourceId = `${sourceType}::${refDocUrl}`;
    }
    const draft = new DraftCreateMineralSite({
      id: "",
      draftID: `draft-${Date.now()}`,
      recordId: `record-${uuidv4()}`,
      sourceId: combinedSourceId,
      dedupSiteURI: "",
      createdBy: [currentUserUrl],
      name: values.name,
      locationInfo: new LocationInfo({
        country: countries,
        stateOrProvince: statesOrProvinces,
        location: location,
      }),
      depositTypeCandidate: [
        new CandidateEntity({
          source: currentUserUrl,
          confidence: values.depositTypeConfidence,
          observedName: depositTypeStore.getByURI(values.depositType)!.name,
          normalizedURI: values.depositType,
        }),
      ],
      reference: [reference],
      sameAs: [],
      gradeTonnage: {
        [commodity1 as string]: new GradeTonnage({
          commodity: commodity1,
          totalTonnage: values.tonnage || 0,
          totalGrade: values.grade || 0,
        }),
      },
      mineralInventory: [mineralInventory],
    });
    const newMineralSite = await mineralSiteStore.create(draft);
    const dedup_site_uri = newMineralSite.dedupSiteURI;
    const dedupSite = await dedupMineralSiteStore.forceFetchByURI(dedup_site_uri, commodity1 ?? "");
    message.success("Mineral site created and dedup store updated successfully!");
  };


  return (
    <Modal title="Add New Mineral Site" visible={visible} onCancel={() => setVisible(false)} footer={null} width="70%">
      <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ refAppliedToAll: true, depositTypeConfidence: 1, type: "NotSpecified", rank: "U", gradeUnit: "https://minmod.isi.edu/resource/Q201", tonnageUnit: "https://minmod.isi.edu/resource/Q202" }}>
        {/* General Information */}
        <Divider orientation="left">General Information</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Enter site name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="rank" label="Rank" rules={[{ required: true }]}>
              <Select
                placeholder="Select a rank"
                options={[
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "C", label: "C" },
                  { value: "D", label: "D" },
                  { value: "E", label: "E" },
                  { value: "U", label: "U" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select
                placeholder="Select a type"
                options={[
                  { value: "Occurrence", label: "Occurrence" },
                  { value: "Past Producer", label: "Past Producer" },
                  { value: "Prospect", label: "Prospect" },
                  { value: "Plant", label: "Plant" },
                  { value: "NotSpecified", label: "NotSpecified" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* Location */}
        <Divider orientation="left">Location</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="country" label="Country" rules={[{ required: true }]}>
              <Select
                placeholder="Select a country"
                options={countryOptions}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="stateOrProvince" label="State or Province" rules={[{ required: true }]}>
              <Select
                placeholder="Select a state or province"
                options={stateOptions}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="latitude" label="Latitude">
              <Input type="number" placeholder="Enter latitude in decimal" step="0.0001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="longitude" label="Longitude">
              <Input type="number" placeholder="Enter longitude in decimal" step="0.0001" />
            </Form.Item>
          </Col>
        </Row>

        {/* Deposit Info */}
        <Divider orientation="left">Deposit Info</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="depositType" label="Deposit Type" rules={[{ required: true }]}>
              <Select
                placeholder="Select a deposit type"
                options={depositTypeOptions}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="depositTypeConfidence"
              label="Deposit Type Confidence"
              rules={[
                { required: true, message: "Confidence value is required" },
                {
                  validator: (_, value) => (value >= 0 && value <= 1 ? Promise.resolve() : Promise.reject(new Error("Confidence must be between 0 and 1"))),
                },
              ]}
            >
              <Input type="number" placeholder="Enter confidence" step="0.01" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Mineral Inventory</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Grade">
              <Input.Group compact>
                <Form.Item name="grade" noStyle>
                  <Input type="number" placeholder="Enter grade value" style={{ width: "60%" }} />
                </Form.Item>
                <Form.Item name="gradeUnit" noStyle rules={[{ required: true, message: "Unit is required" }]}>
                  <Select placeholder="Select unit" options={unitOptions} style={{ width: "40%" }} showSearch optionFilterProp="label" filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false} />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Tonnage">
              <Input.Group compact>
                <Form.Item name="tonnage" noStyle>
                  <Input type="number" placeholder="Enter tonnage value" style={{ width: "60%" }} />
                </Form.Item>
                <Form.Item name="tonnageUnit" noStyle>
                  <Select placeholder="Select unit" options={unitOptions} style={{ width: "40%" }} showSearch optionFilterProp="label" filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false} />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          {/* Commodity */}
          <Col span={12}>
            <Form.Item name="commodity" label="Commodity" rules={[{ required: true }]}>
              <Select placeholder="Select commodity" options={commodityOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
        </Row>

        {/* Source & Reference */}
        <Divider orientation="left">Source & Reference</Divider>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item name="sourceType" label="Source" rules={[{ required: true, message: "Please select a source type" }]}>
              <Radio.Group onChange={handleSourceTypeChange}>
                <Radio value="database">Database</Radio>
                <Radio value="technical article">Technical Article</Radio>
                <Radio value="mining report">Mining Report</Radio>
                <Radio value="unpublished">Unpublished</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          {/* Reference Document URL */}
          {(selectedSourceType === "database" || selectedSourceType === "technical article" || selectedSourceType === "mining report") && (
            <Col span={24}>
              <Form.Item name="refDoc" label="Reference Document URL" rules={[{ required: true, message: "Reference Document URL is required" }]}>
                <Input placeholder="Enter reference document URL" />
              </Form.Item>
            </Col>
          )}

          {/* Reference Comments */}
          <Col span={24}>
            <Form.Item name="refComment" label="Reference Comments">
              <Input.TextArea placeholder="Enter any comments about the reference" autoSize={{ minRows: 1, maxRows: 4 }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer */}
        <Form.Item style={{ textAlign: "center" }}>
          <Space>
            <Button onClick={() => setVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const NewMineralSiteModal = observer(forwardRef<NewMineralSiteFormRef, NewMineralSiteModalProps>(NewMineralSiteForm));
