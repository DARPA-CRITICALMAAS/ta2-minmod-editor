import React from "react";
import { Button, Checkbox, Form, Input, Modal, Space, message, Row, Col, Select, Typography } from "antd";
import { useStores, Commodity, DraftCreateMineralSite, CandidateEntity, initNonCriticalStores, DepositType, Unit } from "models";
import { LocationInfo } from "../../../models/mineralSite/LocationInfo";
import { Reference, Document } from "../../../models/mineralSite/Reference";
import { GradeTonnage } from "../../../models/mineralSite/GradeTonnage";
import { CommodityStore } from "models/commodity";
import { DedupMineralSite, DedupMineralSiteLocation } from "../../../models/dedupMineralSite";
import axios from "axios";
import { Country, StateOrProvince } from "models";
import { useEffect, useState } from "react";

interface NewMineralSiteModalProps {
    commodity: Commodity;
    visible: boolean;
    onClose: () => void;
}

export const NewMineralSiteModal: React.FC<NewMineralSiteModalProps> = ({
    commodity,
    visible,
    onClose,
}) => {
    const {
        mineralSiteStore,
        dedupMineralSiteStore,
        userStore,
        commodityStore,
        countryStore,
        stateOrProvinceStore,
        depositTypeStore,
        unitStore
    } = useStores();
    const [form] = Form.useForm();
    const [commodityOptions, setCommodityOptions] = useState<{ value: string; label: string }[]>([]);
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
    const [depositTypeOptions, setDepositTypeOptions] = useState<{ value: string; label: string }[]>([]);
    const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        commodityStore.fetchCriticalCommotities().then((commodities) => {
            setCommodityOptions(commodities.map((comm: { id: string; name: string }) => ({ value: comm.id, label: comm.name, })));
        });

        countryStore.fetchAll().then(() => {
            setCountryOptions(Array.from(countryStore.records.values()).filter((country): country is Country => country !== null).map((country: Country) => ({ value: country.id, label: country.name, })));
        });

        stateOrProvinceStore.fetchAll().then(() => {
            setStateOptions(Array.from(stateOrProvinceStore.records.values()).filter((state): state is StateOrProvince => state !== null).map((state: StateOrProvince) => ({ value: state.id, label: state.name, })));
        });

        depositTypeStore.fetchAll().then(() => {
            setDepositTypeOptions(Array.from(depositTypeStore.records.values()).filter((type): type is DepositType => type !== null).map((type) => ({ value: type.id ?? "", label: type.name ?? "Unnamed", })));
        });
        unitStore.fetchAll().then(() => {
            setUnitOptions(Array.from(unitStore.records.values()).filter((unit): unit is Unit => unit !== null).map((unit) => ({ value: unit.id ?? "", label: unit.name ?? "Unnamed", })));
        });
    }, [commodityStore, countryStore, stateOrProvinceStore]);

    const handleSave = async (values: any) => {
        try {
            const currentUser = userStore.getCurrentUser()?.name;
            const createdBy = `https://minmod.isi.edu/users/${currentUser}`;

            let location = undefined;
            if (values.latitude !== undefined && values.longitude !== undefined) {
                location = `POINT (${values.longitude} ${values.latitude})`;
            }

            const countries = values.country
                ? [
                    new CandidateEntity({
                        observedName: values.country,
                        source: values.country,
                        confidence: 1.0

                    }),
                ]
                : [];

            const statesOrProvinces = values.stateorprovince
                ? [
                    new CandidateEntity({
                        observedName: values.stateorprovince,
                        source: values.stateorprovince,
                        confidence: 1.0
                    }),
                ]
                : [];


            const commodity1 = commodity.id
            console.log("COMMOdity", commodity1)
            const referenceDocument = new Document({
                uri: values.refDoc,
                title: values.refDoc,
            });

            const reference = new Reference({
                document: referenceDocument,
                comment: values.refComment || "",
            });

            const draft = new DraftCreateMineralSite({
                id: "",
                draftID: `draft-${Date.now()}`,
                recordId: values.recordId,
                sourceId: values.sourceId,
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
                    })
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
            console.log("newMineralSite", newMineralSite.dedupSiteURI)
            const dedup_site_uri = newMineralSite.dedupSiteURI
            const dedupSite = await dedupMineralSiteStore.forceFetchByURI(
                dedup_site_uri,
                commodity1
            );
            console.log("newMineralSite", newMineralSite)
            message.success("Mineral site created and dedup store updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error saving mineral site:", error);
            message.error("Failed to create mineral site. Please try again.");
        }
    };

    return (
        <Modal
            title="Add New Mineral Site"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width="70%"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ refAppliedToAll: true }}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Name is required" }]}
                >
                    <Input placeholder="Enter site name" />
                </Form.Item>
                <Form.Item
                    name="commodity"
                    label="Commodity"
                    rules={[{ required: true, message: "Commodity is required" }]}
                >
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a commodity"
                        options={commodityOptions} // Use the fetched options
                        showSearch
                        optionFilterProp="label" // Enable search by label
                    />
                </Form.Item>

                <Form.Item
                    name="rank"
                    label="Rank"
                    rules={[{ required: true, message: "Rank is required" }]}
                >
                    <Select
                        style={{ width: "100%" }}
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


                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Type is required" }]}
                >
                    <Select
                        style={{ width: "100%" }}
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

                <Form>
                    <Form.Item
                        name="deposittype"
                        label="Deposit Type"
                        rules={[{ required: true, message: "Deposit Type is required" }]}
                    >
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select a deposit type"
                            options={depositTypeOptions}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>

                </Form>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        refAppliedToAll: true,
                        deposittypeconfidence: 1,
                    }}
                >

                    <Form.Item style={{ paddingTop: "30px" }}
                        name="deposittypeconfidence"
                        label="DepositType Confidence"
                        rules={[{ required: true, message: "Deposit Type confidence is required" }]}
                    >
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter deposit type confidence"
                        />
                    </Form.Item>

                </Form>


                <Form.Item
                    name="stateorprovince"
                    label="State or Province"
                    rules={[{ required: true, message: "State or Province is required" }]}
                >
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a state or province"
                        options={stateOptions}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>

                <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: "Country is required" }]}
                >
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a country"
                        options={countryOptions}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>

                <Form.Item label="Coordinates" required>
                    <Space direction="horizontal" size="middle" style={{ display: "flex", width: "100%" }}>
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                            rules={[
                                { required: true, message: "Latitude is required" },
                                { type: "number", min: -90, max: 90, message: "Latitude must be between -90 and 90" },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input
                                type="number"
                                step="0.0001"
                                placeholder="Enter latitude"
                            />
                        </Form.Item>

                        <Form.Item
                            name="longitude"
                            label="Longitude"
                            rules={[
                                { required: true, message: "Longitude is required" },
                                { type: "number", min: -180, max: 180, message: "Longitude must be between -180 and 180" },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input
                                type="number"
                                step="0.0001"
                                placeholder="Enter longitude"
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>


                <Form layout="vertical">
                    {/* Grade */}
                    <Form.Item
                        label="Grade"
                        required
                    >
                        <Row gutter={8}>
                            <Col span={16}>
                                <Form.Item
                                    name="grade"
                                    noStyle
                                    rules={[{ required: true, message: "Grade value is required" }]}
                                >
                                    <Input type="number" step="0.01" placeholder="Enter grade value" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="gradeUnit"
                                    noStyle
                                    rules={[{ required: true, message: "Unit is required" }]}
                                >
                                    <Select
                                        placeholder="Select unit"
                                        options={unitOptions}
                                        showSearch
                                        optionFilterProp="label"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>

                    {/* Tonnage */}
                    <Form.Item
                        label="Tonnage"
                        required
                    >
                        <Row gutter={8}>
                            <Col span={16}>
                                <Form.Item
                                    name="tonnage"
                                    noStyle
                                    rules={[{ required: true, message: "Tonnage value is required" }]}
                                >
                                    <Input type="number" step="0.01" placeholder="Enter tonnage value" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="tonnageUnit"
                                    noStyle
                                    rules={[{ required: true, message: "Unit is required" }]}
                                >
                                    <Select
                                        placeholder="Select unit"
                                        options={unitOptions}
                                        showSearch
                                        optionFilterProp="label"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>

                <Form.Item
                    name="refDoc"
                    label="Reference Document URL"
                    rules={[{ required: true, message: "Reference document URL is required" }]}
                >
                    <Input placeholder="Enter reference document URL" />
                </Form.Item>

                <Form.Item name="refComment" label="Reference Comment">
                    <Input.TextArea rows={3} placeholder="Add comments about the reference" />
                </Form.Item>

                <Form.Item
                    name="refAppliedToAll"
                    valuePropName="checked"
                >
                    <Checkbox>This reference applies to all fields</Checkbox>
                </Form.Item>

                <Form.Item
                    name="sourceId"
                    label="Source ID"
                    rules={[{ required: true, message: "Source ID is required" }]}
                >
                    <Input placeholder="Enter source ID" />
                </Form.Item>

                <Form.Item
                    name="recordId"
                    label="Record ID"
                    rules={[{ required: true, message: "Record ID is required" }]}
                >
                    <Input placeholder="Enter record ID" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};