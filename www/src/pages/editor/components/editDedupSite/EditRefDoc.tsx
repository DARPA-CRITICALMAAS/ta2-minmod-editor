import { Document, User, useStores } from "models";
import { Flex, Form, Input, Radio, Select, Space, Typography } from "antd";
import { FormLabel } from "components/FormLabel";
import { observer } from "mobx-react-lite";
import { isValidUrl } from "misc";
import { zip } from "lodash";
import { CDR_DOCUMENT_URL_PREFIX, MineralSite } from "models/mineralSite";
import { useMemo } from "react";

// New reference for a mineral site
export class RefDocV2 {
  public sourceId: string;
  public recordId: string;
  public document: Document;

  public constructor({ sourceId, recordId, document }: { sourceId: string; recordId: string; document: Document }) {
    this.sourceId = sourceId;
    this.recordId = recordId;
    this.document = document;
  }

  static empty(): RefDocV2 {
    return new RefDocV2({
      sourceId: "",
      recordId: "",
      document: new Document({ uri: "", title: "" }),
    });
  }

  static fromSite(site: MineralSite): RefDocV2 {
    return new RefDocV2({
      sourceId: site.sourceId,
      recordId: site.recordId,
      document: site.getDocument(),
    });
  }

  public isValid(): boolean {
    return this.sourceId !== "" && this.recordId !== "" && this.document.isValid();
  }
}

export interface EditRefDocProps {
  availableDocs: RefDocV2[];
  value?: RefDocV2;
  onChange?: (doc: RefDocV2) => void;
}

export const EditRefDoc: React.FC<EditRefDocProps> = observer(({ availableDocs, value: doc, onChange: onChangeArg }) => {
  const { userStore, sourceStore } = useStores();

  const options: object[] = availableDocs.map((refdoc: RefDocV2, index: number) => {
    let title = refdoc.document.title || refdoc.document.uri;
    return { value: index, label: title };
  });
  options.push({ value: availableDocs.length, label: <Typography.Text italic={true}>Enter your own</Typography.Text> });
  const onChange = onChangeArg === undefined ? (doc: RefDocV2) => {} : onChangeArg;

  const onUpdateOption = (index: number) => {
    if (index === availableDocs.length) {
      onChange(RefDocV2.empty());
    } else {
      onChange(availableDocs[index]);
    }
  };

  let selectOptionValue = doc === undefined ? -1 : availableDocs.findIndex((availableDoc) => availableDoc.sourceId === doc.sourceId && availableDoc.recordId === doc.recordId);
  if (selectOptionValue === -1) {
    selectOptionValue = availableDocs.length; // If the document is not found, we assume the user wants to enter their own.
  }
  const selectOption = (
    <Select
      style={{ width: "100%" }}
      options={options}
      value={doc === undefined ? undefined : selectOptionValue}
      onChange={(value) => onUpdateOption(value)}
      optionRender={(option) => {
        const index = option.value as number;
        if (index >= availableDocs.length) {
          return option.label; // This is the "Enter your own" option
        }

        const refdoc = availableDocs[index];
        let desc = undefined;

        // The description is recordId for database
        const source = sourceStore.get(refdoc.sourceId);
        if (source !== null && source !== undefined) {
          if (source.type === "database" || source.type === "mining-report") {
            desc = `Record ID: ${refdoc.recordId}`;
          } else if (source.type === "article") {
            desc = (
              <a href={refdoc.document.uri} target="_blank" rel="noopener noreferrer">
                {refdoc.document.uri}
              </a>
            );
          } else if (source.type === "unpublished") {
            desc = `User: ${refdoc.sourceId}`;
          }
        }

        return (
          <Space direction="vertical">
            <Typography.Text>{option.label}</Typography.Text>
            {desc !== undefined && <Typography.Text type="secondary">{desc}</Typography.Text>}
          </Space>
        );
      }}
    />
  );

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {selectOption}
      {doc !== undefined && <EditSource document={doc} currentUser={userStore.getCurrentUser()!} updateDocument={onChange} disabled={selectOptionValue < availableDocs.length} />}
    </Space>
  );
});

