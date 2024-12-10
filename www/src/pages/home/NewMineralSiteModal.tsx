import React from "react";
import { Button, Checkbox, Form, Input, Modal, Space, message } from "antd";
import { useStores, Commodity, DraftCreateMineralSite, CandidateEntity } from "models";
import { LocationInfo } from "../../models/mineralSite/LocationInfo";
import { Reference, Document } from "../../models/mineralSite/Reference";
import { GradeTonnage } from "../../models/mineralSite/GradeTonnage";
import { CommodityStore } from "models/commodity";
import { DedupMineralSite, DedupMineralSiteLocation } from "../../models/dedupMineralSite";
import axios from "axios";

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
    const { mineralSiteStore, dedupMineralSiteStore, userStore } = useStores();
    const [form] = Form.useForm();

    const handleSave = async (values: any) => {
        try {
            const currentUser = userStore.getCurrentUser()?.name;
            const createdBy = `https://minmod.isi.edu/users/${currentUser}`;


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
                    location: values.location || "",
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
                    <Input placeholder="Enter commodity" />
                </Form.Item>

                <Form.Item
                    name="rank"
                    label="Rank"
                    rules={[{ required: true, message: "Rank is required" }]}
                >
                    <Input placeholder="Enter site rank" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Type is required" }]}
                >
                    <Input placeholder="Enter site type" />
                </Form.Item>

                <Form.Item
                    name="deposittype"
                    label="DepositType"
                    rules={[{ required: true, message: "Deposit Type is required" }]}
                >
                    <Input placeholder="Enter site type" />
                </Form.Item>
                <Form.Item
                    name="deposittypeconfidence"
                    label="DepositType confidence"
                    rules={[{ required: true, message: "Deposit Type is required" }]}
                >
                    <Input placeholder="Enter deposit type confidence" />
                </Form.Item>

                <Form.Item
                    name="stateorprovince"
                    label="State or Province"
                    rules={[{ required: true, message: "State or Province is required" }]}
                >
                    <Input placeholder="Enter state or province" />
                </Form.Item>

                <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: "Country is required" }]}
                >
                    <Input placeholder="Enter country" />
                </Form.Item>

                <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: "Location is required" }]}
                >
                    <Input placeholder="Enter location" />
                </Form.Item>

                <Form.Item
                    name="grade"
                    label="Grade (%)"
                    rules={[{ required: true, message: "Grade is required" }]}
                >
                    <Input type="number" step="0.01" placeholder="Enter grade percentage" />
                </Form.Item>

                <Form.Item
                    name="tonnage"
                    label="Tonnage (Mt)"
                    rules={[{ required: true, message: "Tonnage is required" }]}
                >
                    <Input type="number" step="0.01" placeholder="Enter tonnage in Mt" />
                </Form.Item>

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
