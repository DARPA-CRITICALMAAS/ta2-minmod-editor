import { count } from "console";
import { CandidateEntity } from "./CandidateEntity";
import { LocationInfo } from "./LocationInfo";
import { Reference } from "./Reference";

export type MineralSiteProperty = "name" | "depositType" | "location";

export class MineralSite {
  id: string;
  recordId: string;
  sourceId: string;
  createdBy: string;
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  max_grade: Float32Array;
  max_tonnes: Float32Array;

  public constructor({
    id,
    recordId,
    sourceId,
    createdBy,
    name,
    locationInfo,
    depositTypeCandidate,
    reference,
    sameAs,
    max_grade,
    max_tonnes,
  }: {
    id: string;
    recordId: string;
    sourceId: string;
    createdBy: string;
    name: string;
    locationInfo: LocationInfo;
    depositTypeCandidate: CandidateEntity[];
    reference: Reference[];
    sameAs: string[];
    max_grade: Float32Array;
    max_tonnes: Float32Array;
  }) {
    this.id = id;
    this.recordId = recordId;
    this.sourceId = sourceId;
    this.createdBy = createdBy;
    this.name = name;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.reference = reference;
    this.sameAs = sameAs;
    this.max_grade = max_grade;
    this.max_tonnes = max_tonnes;
  }

  public update(
    property: MineralSiteProperty,
    value: string,
    reference: Reference
  ): MineralSite {
    // TODO: fix me, remove duplicated reference.
    const another = this.clone();
    another.reference.push(reference);

    switch (property) {
      case "name":
        another.name = value;
        break;
      // TODO: fix me!
      // case "depositType":
      //   another.depositType = value;
      //   break;
      // case "location":
      //   another.location = value;
      //   break;
      default:
        throw new Error(`Invalid property: ${property}`);
    }
    return another;
  }

  public getProperty(property: MineralSiteProperty): string {
    switch (property) {
      case "name":
        return this.name;
      // TODO: fix me!
      // case "depositType":
      //   return this.depositType;
      // case "location":
      //   return this.location;
      default:
        throw new Error(`Invalid property: ${property}`);
    }
  }

  public clone(): MineralSite {
    return new MineralSite({
      id: this.id,
      recordId: this.recordId,
      sourceId: this.sourceId,
      createdBy: this.createdBy,
      name: this.name,
      locationInfo: this.locationInfo.clone(),
      depositTypeCandidate: this.depositTypeCandidate.map((candidate) =>
        candidate.clone()
      ),
      reference: this.reference.map((reference) => reference.clone()),
      sameAs: this.sameAs,
      max_grade: this.max_grade,
      max_tonnes: this.max_tonnes,
    });
  }

  public static findMineralSiteByUsername(
    mineralSites: MineralSite[],
    username: string
  ): MineralSite | undefined {
    const fullUsername = `/user/${username}`;
    return mineralSites.find((mineralSite) =>
      mineralSite.createdBy.endsWith(fullUsername)
    );
  }

  public static createDefaultCuratedMineralSite(
    mineralSites: MineralSite[],
    username: string
  ): MineralSite {
    // TODO: should replace it with logic in the backend.
    const curatedMineralSite = mineralSites[0].clone();
    // TODO: fix me, we need to make sure source_id is a valid URL, we will have error when source id is http://example.com?test=abc.
    curatedMineralSite.sourceId = `${curatedMineralSite.sourceId}?username=${username}`;
    curatedMineralSite.createdBy = `https://minmod.isi.edu/user/${username}`;
    return curatedMineralSite;
  }

  public serialize(): object {
    // convert mineral site to the format that the server required to save the mineral site.
    return {
      id: this.id,
      record_id: this.recordId,
      source_id: this.sourceId,
      created_by: this.createdBy,
      siteName: this.name,
      // location: this.location,
      // crs: this.crs,
      // country: this.country,
      // state_or_province: this.state_or_province,
      // commodity: this.commodity,
      // depositType: this.depositType,
      // depositConfidence: this.depositConfidence,
      // grade: this.grade,
      // tonnage: this.tonnage,
      reference: this.reference,
      sameAs: this.sameAs,
      max_grade: this.max_grade,
      max_tonnes: this.max_tonnes,
      // comments: this.comments,
    };
  }

  public static deserialize(id: string, obj: any): MineralSite {
    return new MineralSite({
      id: id,
      recordId: obj.record_id,
      sourceId: obj.source_id,
      createdBy: obj.created_by,
      name: obj.name,
      locationInfo:
        obj.location_info !== undefined
          ? LocationInfo.deserialize(obj.location_info)
          : new LocationInfo({
              country: [],
              state_or_province: [],
            }),
      depositTypeCandidate: (obj.deposit_type_candidate || []).map(
        CandidateEntity.deserialize
      ),
      reference: obj.reference.map(Reference.deserialize),
      sameAs: obj.sameAs,
      max_grade: obj.max_grade,
      max_tonnes: obj.max_tonnes,
    });
  }
}
