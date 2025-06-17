import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { Coordinates, LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite } from "../dedupMineralSite";
import { MineralInventory } from "./MineralInventory";
import { IStore, User } from "models";
import { InternalID } from "models/typing";
import { GeologyInfo } from "./GeologyInfo";

export type EditableField = "name" | "siteType" | "siteRank" | "location" | "country" | "stateOrProvince" | "depositType" | "grade" | "tonnage";
export type FieldEdit =
  | { field: "name"; value: string }
  | { field: "siteType"; value: string }
  | { field: "siteRank"; value: string }
  | { field: "location"; value: string }
  | { field: "country"; observedName: string; normalizedURI: string }
  | { field: "stateOrProvince"; observedName: string; normalizedURI: string }
  | { field: "depositType"; observedName: string; normalizedURI: string }
  | {
    field: "grade";
    value: number;
    commodity: InternalID;
  }
  | { field: "tonnage"; value: number; commodity: InternalID };

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
  reference: Reference;
  modifiedAt?: string;

  coordinates?: Coordinates;
  gradeTonnage: { [commodity: InternalID]: GradeTonnage };
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
  reference: Reference;
  modifiedAt?: string;
  coordinates?: Coordinates;
  gradeTonnage: { [commodity: InternalID]: GradeTonnage };

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

  getDocument(): Document {
    return this.reference.document;
  }

  updateField(stores: IStore, edit: FieldEdit, reference: Reference) {
    switch (edit.field) {
      case "name":
        this.name = edit.value.trim();
        break;
      case "siteType":
        this.siteType = edit.value === "NotSpecified" ? undefined : edit.value.trim();
        break;
      case "siteRank":
        this.siteRank = edit.value === "U" ? undefined : edit.value.trim();
        break;
      case "location":
        if (this.locationInfo === undefined) {
          this.locationInfo = new LocationInfo({ location: edit.value.trim(), country: [], stateOrProvince: [] });
        } else {
          this.locationInfo.location = edit.value.trim();
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

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy, this.gradeTonnage[edit.commodity], reference)];
        break;
      default:
        throw new Error(`Unknown edit: ${edit}`);
    }

    if (this.reference.document.uri !== reference.document.uri) {
      throw new Error(`Reference document URI mismatch: ${this.reference.document.uri} !== ${reference.document.uri}. A mineral Site should not reference to multiple documents.`);
    }
    this.reference = reference;
  }

  getFieldValue(field: EditableField, commodity: InternalID): string | undefined {
    switch (field) {
      case "name":
        return this.name;
      case "siteType":
        return this.siteType;
      case "siteRank":
        return this.siteRank;
      case "location":
        return this.locationInfo?.location;
      case "country":
        return this.locationInfo?.country[0]?.normalizedURI;
      case "stateOrProvince":
        return this.locationInfo?.stateOrProvince[0]?.normalizedURI;
      case "depositType":
        return this.depositTypeCandidate[0]?.normalizedURI;
      case "grade":
        return this.gradeTonnage[commodity]?.totalGrade?.toString();
      case "tonnage":
        return this.gradeTonnage[commodity]?.totalTonnage?.toString();
    }
  }
}

export class DraftCreateMineralSite extends MineralSite {
  draftID: string;

  constructor({ draftID, ...rest }: { draftID: string } & MineralSiteConstructorArgs) {
    super(rest);
    this.draftID = draftID;
  }

  public static fromMineralSite(dedupMineralSite: DedupMineralSite, user: User, sourceId: string, recordId: string, reference: Reference): DraftCreateMineralSite {
    return new DraftCreateMineralSite({
      draftID: `draft-${dedupMineralSite.id}`,
      id: "", // backend does not care about uri as they will recalculate it
      sourceId,
      recordId,
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
      reference: reference,
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