export const EditSource: React.FC<{ document: RefDocV2; currentUser: User; updateDocument: (doc: RefDocV2) => void; disabled: boolean }> = observer(
  ({ document: doc, currentUser, updateDocument, disabled }) => {
    const { sourceStore } = useStores();

    let docType;
    let errorMessage = undefined;
    if (doc.document.uri === currentUser.url) {
      docType = "unpublished";
    } else if (doc.document.isCDRDocument()) {
      docType = "report";
      if (!doc.document.isValidCDRDocumentId()) {
        errorMessage = "Invalid CDR document ID";
      }
    } else {
      // we know that the source is going to be fetched in other components, so we don't need to fetch it here.
      const source = sourceStore.get(doc.sourceId);
      if (source !== null && source !== undefined) {
        docType = source.type;
      } else {
        if (doc.sourceId === "") {
          docType = doc.recordId === "1" ? "database" : "article";
        } else {
          docType = "article";
        }
      }
      if (!doc.document.isValid()) {
        errorMessage = "Invalid Document URL";
      }
    }

    const updateDocType = (e: any) => {
      const value = e.target.value;
      if (value === "report") {
        updateDocument(new RefDocV2({ sourceId: CDR_DOCUMENT_URL_PREFIX, recordId: "", document: Document.cdrDocument("", "") }));
      } else if (value === "article") {
        updateDocument(new RefDocV2({ sourceId: "", recordId: "na", document: new Document({ uri: "", title: "" }) }));
      } else if (value === "database") {
        updateDocument(new RefDocV2({ sourceId: "", recordId: "1", document: new Document({ uri: "", title: "" }) }));
      } else {
        updateDocument(new RefDocV2({ sourceId: currentUser.url, recordId: "", document: new Document({ uri: currentUser.url, title: `Unpublished document by ${currentUser.name}` }) }));
      }
    };

    const updateDocTitle = (e: any) => {
      const value = e.target.value;
      const newdoc = doc.document.clone();
      newdoc.title = value;
      updateDocument(new RefDocV2({ sourceId: doc.sourceId, recordId: doc.recordId, document: newdoc }));
    };

    const updateDocURI = (e: any) => {
      const value = e.target.value;
      const newdoc = doc.document.clone();
      newdoc.uri = value;
      updateDocument(new RefDocV2({ sourceId: value, recordId: doc.recordId, document: newdoc }));
    };

    let content = undefined;
    if (docType === "report") {
      content = (
        <>
          <div style={{ width: "100%" }}>
            <FormLabel label="Title" />
            <Input placeholder={"Document Title"} value={doc.document.title} onChange={updateDocTitle} disabled={disabled} />
          </div>
          <div style={{ width: "100%" }}>
            <FormLabel label="Document ID" required={true} tooltip="CDR ID of document e.g., 02a000a83e76360bec8f3fce2ff46cc8099f950cc1f757f8a16592062c49b3a5c5" />
            <Input placeholder={"Document ID"} value={doc.document.getCDRDocumentId()} onChange={updateDocURI} disabled={disabled} />
            {errorMessage !== undefined && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
          </div>
        </>
      );
    } else if (docType === "article") {
      content = (
        <>
          <div style={{ width: "100%" }}>
            <FormLabel label="Title" />
            <Input placeholder={"Document Title"} value={doc.document.title} onChange={updateDocTitle} disabled={disabled} />
          </div>
          <div style={{ width: "100%" }}>
            <FormLabel label="Document URL" required={true} tooltip="If the document has a DOI, please enter the DOI URL such as https://doi.org/10.1016/j.oregeorev.2016.08.010" />
            <Input placeholder={"Document URL"} value={doc.document.uri} onChange={updateDocURI} disabled={disabled} />
            {errorMessage !== undefined && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
          </div>
        </>
      );
    } else if (docType === "database") {
      content = (
        <DBReference
          sourceId={doc.sourceId}
          recordId={doc.recordId}
          doc={doc.document}
          updateSourceRecordId={({ sourceId, recordId }: { sourceId: string; recordId: string }) => {
            const newdoc = doc.document.clone();
            newdoc.uri = sourceId;
            updateDocument(new RefDocV2({ sourceId, recordId, document: newdoc }));
          }}
          errorMessage={errorMessage}
          disabled={disabled}
        />
      );
    } else {
      content = (
        <div style={{ width: "100%" }}>
          <FormLabel label="Title" />
          <Input placeholder={"Document Title"} value={doc.document.title} onChange={updateDocTitle} disabled={disabled} />
        </div>
      );
    }

    return (
      <Flex gap="middle" align="start" vertical={true} style={{ border: "1px dashed #ddd", borderRadius: 4, padding: 8 }}>
        <Radio.Group value={docType} onChange={updateDocType} disabled={disabled}>
          <Radio value="report">CDR Document</Radio>
          <Radio value="article">Article</Radio>
          <Radio value="database">Database</Radio>
          <Radio value="unpublished">Unpublished</Radio>
        </Radio.Group>
        {content}
      </Flex>
    );
  }
);

export const DBReference = observer(
  ({
    sourceId,
    recordId,
    doc,
    updateSourceRecordId,
    errorMessage,
    disabled,
  }: {
    updateSourceRecordId: ({ sourceId, recordId }: { recordId: string; sourceId: string }) => void;
    sourceId: string;
    recordId: string;
    doc: Document;
    errorMessage?: string;
    disabled?: boolean;
  }) => {
    const { sourceStore } = useStores();

    const dbs = useMemo(() => {
      return sourceStore
        .filter((source) => source.type === "database")
        .map((source) => {
          return { value: source.id, label: source.name };
        });
    }, [sourceStore.records.size]);

    return (
      <>
        <div style={{ width: "100%" }}>
          <FormLabel label="Database" />
          <Select
            style={{ width: "100%" }}
            options={dbs}
            value={sourceId}
            onChange={(value) => updateSourceRecordId({ sourceId: value, recordId })}
            showSearch={true}
            optionFilterProp="label"
            disabled={disabled}
          />
        </div>
        <div style={{ width: "100%" }}>
          <FormLabel label="Record ID" required={true} tooltip="The ID of the mineral site in the database. For example, in MRDS, it is `dep_id`." />
          <Input placeholder={"Record ID"} value={recordId} onChange={(e) => updateSourceRecordId({ sourceId, recordId: e.target.value })} disabled={disabled} />
          {errorMessage !== undefined && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
        </div>
      </>
    );
  }
);
