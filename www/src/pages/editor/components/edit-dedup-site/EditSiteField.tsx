import { Button, Checkbox, Flex, Form, Input, Modal, Select, Space } from "antd";
import _, { create } from "lodash";
import { MineralSite, Reference, EditableField, useStores, Commodity, DedupMineralSite, IStore } from "models";
import { useMemo, useState } from "react";
import { EditRefDoc, RefDocV2 } from "./EditRefDoc";
// import { InternalID } from "models/typing";
// import { DepositTypeStore } from "models/depositType";
// import { CountryStore } from "models/country";
// import { StateOrProvinceStore } from "models/stateOrProvince";
// import { isValidUrl } from "misc";
import { FormItem } from "components/FormItem";
// import { RockType } from "models/mineralSite/GeologyInfo";
import { NameInput } from "./edit-field/NameInput";
import { TypeInput } from "./edit-field/TypeInput";
import { RankInput } from "./edit-field/RankInput";
import { DepositTypeInput } from "./edit-field/DepositTypeInput";
import { LocationInput } from "./edit-field/LocationInput";
import { CountryInput } from "./edit-field/CountryInput";
import { StateOrProvinceInput } from "./edit-field/StateOrProvinceInput";
import { DiscoveredYearInput } from "./edit-field/DiscoveredYearInput";
// import { GradeInput, TonnageInput } from "./edit-field/gradeTonnage";
import { DraftCreateMineralSite, DraftUpdateMineralSite, GradeTonnage } from "models/mineralSite";
import { Measure, MineralInventory } from "models/mineralSite/MineralInventory";
import { InternalID, IRI } from "models/typing";
import { RockType } from "models/mineralSite/GeologyInfo";
import { RockTypeInput } from "./edit-field/RockTypeInput";
import { MineralFormInput } from "./edit-field/MineralFormInput";
import { AlterationInput } from "./edit-field/AlterationInput";
import { ConcentrationProcessInput } from "./edit-field/ConcentrationProcessInput";
import { TectonicInput } from "./edit-field/TectonicInput";
import { StructureInput } from "./edit-field/StructureInput";
import { OreControlInput } from "./edit-field/OreControlInput";
import { MineralInventoryInput } from "./edit-field/MineralInventoryInput";

type FieldValue = {
  name?: string;
  siteType?: string;
  siteRank?: string;
  location?: string;
  country?: { observedName?: string; normalizedURI?: string };
  stateOrProvince?: { observedName?: string; normalizedURI?: string };
  depositType?: { observedName?: string; normalizedURI?: string };
  gradeTonnage?: { ore?: Measure; grade?: Measure };
  discoveredYear?: number;
  mineralForm?: string[];
  alteration?: string;
  concentrationProcess?: string;
  oreControl?: string;
  hostRock?: RockType;
  associatedRock?: RockType;
  structure?: string;
  tectonic?: string;
};

export type FormFields = {
  fieldValue: FieldValue;
  refDoc: RefDocV2 | undefined;
  refComment: string;
};

interface EditSiteFieldProps {
  dedupSite: DedupMineralSite;
  sites: MineralSite[];
  currentSite?: MineralSite;
  commodity: Commodity;
  editField?: EditableField;
  onCancel: () => void;
}

function extractFieldValue(commodity: Commodity, site: MineralSite, editField: EditableField): FieldValue {
  switch (editField) {
    case "name":
      return { name: site.name };
    case "siteType":
      return { siteType: site.siteType };
    case "siteRank":
      return { siteRank: site.siteRank };
    case "location":
      return { location: site.locationInfo?.location };
    case "country":
      return {
        country: site.locationInfo?.country.length
          ? {
              observedName: site.locationInfo.country[0].observedName,
              normalizedURI: site.locationInfo.country[0].normalizedURI,
            }
          : undefined,
      };
    case "stateOrProvince":
      return {
        stateOrProvince: site.locationInfo?.stateOrProvince.length
          ? {
              observedName: site.locationInfo.stateOrProvince[0].observedName,
              normalizedURI: site.locationInfo.stateOrProvince[0].normalizedURI,
            }
          : undefined,
      };
    case "depositType":
      return {
        depositType: site.depositTypeCandidate.length
          ? {
              observedName: site.depositTypeCandidate[0].observedName,
              normalizedURI: site.depositTypeCandidate[0].normalizedURI,
            }
          : undefined,
      };
    case "mineralInventory":
      const inventory = site.mineralInventory.find((inv) => inv.commodity.normalizedURI === commodity.uri);
      return {
        gradeTonnage: {
          ore: inventory?.ore,
          grade: inventory?.grade,
        },
      };
    case "discoveredYear":
      return { discoveredYear: site.discoveredYear };
    case "mineralForm":
      return { mineralForm: site.mineralForm };
    case "alteration":
      return { alteration: site.geologyInfo?.alteration };
    case "concentrationProcess":
      return { concentrationProcess: site.geologyInfo?.concentrationProcess };
    case "oreControl":
      return { oreControl: site.geologyInfo?.oreControl };
    case "hostRock":
      return { hostRock: site.geologyInfo?.hostRock };
    case "associatedRock":
      return { associatedRock: site.geologyInfo?.associatedRock };
    case "structure":
      return { structure: site.geologyInfo?.structure };
    case "tectonic":
      return { tectonic: site.geologyInfo?.tectonic };
    case undefined:
      return {};
    default:
      throw new Error(`Unknown field ${editField}`);
  }
}

