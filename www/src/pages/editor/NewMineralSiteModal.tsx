import React from "react";
import { Button, Checkbox, Form, Input, Modal, Space, message, Row, Col, Select, Typography, Divider, Radio, RadioChangeEvent } from "antd";
import { useStores, Commodity, DraftCreateMineralSite, CandidateEntity, initNonCriticalStores, DepositType, Unit, MineralSite } from "models";
import { LocationInfo } from "../../../models/mineralSite/LocationInfo";
import { Reference, Document } from "../../../models/mineralSite/Reference";
import { GradeTonnage } from "../../../models/mineralSite/GradeTonnage";
import { CommodityStore } from "models/commodity";
import { DedupMineralSite, DedupMineralSiteLocation } from "../../../models/dedupMineralSite";
import axios from "axios";
import { Country, StateOrProvince } from "models";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { UserStore } from "models/user";

interface NewMineralSiteModalProps {
  commodity: Commodity;
  visible: boolean;
  onClose: () => void;
}

export const NewMineralSiteModal: React.FC<NewMineralSiteModalProps> = ({ commodity, visible, onClose }) => {
  const { mineralSiteStore, dedupMineralSiteStore, userStore, commodityStore, countryStore, stateOrProvinceStore, depositTypeStore, unitStore } = useStores();
  const [form] = Form.useForm();
  const [commodityOptions, setCommodityOptions] = useState<{ value: string; label: string }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
  const [depositTypeOptions, setDepositTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);
  const [recordId, setRecordId] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null);

  useEffect(() => {
    commodityStore.fetchCriticalCommotities().then((commodities) => {
      setCommodityOptions(commodities.map((comm: { id: string; name: string }) => ({ value: comm.id, label: comm.name })));
    });

    countryStore.fetchAll().then(() => {
      setCountryOptions(
        Array.from(countryStore.records.values())
          .filter((country): country is Country => country !== null)
          .map((country: Country) => ({ value: country.id, label: country.name }))
      );
    });

    stateOrProvinceStore.fetchAll().then(() => {
      setStateOptions(
        Array.from(stateOrProvinceStore.records.values())
          .filter((state): state is StateOrProvince => state !== null)
          .map((state: StateOrProvince) => ({ value: state.id, label: state.name }))
      );
    });

    depositTypeStore.fetchAll().then(() => {
      setDepositTypeOptions(
        Array.from(depositTypeStore.records.values())
          .filter((type): type is DepositType => type !== null)
          .map((type) => ({ value: type.id ?? "", label: type.name ?? "Unnamed" }))
      );
    });
    unitStore.fetchAll().then(() => {
      setUnitOptions(
        Array.from(unitStore.records.values())
          .filter((unit): unit is Unit => unit !== null)
          .map((unit) => ({ value: unit.id ?? "", label: unit.name ?? "Unnamed" }))
      );
    });
    const generatedId = `record-${uuidv4()}`;
    setRecordId(generatedId);
    form.setFieldsValue({ recordId: generatedId });
  }, [commodityStore, countryStore, stateOrProvinceStore, form, visible]);

  const handleSourceTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setSelectedSourceType(value);

    const refDocUrl = form.getFieldValue("refDoc");
    const currentUser = userStore.getCurrentUser()?.url;

    if (value === "unpublished") {
      form.setFieldsValue({ sourceId: `unpublished::${currentUser || "unknown"}` });
    } else if (refDocUrl) {
      form.setFieldsValue({ sourceId: `${value}::${refDocUrl}` });
    } else {
      form.setFieldsValue({ sourceId: null });
    }
  };

  const handleSave = async (values: any) => {
    try {
      let location = undefined;
      if (values.latitude !== undefined && values.longitude !== undefined) {
        location = `POINT (${values.longitude} ${values.latitude})`;
      }

      const countries = values.country
        ? [
            new CandidateEntity({
              observedName: values.country,
              source: values.country,
              normalizedURI: userStore.getCurrentUser()?.url,
              confidence: 1.0,
            }),
          ]
        : [];

      const statesOrProvinces = values.stateorprovince
        ? [
            new CandidateEntity({
              observedName: values.stateorprovince,
              source: values.stateorprovince,
              normalizedURI: userStore.getCurrentUser()?.url,
              confidence: 1.0,
            }),
          ]
        : [];

      const commodity1 = commodity.id;
      console.log("COMMOdity", commodity1);
      const referenceDocument = new Document({
        uri: values.refDoc,
        title: values.refDoc,
      });

      const reference = new Reference({
        document: referenceDocument,
        comment: values.refComment || "",
      });
      const sourceType = values.sourceType;
      const refDocUrl = values.refDoc;
      let combinedSourceId = " ";

      if (sourceType === "unpublished") {
        combinedSourceId = `unpublished::${userStore.getCurrentUser()?.url || "unknown"}`;
      } else if (sourceType && refDocUrl) {
        combinedSourceId = `${sourceType}::${refDocUrl}`;
      } else {
        combinedSourceId = " ";
      }

      if (!combinedSourceId) {
        console.error("Error: Source ID could not be constructed. Check sourceType and refDoc values.");
      }

      const currentUser = userStore.getCurrentUser()?.name;
      const createdBy = `https://minmod.isi.edu/users/u/${currentUser}`;
      const draft = new DraftCreateMineralSite({
        id: "",
        draftID: `draft-${Date.now()}`,
        recordId: recordId,
        sourceId: combinedSourceId,
        dedupSiteURI: "",
        createdBy: [createdBy],
        name: values.name,
        locationInfo: new LocationInfo({
          country: countries,
          stateOrProvince: statesOrProvinces,
          location: location,
        }),
        depositTypeCandidate: [
          new CandidateEntity({
            source: values.deposittype,
            confidence: values.deposittypeconfidence,
            observedName: values.deposittype,
            normalizedURI: values.deposittype,
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
        mineralInventory: [],
      });

      const newMineralSite = await mineralSiteStore.create(draft);
      console.log("newMineralSite", newMineralSite.dedupSiteURI);
      const dedup_site_uri = newMineralSite.dedupSiteURI;
      const dedupSite = await dedupMineralSiteStore.forceFetchByURI(dedup_site_uri, commodity1);
      console.log("newMineralSite", newMineralSite);
      message.success("Mineral site created and dedup store updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving mineral site:", error);
      message.error("Failed to create mineral site. Please try again.");
    }
  };

  return (
    <Modal title="Add New Mineral Site" visible={visible} onCancel={onClose} footer={null} width="70%">
      <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ refAppliedToAll: true, deposittypeconfidence: 1, type: "NotSpecified", rank: "U", gradeUnit: "%", tonnageUnit: "mt" }}>
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
            <Form.Item name="stateorprovince" label="State or Province" rules={[{ required: true }]}>
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
            <Form.Item name="deposittype" label="Deposit Type" rules={[{ required: true }]}>
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
              name="deposittypeconfidence"
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
                  <Select placeholder="Select unit" options={unitOptions} style={{ width: "40%" }} showSearch optionFilterProp="label" />
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
                  <Select placeholder="Select unit" options={unitOptions} style={{ width: "40%" }} showSearch optionFilterProp="label" />
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
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
