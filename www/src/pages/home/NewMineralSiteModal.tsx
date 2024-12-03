import { Button, Checkbox, Form, Input, Modal, Select, Space } from "antd";
import { useStores, Commodity, DedupMineralSite, MineralSite, CandidateEntity, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { CountryStore } from "models/country";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { InternalID } from "models/typing";
import React from "react";

interface NewMineralSiteModalProps {
    visible: boolean;
    onClose: () => void;
    commodity?: Commodity;
}
export const NewMineralSiteModal: React.FC<NewMineralSiteModalProps> = ({
    visible,
    onClose,
    commodity,
}) => {
    const { depositTypeStore, mineralSiteStore, userStore } = useStores();
    const [form] = Form.useForm();

    const handleSave = async (values: any) => {
        console.log("clicked")
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
                    name="rank"
                    label="Rank"
                    rules={[{ required: true, message: "Name is required" }]}
                >
                    <Input placeholder="Enter site Rank" />
                </Form.Item>


                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Type is required" }]}
                >
                    <Input placeholder="Enter site Type" />
                </Form.Item>

                <Form.Item
                    name="stateorprovince"
                    label="State or Province"
                    rules={[{ required: true, message: "Type is required" }]}
                >
                    <Input placeholder="Enter site stateorprovince" />
                </Form.Item>

                <Form.Item
                    name="Country"
                    label="Country"
                    rules={[{ required: true, message: "Type is required" }]}
                >
                    <Input placeholder="Enter site Location" />
                </Form.Item>

                <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: "Location is required" }]}
                >
                    <Input placeholder="Enter site location" />
                </Form.Item>

                <Form.Item
                    name="depositType"
                    label="Deposit Type"
                    rules={[{ required: true, message: "Deposit Type is required" }]}
                >
                    <Input placeholder="Enter site Deposit" />

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

                <Form.Item name="refAppliedToAll" valuePropName="checked">
                    <Checkbox>This reference applies to all fields</Checkbox>
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
