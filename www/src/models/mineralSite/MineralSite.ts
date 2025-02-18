import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { Coordinates, LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite } from "../dedupMineralSite";
import { DepositTypeStore } from "models/depositType";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { CountryStore } from "models/country";
import { MineralInventory } from "./MineralInventory";
import { IStore, User } from "models";
import { InternalID } from "models/typing";
import { GeologyInfo } from "./GeologyInfo";

export type EditableField = "name" | "location" | "country" | "stateOrProvince" | "depositType" | "grade" | "tonnage" |"mineral-form" | "alternation" | "concentration-process" | "ore-control" | "host-rock-unit" | "host-rock-type" | "structure" | "associated-rock-unit" | "associated-rock-type" | "tectonic" | "discovered-year";
export type FieldEdit =
  | { field: "name"; value: string }
  | { field: "location"; value: string }
  | { field: "country"; observedName: string; normalizedURI: string }
  | { field: "stateOrProvince"; observedName: string; normalizedURI: string }
  | { field: "depositType"; observedName: string; normalizedURI: string }
  | {
      field: "grade";
      value: number;
      commodity: string;
    }
  | { field: "tonnage"; value: number; commodity: string }
  | {field : "mineral-form"; value :string}
  | {field : "alternation"; value :string}
  | {field : "discovered-year"; value: number};

export type MineralSiteConstructorArgs = {
  id: InternalID;
  sourceId: string;
  recordId: string;
  dedupSiteURI: string;
  name?: string;
  createdBy: string;
  aliases: string[];
  siteRank?: string;
  siteType?: string;
  locationInfo?: LocationInfo;
  depositTypeCandidate: CandidateEntity[];

  mineralForm: string[];
  geologyInfo?: GeologyInfo;
  mineralInventory: MineralInventory[];
  discoveredYear?: number;
  reference: Reference[];
  modifiedAt?: string;

  coordinates?: Coordinates;
  gradeTonnage: { [commodity: string]: GradeTonnage };
};

export class MineralSite {
  id: InternalID;
  sourceId: string;
  recordId: string;
  dedupSiteURI: string;
  name?: string;
  createdBy: string;
  aliases: string[];
  siteRank?: string;
  siteType?: string;
  locationInfo?: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  mineralForm: string[];
  geologyInfo?: GeologyInfo;
  mineralInventory: MineralInventory[];
  discoveredYear?: number;
  reference: Reference[];
  modifiedAt?: string;
  coordinates?: Coordinates;
  gradeTonnage: { [commodity: string]: GradeTonnage };

  public constructor({
    id,
    sourceId,
    recordId,
    dedupSiteURI,
    name,
    createdBy,
    aliases,
    siteRank,
    siteType,
    locationInfo,
    depositTypeCandidate,
    mineralForm,
    geologyInfo,
    mineralInventory,
    discoveredYear,
    reference,
    modifiedAt,
    coordinates,
    gradeTonnage,
  }: MineralSiteConstructorArgs) {
    this.id = id;
    this.sourceId = sourceId;
    this.recordId = recordId;
    this.dedupSiteURI = dedupSiteURI;
    this.name = name;
    this.createdBy = createdBy;
    this.aliases = aliases;
    this.siteRank = siteRank;
    this.siteType = siteType;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.mineralForm = mineralForm;
    this.geologyInfo = geologyInfo;
    this.mineralInventory = mineralInventory;
    this.discoveredYear = discoveredYear;
    this.reference = reference;
    this.modifiedAt = modifiedAt;
    this.coordinates = coordinates;
    this.gradeTonnage = gradeTonnage;
  }

  get uri(): string {
    return `https://minmod.isi.edu/resource/${this.id}`;
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
        if (this.locationInfo === undefined) {
          this.locationInfo = new LocationInfo({ location: edit.value, country: [], stateOrProvince: [] });
        } else {
          this.locationInfo.location = edit.value;
        }
        break;
      case "country":
        const country = [
          new CandidateEntity({
            source: this.createdBy, // this works because createdBy is a single item array for experts
            confidence: 1.0,
            normalizedURI: edit.normalizedURI,
            observedName: edit.observedName,
          }),
        ];

        if (this.locationInfo === undefined) {
          this.locationInfo = new LocationInfo({ country, stateOrProvince: [] });
        } else {
          this.locationInfo.country = country;
        }
        break;
      case "stateOrProvince":
        const stateOrProvince = [
          new CandidateEntity({
            source: this.createdBy, // this works because createdBy is a single item array for experts
            confidence: 1.0,
            normalizedURI: edit.normalizedURI,
            observedName: edit.observedName,
          }),
        ];

        if (this.locationInfo === undefined) {
          this.locationInfo = new LocationInfo({ country: [], stateOrProvince });
        } else {
          this.locationInfo.stateOrProvince = stateOrProvince;
        }
        break;
      case "depositType":
        this.depositTypeCandidate = [
          new CandidateEntity({
            source: this.createdBy, // this works because createdBy is a single item array for experts
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
            totalTonnage: 0.0,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalGrade = edit.value;
          if (this.gradeTonnage[edit.commodity].totalTonnage === undefined) {
            this.gradeTonnage[edit.commodity].totalTonnage = 0.0;
          }
        }

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy, this.gradeTonnage[edit.commodity], reference)];
        break;
      case "tonnage":
        if (this.gradeTonnage[edit.commodity] === undefined) {
          this.gradeTonnage[edit.commodity] = new GradeTonnage({
            commodity: edit.commodity,
            totalTonnage: edit.value,
            // set the grade to be very small, so the server is not going to discard this record
            totalGrade: 0.000000001,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalTonnage = edit.value;
          if (this.gradeTonnage[edit.commodity].totalGrade === undefined) {
            this.gradeTonnage[edit.commodity].totalGrade = 0.000000001;
          }
        }
      break;
      case "mineral-form":
        this.mineralForm = this.mineralForm? [edit.value] : [];
      break;
      case "alternation":
        if (this.geologyInfo?.alternation === undefined) {
          this.geologyInfo = new GeologyInfo({alternation: edit.value })
        } else{
          this.geologyInfo.alternation = edit.value;
        }
      break;
      case "discovered-year":
        this.discoveredYear = edit.value;
      break;
      default:
        throw new Error(`Unknown edit: ${edit}`);
    }

    this.reference = [reference];
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
    user: User,
    reference: Reference
  ): DraftCreateMineralSite {
    const baseSite = sites[0].id === dedupMineralSite.sites[0].id ? sites[0] : sites.filter((site) => site.id === dedupMineralSite.sites[0].id)[0];

    return new DraftCreateMineralSite({
      draftID: `draft-${dedupMineralSite.id}`,
      id: "", // backend does not care about uri as they will recalculate it
      sourceId: baseSite.sourceId,
      recordId: baseSite.recordId,
      dedupSiteURI: dedupMineralSite.uri,
      name: undefined,
      createdBy: user.url,
      aliases: [],
      locationInfo: undefined,
      depositTypeCandidate: [],
      mineralForm: [],
      geologyInfo: undefined,
      mineralInventory: [],
      discoveredYear: undefined,
      reference: [reference],
      modifiedAt: new Date().toLocaleString(),
      coordinates: undefined,
      gradeTonnage: {},
    });
  }
}

export class DraftUpdateMineralSite extends MineralSite {
  isSaved: boolean = true;

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
