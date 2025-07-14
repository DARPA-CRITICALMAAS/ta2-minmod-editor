import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { Coordinates, LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite } from "../dedupMineralSite";
import { Measure, MineralInventory } from "./MineralInventory";
import { IStore, User } from "models";
import { InternalID } from "models/typing";
import { GeologyInfo, RockType } from "./GeologyInfo";

export type EditableField =
  | "name" | "siteType" | "siteRank"
  | "location" | "country" | "stateOrProvince"
  | "depositType" | "mineralInventory" | "discoveredYear"
  | "mineralForm" | "alteration" | "concentrationProcess"
  | "oreControl" | "hostRock" | "associatedRock" | "structure" | "tectonic";

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

  setName(name: string, reference: Reference) {
    name = name.trim();
    if (name.length === 0) {
      this.name = undefined;
    } else {
      this.name = name;
    }
    this.setReference(reference);
  }

  setSiteType(siteType: string, reference: Reference) {
    siteType = siteType.trim();
    if (siteType.length === 0) {
      throw new Error("Site type cannot be empty.");
    }

    this.siteType = siteType === "NotSpecified" ? undefined : siteType;
    this.setReference(reference);
  }

  setSiteRank(siteRank: string, reference: Reference) {
    siteRank = siteRank.trim();
    if (siteRank.length === 0) {
      throw new Error("Site rank cannot be empty.");
    }

    this.siteRank = siteRank === "U" ? undefined : siteRank;
    this.setReference(reference);
  }

  setLocation(location: string, reference: Reference) {
    location = location.trim();
    if (location.length === 0) {
      if (this.locationInfo !== undefined) {
        this.locationInfo.location = undefined;
        if (this.locationInfo.isEmpty()) {
          this.locationInfo = undefined;
        }
      }
    } else {
      if (this.locationInfo === undefined) {
        this.locationInfo = new LocationInfo({ location, country: [], stateOrProvince: [] });
      } else {
        this.locationInfo.location = location;
      }
    }

    this.setReference(reference);
  }

  setCountry(country: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    if (country.normalizedURI === undefined || country.normalizedURI.length === 0) {
      if (this.locationInfo !== undefined) {
        this.locationInfo.country = [];
        if (this.locationInfo.isEmpty()) {
          this.locationInfo = undefined;
        }
      }
    } else {
      if (this.locationInfo === undefined) {
        this.locationInfo = new LocationInfo({ country: [], stateOrProvince: [] });
      }

      this.locationInfo.country = [
        new CandidateEntity({
          source: this.createdBy, // this works because createdBy is a single item array for experts
          confidence: 1.0,
          normalizedURI: country.normalizedURI,
          observedName: country.observedName,
        }),
      ];
    }
    this.setReference(reference);
  }

  setStateOrProvince(stateOrProvince: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    if (stateOrProvince.normalizedURI === undefined || stateOrProvince.normalizedURI.length === 0) {
      if (this.locationInfo !== undefined) {
        this.locationInfo.stateOrProvince = [];
        if (this.locationInfo.isEmpty()) {
          this.locationInfo = undefined;
        }
      }
    } else {
      if (this.locationInfo === undefined) {
        this.locationInfo = new LocationInfo({ country: [], stateOrProvince: [] });
      }

      this.locationInfo.stateOrProvince = [
        new CandidateEntity({
          source: this.createdBy, // this works because createdBy is a single item array for experts
          confidence: 1.0,
          normalizedURI: stateOrProvince.normalizedURI,
          observedName: stateOrProvince.observedName,
        }),
      ];
    }

    this.setReference(reference);
  }

  setDepositType(depositType: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    if (depositType.normalizedURI === undefined || depositType.normalizedURI.length === 0) {
      this.depositTypeCandidate = [];
    } else {
      this.depositTypeCandidate = [
        new CandidateEntity({
          source: this.createdBy, // this works because createdBy is a single item array for experts
          confidence: 1.0,
          normalizedURI: depositType.normalizedURI,
          observedName: depositType.observedName,
        }),
      ];
    }

    this.setReference(reference);
  }

  setMineralInventory(gradeTonnage: { mineralInventory: MineralInventory[], gradeTonnage: { [commodity: InternalID]: GradeTonnage } }, reference: Reference) {
    this.mineralInventory = gradeTonnage.mineralInventory;
    this.gradeTonnage = gradeTonnage.gradeTonnage;
    this.setReference(reference);
  }

  setDiscoveredYear(year: number | undefined, reference: Reference) {
    this.discoveredYear = year;
    this.setReference(reference);
  }

  setMineralForm(mineralForm: string[], reference: Reference) {
    this.mineralForm = mineralForm;
    this.setReference(reference);
  }

  setAlteration(alteration: string, reference: Reference) {
    if (alteration.trim() === "") {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.alteration = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.alteration = alteration.trim();
    }

    this.setReference(reference);
  }

  setConcentrationProcess(concentrationProcess: string, reference: Reference) {
    if (concentrationProcess.trim() === "") {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.concentrationProcess = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.concentrationProcess = concentrationProcess.trim();
    }

    this.setReference(reference);
  }

  setOreControl(oreControl: string, reference: Reference) {
    if (oreControl.trim() === "") {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.oreControl = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.oreControl = oreControl.trim();
    }

    this.setReference(reference);
  }

  setHostRock(hostRock: RockType, reference: Reference) {
    hostRock.type = hostRock.type?.trim();
    hostRock.unit = hostRock.unit?.trim();
    if ((hostRock.type || "").length === 0) {
      hostRock.type = undefined;
    }
    if ((hostRock.unit || "").length === 0) {
      hostRock.unit = undefined;
    }

    if (hostRock.isEmpty()) {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.hostRock = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.hostRock = hostRock;
    }

    this.setReference(reference);
  }

  setAssociatedRock(associatedRock: RockType, reference: Reference) {
    associatedRock.type = associatedRock.type?.trim();
    associatedRock.unit = associatedRock.unit?.trim();
    if ((associatedRock.type || "").length === 0) {
      associatedRock.type = undefined;
    }
    if ((associatedRock.unit || "").length === 0) {
      associatedRock.unit = undefined;
    }

    if (associatedRock.isEmpty()) {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.associatedRock = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.associatedRock = associatedRock;
    }

    this.setReference(reference);
  }

  setStructure(structure: string, reference: Reference) {
    if (structure.trim() === "") {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.structure = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.structure = structure.trim();
    }

    this.setReference(reference);
  }

  setTectonic(tectonic: string, reference: Reference) {
    if (tectonic.trim() === "") {
      if (this.geologyInfo !== undefined) {
        this.geologyInfo.tectonic = undefined;
        if (this.geologyInfo.isEmpty()) {
          this.geologyInfo = undefined;
        }
      }
    } else {
      if (this.geologyInfo === undefined) {
        this.geologyInfo = new GeologyInfo({});
      }
      this.geologyInfo.tectonic = tectonic.trim();
    }

    this.setReference(reference);
  }

  setReference(reference: Reference) {
    if (this.reference.document.uri !== reference.document.uri) {
      throw new Error(`Reference document URI mismatch: ${this.reference.document.uri} !== ${reference.document.uri}. A mineral Site should not reference to multiple documents.`);
    }

    if (reference.document.title !== undefined) {
      reference.document.title = reference.document.title.trim();
      if (reference.document.title === "") {
        reference.document.title = undefined;
      }
    }

    this.reference = reference;
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


  setName(name: string, reference: Reference) {
    super.setName(name, reference);
    this.isSaved = false;
  }

  setSiteType(siteType: string, reference: Reference) {
    super.setSiteType(siteType, reference);
    this.isSaved = false;
  }

  setSiteRank(siteRank: string, reference: Reference) {
    super.setSiteRank(siteRank, reference);
    this.isSaved = false;
  }

  setLocation(location: string, reference: Reference) {
    super.setLocation(location, reference);
    this.isSaved = false;
  }

  setCountry(country: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    super.setCountry(country, reference);
    this.isSaved = false;
  }

  setStateOrProvince(stateOrProvince: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    super.setStateOrProvince(stateOrProvince, reference);
    this.isSaved = false;
  }

  setDepositType(depositType: { observedName?: string; normalizedURI?: string }, reference: Reference) {
    super.setDepositType(depositType, reference);
    this.isSaved = false;
  }

  setMineralInventory(gradeTonnage: { mineralInventory: MineralInventory[], gradeTonnage: { [commodity: InternalID]: GradeTonnage } }, reference: Reference) {
    super.setMineralInventory(gradeTonnage, reference);
    this.isSaved = false;
  }

  setDiscoveredYear(year: number | undefined, reference: Reference) {
    super.setDiscoveredYear(year, reference);
    this.isSaved = false;
  }

  setMineralForm(mineralForm: string[], reference: Reference) {
    super.setMineralForm(mineralForm, reference);
    this.isSaved = false;
  }

  setAlteration(alteration: string, reference: Reference) {
    super.setAlteration(alteration, reference);
    this.isSaved = false;
  }

  setConcentrationProcess(concentrationProcess: string, reference: Reference) {
    super.setConcentrationProcess(concentrationProcess, reference);
    this.isSaved = false;
  }

  setOreControl(oreControl: string, reference: Reference) {
    super.setOreControl(oreControl, reference);
    this.isSaved = false;
  }

  setHostRock(hostRock: RockType, reference: Reference) {
    super.setHostRock(hostRock, reference);
    this.isSaved = false;
  }

  setAssociatedRock(associatedRock: RockType, reference: Reference) {
    super.setAssociatedRock(associatedRock, reference);
    this.isSaved = false;
  }

  setStructure(structure: string, reference: Reference) {
    super.setStructure(structure, reference);
    this.isSaved = false;
  }

  setTectonic(tectonic: string, reference: Reference) {
    super.setTectonic(tectonic, reference);
    this.isSaved = false;
  }

  markSaved() {
    this.isSaved = true;
  }

  toModel(): MineralSite {
    return new MineralSite(this);
  }
}
