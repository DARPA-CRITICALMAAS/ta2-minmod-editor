import { CountryStore } from "../country";
import { DepositTypeStore } from "../depositType";
import { CandidateEntity, GradeTonnage, LocationInfo } from "../mineralSite";
import { StateOrProvinceStore } from "../stateOrProvince";
import { InternalID, IRI } from "../typing";

export class DedupMineralSiteDepositType {
  uri: IRI;
  source: string;
  confidence: number;

  public constructor({ uri, source, confidence }: { uri: IRI; source: string; confidence: number }) {
    this.uri = uri;
    this.source = source;
    this.confidence = confidence;
  }

  public toCandidateEntity(stores: { depositTypeStore: DepositTypeStore }): CandidateEntity {
    return new CandidateEntity({
      source: this.source,
      confidence: this.confidence,
      normalizedURI: this.uri,
      observedName: stores.depositTypeStore.getByURI(this.uri)?.name,
    });
  }
}

export class DedupMineralSiteOriginalSite {
  id: string;
  score: number;

  public constructor({ id, score }: { id: string; score: number }) {
    this.id = id;
    this.score = score;
  }

  public static deserialize(record: any): DedupMineralSiteOriginalSite {
    return new DedupMineralSiteOriginalSite({
      id: record.id,
      score: record.score,
    });
  }
}

export class DedupMineralSiteLocation {
  lat?: number;
  lon?: number;
  country: IRI[];
  stateOrProvince: IRI[];

  public constructor({ lat, lon, country, stateOrProvince }: { lat?: number; lon?: number; country: IRI[]; stateOrProvince: IRI[] }) {
    this.lat = lat;
    this.lon = lon;
    this.country = country;
    this.stateOrProvince = stateOrProvince;
  }

  public static deserialize(record: any): DedupMineralSiteLocation {
    return new DedupMineralSiteLocation({
      lat: record.lat,
      lon: record.lon,
      country: record.country || [],
      stateOrProvince: record.state_or_province || [],
    });
  }

  public toLocationInfo(
    stores: {
      stateOrProvinceStore: StateOrProvinceStore;
      countryStore: CountryStore;
    },
    source: string,
    confidence: number = 1.0
  ) {
    let loc = undefined;
    if (this.lat !== undefined && this.lon !== undefined) {
      loc = `POINT (${this.lon} ${this.lat})`;
    }

    return new LocationInfo({
      location: loc,
      crs: new CandidateEntity({
        source,
        confidence,
        normalizedURI: "https://minmod.isi.edu/resource/Q701",
        observedName: "EPSG:4326",
      }),
      country: this.country.map((country) => {
        return new CandidateEntity({
          source,
          confidence,
          normalizedURI: country,
          observedName: stores.countryStore.get(country)?.name,
        });
      }),
      stateOrProvince: this.stateOrProvince.map((stateOrProvince) => {
        return new CandidateEntity({
          source,
          confidence,
          normalizedURI: stateOrProvince,
          observedName: stores.stateOrProvinceStore.get(stateOrProvince)?.name,
        });
      }),
    });
  }
}

export type TraceField = "name" | "type" | "rank" | "coordinates" | "country" | "state_or_province"

export class DedupMineralSite {
  id: InternalID;
  uri: IRI;
  name: string;
  type: string;
  rank: string;
  sites: DedupMineralSiteOriginalSite[];
  depositTypes: DedupMineralSiteDepositType[];
  location?: DedupMineralSiteLocation;
  gradeTonnage: GradeTonnage;
  modifiedAt: string;
  trace: Partial<Record<TraceField, string>>;

  public constructor({
    id,
    uri,
    name,
    type,
    rank,
    sites,
    depositTypes,
    location,
    gradeTonnage,
    modifiedAt,
    trace
  }: {
    id: InternalID;
    uri: IRI;
    name: string;
    type: string;
    rank: string;
    sites: DedupMineralSiteOriginalSite[];
    depositTypes: DedupMineralSiteDepositType[];
    location?: DedupMineralSiteLocation;
    gradeTonnage: GradeTonnage;
    modifiedAt: string;
    trace: Partial<Record<TraceField, string>>;
  }) {
    this.id = id;
    this.uri = uri;
    this.name = name;
    this.type = type;
    this.rank = rank;
    this.sites = sites;
    this.depositTypes = depositTypes;
    this.location = location;
    this.gradeTonnage = gradeTonnage;
    this.modifiedAt = modifiedAt;
    this.trace = trace;
  }

  get commodity(): string {
    return this.gradeTonnage.commodity;
  }

  public static getId(uri: string): string {
    return uri.substring(uri.lastIndexOf("/") + 1);
  }

  public getTop1DepositType(): DedupMineralSiteDepositType | undefined {
    return this.depositTypes[0];
  }
}
