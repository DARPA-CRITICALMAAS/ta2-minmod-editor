import { Document } from "models";
import { Form, Input, Select, Space, Typography } from "antd";
import { useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
export interface EditRefDocProps {
  availableDocs: Document[];
  value?: Document;
  onChange?: (doc?: Document) => void;
}

const UNSELECT_VALUE = "e269e284cd592d703cb477fc2075cfde6ebfa9299e06deb0850f6061f72a6a9f";

export const EditRefDoc: React.FC<EditRefDocProps> = ({ availableDocs, value: doc, onChange }) => {
  const options: object[] = availableDocs.map((doc) => ({ value: doc.uri, label: doc.title || doc.uri }));
  options.push({ value: UNSELECT_VALUE, label: <Typography.Text italic={true}>Enter your own</Typography.Text> });

  if (onChange === undefined) {
    onChange = (doc?: Document) => {};
  }

  const onUpdateOption = (uri: string) => {
    if (uri === UNSELECT_VALUE) {
      onChange(new Document({ uri: "", title: "" }));
    } else {
      const found = availableDocs.find((doc) => doc.uri === uri);
      if (found) {
        onChange(found);
      }
    }
  };

  const isEnteringYourOwn = doc !== undefined && availableDocs.every((availableDoc) => availableDoc.uri !== doc.uri);
  console.log("isEnteringYourOwn", isEnteringYourOwn);

  if (isEnteringYourOwn) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Typography.Text>Document Title:</Typography.Text>
          <Input
            value={doc.title}
            onChange={(e) => {
              const title = e.target.value;
              onChange(new Document({ uri: doc.uri, title }));
            }}
            placeholder={"Enter title of the document"}
            suffix={
              <CloseCircleOutlined
                style={{ color: "rgba(0,0,0,.25)" }}
                onClick={() => {
                  onChange(new Document({ uri: doc.uri, title: "" }));
                }}
              />
            }
          />
        </div>
        <div>
          <Typography.Text>Document URL*:</Typography.Text>
          <Input
            value={doc?.uri}
            onChange={(e) => {
              const uri = e.target.value;
              onChange(new Document({ uri, title: doc.title }));
            }}
            placeholder={"Enter URL of a document. If the document has a DOI, please enter the DOI URL: https://doi.org/10.1016/j.oregeorev.2016.08.010"}
            suffix={
              <CloseCircleOutlined
                style={{ color: "rgba(0,0,0,.25)" }}
                onClick={() => {
                  onChange(undefined);
                }}
              />
            }
          />
        </div>
      </Space>
    );
  }
  return <Select options={options} value={doc === null || doc === undefined ? undefined : doc.uri} onChange={(uri) => onUpdateOption(uri)} />;
};