function setFieldValue(
  commodity: Commodity,
  draftSite: DraftCreateMineralSite | DraftUpdateMineralSite,
  editField: EditableField,
  fieldValue: FieldValue,
  reference: Reference,
  createdBy: IRI
) {
  switch (editField) {
    case "name":
      draftSite.setName(fieldValue.name || "", reference);
      break;
    case "siteType":
      draftSite.setSiteType(fieldValue.siteType || "", reference);
      break;
    case "siteRank":
      draftSite.setSiteRank(fieldValue.siteRank || "", reference);
      break;
    case "location":
      draftSite.setLocation(fieldValue.location || "", reference);
      break;
    case "country":
      draftSite.setCountry(fieldValue.country || {}, reference);
      break;
    case "stateOrProvince":
      draftSite.setStateOrProvince(fieldValue.stateOrProvince || {}, reference);
      break;
    case "depositType":
      draftSite.setDepositType(fieldValue.depositType || {}, reference);
      break;
    case "mineralInventory":
      const lstInv = draftSite.mineralInventory.filter((inv) => inv.commodity.normalizedURI !== commodity.uri);
      const gradeTonnage = Object.fromEntries(
        Object.entries(draftSite.gradeTonnage).filter(([commodityId, gt]) => commodityId !== commodity.id)
      );
      if (
        fieldValue.gradeTonnage !== undefined &&
        fieldValue.gradeTonnage.ore !== undefined &&
        fieldValue.gradeTonnage.grade !== undefined
      ) {
        const gt = new GradeTonnage({
          commodity: commodity.id,
          totalTonnage: fieldValue.gradeTonnage.ore.toUnit("https://minmod.isi.edu/resource/Q202", createdBy, "Mt")
            .value,
          totalGrade: fieldValue.gradeTonnage.grade.toUnit("https://minmod.isi.edu/resource/Q201", createdBy, "%")
            .value,
        });
        lstInv.push(MineralInventory.fromGradeTonnage(commodity, createdBy, gt, reference));
        gradeTonnage[commodity.id] = gt;
      }

      draftSite.setMineralInventory(
        {
          mineralInventory: lstInv,
          gradeTonnage: gradeTonnage,
        },
        reference
      );
      break;
    case "discoveredYear":
      draftSite.setDiscoveredYear(fieldValue.discoveredYear, reference);
      break;
    case "mineralForm":
      draftSite.setMineralForm(fieldValue.mineralForm || [], reference);
      break;
    case "alteration":
      draftSite.setAlteration(fieldValue.alteration || "", reference);
      break;
    case "concentrationProcess":
      draftSite.setConcentrationProcess(fieldValue.concentrationProcess || "", reference);
      break;
    case "oreControl":
      draftSite.setOreControl(fieldValue.oreControl || "", reference);
      break;
    case "hostRock":
      draftSite.setHostRock(fieldValue.hostRock || new RockType({}), reference);
      break;
    case "associatedRock":
      draftSite.setAssociatedRock(fieldValue.associatedRock || new RockType({}), reference);
      break;
    case "structure":
      draftSite.setStructure(fieldValue.structure || "", reference);
      break;
    case "tectonic":
      draftSite.setTectonic(fieldValue.tectonic || "", reference);
      break;
    case undefined:
      break;
    default:
      throw new Error(`Unknown field ${editField}`);
  }
}

