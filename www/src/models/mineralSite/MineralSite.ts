import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite, DedupMineralSiteLocation } from "models/dedupMineralSite";
import { DepositTypeStore } from "models/depositType";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { CountryStore } from "models/country";
import { MineralInventory } from "./MineralInventory";
import { IStore } from "models";

export type EditableField = "name" | "location" | "depositType" | "grade" | "tonnage";
export type FieldEdit =
  | { field: "name"; value: string }
  | { field: "location"; value: string }
  | { field: "depositType"; observedName: string; normalizedURI: string }
  | {
      field: "grade";
      value: number;
      commodity: string;
    }
  | { field: "tonnage"; value: number; commodity: string };

export type MineralSiteConstructorArgs = {
  uri: string;
  recordId: string;
  sourceId: string;
  dedupSiteURI: string;
  createdBy: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  gradeTonnage: { [commodity: string]: GradeTonnage };
  mineralInventory: MineralInventory[];
};

export class MineralSite {
  uri: string;
  sourceId: string;
  recordId: string;
  dedupSiteURI: string;
  createdBy: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  gradeTonnage: { [commodity: string]: GradeTonnage };
  mineralInventory: MineralInventory[];

  public constructor({ uri, recordId, sourceId, createdBy, name, locationInfo, depositTypeCandidate, reference, sameAs, gradeTonnage, dedupSiteURI, mineralInventory }: MineralSiteConstructorArgs) {
    this.uri = uri;
    this.recordId = recordId;
    this.sourceId = sourceId;
    this.dedupSiteURI = dedupSiteURI;
    this.createdBy = createdBy;
    this.name = name;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.reference = reference;
    this.sameAs = sameAs;
    this.gradeTonnage = gradeTonnage;
    this.mineralInventory = mineralInventory;
  }

  get id() {
    return this.uri;
  }

  getReferencedDocuments(): { [uri: string]: Document } {
    const docs: { [uri: string]: Document } = {};
    for (const ref of this.reference) {
      docs[ref.document.uri] = ref.document;
    }
    return docs;
  }

  getFirstReferencedDocument(): Document {
    return this.reference[0].document;
  }

  updateField(stores: IStore, edit: FieldEdit, reference: Reference) {
    switch (edit.field) {
      case "name":
        this.name = edit.value;
        break;
      case "location":
        this.locationInfo.location = edit.value;
        break;
      case "depositType":
        this.depositTypeCandidate = [
          new CandidateEntity({
            source: this.createdBy[0], // this works because createdBy is a single item array for experts
            confidence: 1.0,
            normalizedURI: edit.normalizedURI,
            observedName: edit.observedName,
          }),
        ];
        break;
      case "grade":
        if (this.gradeTonnage[edit.commodity] === undefined) {
          this.gradeTonnage[edit.commodity] = new GradeTonnage({
            commodity: edit.commodity,
            totalGrade: edit.value,
            totalTonnage: 0.00001,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalGrade = edit.value;
        }

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy[0], this.gradeTonnage[edit.commodity], reference)];
        break;
      case "tonnage":
        if (this.gradeTonnage[edit.commodity] === undefined) {
          this.gradeTonnage[edit.commodity] = new GradeTonnage({
            commodity: edit.commodity,
            totalTonnage: edit.value,
            totalGrade: 0.00001,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalTonnage = edit.value;
        }

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy[0], this.gradeTonnage[edit.commodity], reference)];
        break;
      default:
        throw new Error(`Unknown edit: ${edit}`);
    }

    // TODO: fix me, we need to avoid duplicated reference
    this.reference.push(reference);
  }
}

export class DraftCreateMineralSite extends MineralSite {
  draftID: string;

  constructor({ draftID, ...rest }: { draftID: string } & MineralSiteConstructorArgs) {
    super(rest);
    this.draftID = draftID;
  }

  public static fromMineralSite(
    stores: { depositTypeStore: DepositTypeStore; stateOrProvinceStore: StateOrProvinceStore; countryStore: CountryStore },
    dedupMineralSite: DedupMineralSite,
    sites: MineralSite[],
    username: string,
    reference: Reference
  ): DraftCreateMineralSite {
    const baseSite = sites[0].uri === dedupMineralSite.sites[0] ? sites[0] : sites.filter((site) => site.uri === dedupMineralSite.sites[0])[0];
    const createdBy = `https://minmod.isi.edu/users/${username}`;
    const confidence = 1.0;

    return new DraftCreateMineralSite({
      draftID: `draft-${dedupMineralSite.id}`,
      uri: "", // backend does not care about uri as they will recalculate it
      sourceId: DraftCreateMineralSite.updateSourceId(baseSite.sourceId, username),
      recordId: baseSite.recordId,
      dedupSiteURI: dedupMineralSite.uri,
      createdBy: [createdBy],
      name: dedupMineralSite.name,
      locationInfo: (
        dedupMineralSite.location ||
        new DedupMineralSiteLocation({
          country: [],
          stateOrProvince: [],
        })
      )?.toLocationInfo(stores, createdBy, confidence),
      depositTypeCandidate: dedupMineralSite.depositTypes.length > 0 ? [dedupMineralSite.getTop1DepositType()!.toCandidateEntity(stores)] : [],
      reference: [reference],
      sameAs: dedupMineralSite.sites,
      gradeTonnage: {
        [dedupMineralSite.gradeTonnage.commodity]: dedupMineralSite.gradeTonnage,
      },
      mineralInventory: [],
    });
  }

  public static updateSourceId(sourceId: string, username: string): string {
    const [sourceType, sourceIdent] = sourceId.split("::", 2);
    const url = new URL(sourceIdent);
    url.searchParams.set("username", username);
    return `${sourceType}::${url.toString()}`;
  }
}

export class DraftUpdateMineralSite extends MineralSite {
  isSaved: boolean = true;

  // TODO: fix me!!
  get id() {
    return DedupMineralSite.getId(this.uri);
  }

  updateField(stores: IStore, edit: FieldEdit, reference: Reference) {
    super.updateField(stores, edit, reference);
    this.isSaved = false;
  }

  markSaved() {
    this.isSaved = true;
  }

  toModel(): MineralSite {
    return new MineralSite(this);
  }
}