function extractFieldTitle(editField?: EditableField): string {
  switch (editField) {
    case "name":
      return "Name";
    case "siteType":
      return "Site Type";
    case "siteRank":
      return "Site Rank";
    case "location":
      return "Location";
    case "country":
      return "Country";
    case "stateOrProvince":
      return "State or Province";
    case "depositType":
      return "Deposit Type";
    case "mineralInventory":
      return "Mineral Inventory";
    case "discoveredYear":
      return "Discovery Year";
    case "mineralForm":
      return "Mineral Form";
    case "alteration":
      return "Alteration";
    case "concentrationProcess":
      return "Concentration Process";
    case "oreControl":
      return "Ore Control";
    case "hostRock":
      return "Host Rock";
    case "associatedRock":
      return "Associated Rock";
    case "structure":
      return "Structure";
    case "tectonic":
      return "Tectonic";
    case undefined:
      return "";
    default:
      throw new Error(`Unknown field ${editField}`);
  }
}

function isFieldValueValid(fieldValue: FieldValue, editField: EditableField): boolean {
  // the rest of the fields are optional, and when its value is empty, we consider the operation is to
  // remove the previously set value, therefore, it's valid. However, for MineralInventory, we want to ensure
  // that both grade and tonnage are set at the same time.
  if (editField === "mineralInventory") {
    const gt = fieldValue.gradeTonnage;
    if (
      gt !== undefined &&
      (gt.ore?.value === undefined || gt.ore?.value === 0 || gt.grade?.value === undefined || gt.grade?.value === 0)
    ) {
      return false;
    }
  }
  return true;
}

export const EditSiteField: React.FC<EditSiteFieldProps> = ({
  dedupSite,
  currentSite,
  sites,
  editField,
  commodity,
  onCancel,
}) => {
  const { userStore, mineralSiteStore } = useStores();
  const [editData, setEditData] = useState<FormFields>(() => {
    return {
      fieldValue:
        currentSite === undefined || editField === undefined
          ? {}
          : extractFieldValue(commodity, currentSite, editField),
      refDoc: currentSite === undefined ? undefined : RefDocV2.fromSite(currentSite),
      refComment: currentSite === undefined ? "" : currentSite.reference.comment,
    };
  });

  const title = useMemo(() => {
    return extractFieldTitle(editField);
  }, [editField]);

  const setFieldProvenance = (key: string | undefined) => {
    if (currentSite !== undefined) {
      // if the current site is undefined, the reference is not set and can be changed
      // however, if the current site is defined, we don't modify the reference
      return;
    }

    if (key !== undefined) {
      const site = sites.filter((site) => site.id === key)[0];
      setEditData((prev) => ({ ...prev, refDoc: RefDocV2.fromSite(site) }));
    } else {
      setEditData((prev) => ({ ...prev, refDoc: undefined }));
    }
  };

  const docs = _.uniqBy(
    sites.map((site) => RefDocV2.fromSite(site)),
    (doc) => JSON.stringify([doc.sourceId, doc.recordId, doc.document.uri])
  );

  let formItemInputElement = undefined;
  switch (editField) {
    case "name":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <NameInput
            sites={sites}
            setFieldProvenance={setFieldProvenance}
            value={editData.fieldValue.name}
            setValue={(value) => setEditData((prev) => ({ ...prev, fieldValue: { ...prev.fieldValue, name: value } }))}
          />
        </FormItem>
      );
      break;
    case "siteType":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <TypeInput
            sites={sites}
            value={editData.fieldValue.siteType}
            setValue={(value) =>
              setEditData((prev) => ({ ...prev, fieldValue: { ...prev.fieldValue, siteType: value } }))
            }
          />
        </FormItem>
      );
      break;
    case "siteRank":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <RankInput
            sites={sites}
            value={editData.fieldValue.siteRank}
            setValue={(value) =>
              setEditData((prev) => ({ ...prev, fieldValue: { ...prev.fieldValue, siteRank: value } }))
            }
          />
        </FormItem>
      );
      break;
    case "location":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <LocationInput
            sites={sites}
            setFieldProvenance={setFieldProvenance}
            value={editData.fieldValue.location}
            setValue={(value) =>
              setEditData((prev) => ({ ...prev, fieldValue: { ...prev.fieldValue, location: value } }))
            }
          />
        </FormItem>
      );
      break;
    case "country":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <CountryInput
            sites={sites}
            value={editData.fieldValue.country}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  country: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "stateOrProvince":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <StateOrProvinceInput
            sites={sites}
            value={editData.fieldValue.stateOrProvince}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  stateOrProvince: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "depositType":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <DepositTypeInput
            sites={sites}
            value={editData.fieldValue.depositType}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  depositType: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "mineralInventory":
      formItemInputElement = (
        <MineralInventoryInput
          commodity={commodity}
          createdBy={userStore.getCurrentUser()!.url}
          value={editData.fieldValue.gradeTonnage}
          setValue={(value) =>
            setEditData((prev) => ({
              ...prev,
              fieldValue: {
                ...prev.fieldValue,
                gradeTonnage: value,
              },
            }))
          }
        />
      );
      break;
    case "discoveredYear":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <DiscoveredYearInput
            value={editData.fieldValue.discoveredYear}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  discoveredYear: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "mineralForm":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <MineralFormInput
            value={editData.fieldValue.mineralForm}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  mineralForm: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "alteration":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <AlterationInput
            value={editData.fieldValue.alteration}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  alteration: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "concentrationProcess":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <ConcentrationProcessInput
            value={editData.fieldValue.concentrationProcess}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  concentrationProcess: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "oreControl":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <OreControlInput
            value={editData.fieldValue.oreControl}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  oreControl: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "hostRock":
      formItemInputElement = (
        <RockTypeInput
          label={title}
          value={editData.fieldValue.hostRock}
          setValue={(value) =>
            setEditData((prev) => ({
              ...prev,
              fieldValue: {
                ...prev.fieldValue,
                hostRock: value,
              },
            }))
          }
        />
      );
      break;
    case "associatedRock":
      formItemInputElement = (
        <RockTypeInput
          label={title}
          value={editData.fieldValue.associatedRock}
          setValue={(value) =>
            setEditData((prev) => ({
              ...prev,
              fieldValue: {
                ...prev.fieldValue,
                associatedRock: value,
              },
            }))
          }
        />
      );
      break;
    case "structure":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <StructureInput
            value={editData.fieldValue.structure}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  structure: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case "tectonic":
      formItemInputElement = (
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          <TectonicInput
            value={editData.fieldValue.tectonic}
            setValue={(value) =>
              setEditData((prev) => ({
                ...prev,
                fieldValue: {
                  ...prev.fieldValue,
                  tectonic: value,
                },
              }))
            }
          />
        </FormItem>
      );
      break;
    case undefined:
      break;
    default:
      throw new Error(`Unknown field ${editField}`);
  }

  const isDataValid = () => {
    if (editField === undefined) return false;
    const val = editData;
    if (val.refDoc === undefined || !isFieldValueValid(val.fieldValue, editField) || !val.refDoc.isValid()) {
      return false;
    }
    return true;
  };

  const onSave = () => {
    if (editField === undefined) return;
    const val = editData;
    if (val.refDoc === undefined || !isFieldValueValid(val.fieldValue, editField) || !val.refDoc.isValid()) {
      return;
    }

    const currentUser = userStore.getCurrentUser()!;
    const existingSite = sites.find((site) => site.createdBy.includes(currentUser.url));
    const reference = new Reference({
      document: val.refDoc.document,
      comment: val.refComment,
      pageInfo: [],
    });

    let draftSite;
    let cb;
    if (
      existingSite === undefined ||
      existingSite.sourceId !== val.refDoc.sourceId ||
      existingSite.recordId !== val.refDoc.recordId ||
      existingSite.reference.document.uri !== val.refDoc.document.uri
    ) {
      // when reference change, it will be a new site
      draftSite = DraftCreateMineralSite.fromMineralSite(
        dedupSite,
        currentUser,
        val.refDoc.sourceId,
        val.refDoc.recordId,
        reference
      );
    } else {
      draftSite = new DraftUpdateMineralSite(existingSite);
    }

    setFieldValue(commodity, draftSite, editField, val.fieldValue, reference, currentUser.url);

    if (draftSite instanceof DraftUpdateMineralSite) {
      cb = mineralSiteStore.updateAndUpdateDedup(dedupSite.commodity, draftSite);
    } else {
      cb = mineralSiteStore.createAndUpdateDedup(dedupSite.commodity, draftSite);
    }

    cb.then(onCancel);
  };

  return (
    <Modal
      title="Edit Mineral Site"
      width="70%"
      open={editField !== undefined}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Flex gap={16} vertical={true}>
        {formItemInputElement}
        <FormItem label="Reference" name="refDoc" tooltip="Source of the information (required)" required={true}>
          <EditRefDoc
            siteName={dedupSite.name}
            commodityName={commodity.name}
            availableDocs={docs}
            value={editData.refDoc}
            onChange={(doc) => setEditData({ ...editData, refDoc: doc })}
          />
        </FormItem>
        <FormItem name="refComment" label="Comment">
          <Input.TextArea
            rows={3}
            value={editData.refComment}
            onChange={(e) => setEditData({ ...editData, refComment: e.target.value })}
          />
        </FormItem>
        <Space>
          <Button type="primary" htmlType="submit" onClick={onSave} disabled={!isDataValid()}>
            Save
          </Button>
          <Button htmlType="button" onClick={() => onCancel()}>
            Cancel
          </Button>
        </Space>
      </Flex>
    </Modal>
  );
};
