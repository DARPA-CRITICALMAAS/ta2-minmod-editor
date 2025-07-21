import { useStores } from "models";
import { DedupMineralSite, Trace } from "models/dedupMineralSite/DedupMineralSite";
import { useEffect, useMemo } from "react";
import { InternalID, IRI } from "models/typing";

interface FormattedDedupMineralSiteIsEdited {
  name: boolean;
  type: boolean;
  rank: boolean;
  coordinates: boolean;
  country: boolean;
  state_or_province: boolean;
  deposit_types: boolean[];
  grade_tonnage: { commodity: InternalID, isEdited: boolean }[];
  mineral_form: boolean;
  geology_info: {
    alteration: boolean;
    concentrationProcess: boolean;
    oreControl: boolean;
    hostRock: {
      unit: boolean;
      type: boolean;
    };
    associatedRock: {
      unit: boolean;
      type: boolean;
    };
    structure: boolean;
    tectonic: boolean;
  };
  discovered_year: boolean;
}

export class FormattedDedupMineralSite {
  origin: DedupMineralSite;
  isEdited: FormattedDedupMineralSiteIsEdited;

  public constructor(origin: DedupMineralSite, isEdited: FormattedDedupMineralSiteIsEdited) {
    this.origin = origin;
    this.isEdited = isEdited;
  }
}

const extractUsernameFromSite = (siteId: string): string | undefined => {
  const parts = siteId?.split("__");
  return parts && parts.length > 1 ? parts[parts.length - 1] : undefined;
}

export const extractUsernamesFromDedupSite = (dedupSite: DedupMineralSite): string[] => {
  return dedupSite.sites
    .map((site) => extractUsernameFromSite(site.id))
    .filter((username): username is string => username !== undefined);
};


export function getFormattedDedupmineralsite(site: DedupMineralSite, currentUsernames: string[]): FormattedDedupMineralSite {
  const isEdited: FormattedDedupMineralSiteIsEdited = {} as FormattedDedupMineralSiteIsEdited;

  for (const field of ["name", "type", "rank", "coordinates", "country", "state_or_province", "mineral_form", "discovered_year"] as const) {
    const fieldTrace = site.trace[field];
    if (fieldTrace === undefined) continue;
    const username = extractUsernameFromSite(fieldTrace);
    isEdited[field] = username !== undefined && currentUsernames.includes(username);
  }

  if (site.trace.deposit_types !== undefined) {
    isEdited.deposit_types = site.trace.deposit_types.map((_siteId) => {
      const username = extractUsernameFromSite(_siteId);
      return username !== undefined && currentUsernames.includes(username);
    });
  }

  if (site.trace.grade_tonnage !== undefined) {
    isEdited.grade_tonnage = (site.trace.grade_tonnage).map((item) => {
      const username = extractUsernameFromSite(item.site_id);
      return { commodity: item.commodity, isEdited: username !== undefined && currentUsernames.includes(username) };
    });
  }

  isEdited.geology_info = {
    alteration: false,
    concentrationProcess: false,
    oreControl: false,
    hostRock: {
      unit: false,
      type: false,
    },
    associatedRock: {
      unit: false,
      type: false,
    },
    structure: false,
    tectonic: false,
  };

  if (site.trace.geology_info !== undefined) {
    for (const field of ["alteration", "concentrationProcess", "oreControl", "structure", "tectonic"] as const) {
      const fieldTrace = site.trace.geology_info[field];
      if (fieldTrace === undefined) continue;
      const username = extractUsernameFromSite(fieldTrace);
      isEdited.geology_info[field] = username !== undefined && currentUsernames.includes(username);
    }

    for (const field of ["hostRock", "associatedRock"] as const) {
      const fieldTrace = site.trace.geology_info[field];
      if (fieldTrace === undefined) continue;
      for (const subField of ["unit", "type"] as const) {
        const subFieldTrace = fieldTrace[subField];
        if (subFieldTrace === undefined) continue;
        const username = extractUsernameFromSite(subFieldTrace);
        isEdited.geology_info[field][subField] = username !== undefined && currentUsernames.includes(username);
      }
    }
  }

  return new FormattedDedupMineralSite(site, isEdited);
}

export function useFormattedDedupMineralSite(sites: DedupMineralSite[]): FormattedDedupMineralSite[] {
  const { userStore } = useStores();

  useEffect(() => {
    if (sites.length > 0) {
      const usernames = Array.from(new Set(sites.flatMap(extractUsernamesFromDedupSite)));
      userStore.fetchByIds(usernames).catch((error) => {
        console.error("Not find any other users except current user.", error);
      });
    }
  }, [sites]);

  const allFormattedList = useMemo(() => {
    const usernames = Array.from(new Set(sites.flatMap(extractUsernamesFromDedupSite))).filter((username) => {
      const user = userStore.get(username);
      return user !== undefined && user !== null && user.role !== "system";
    });
    return sites.map((site) => getFormattedDedupmineralsite(site, usernames));
  }, [sites, userStore.records.size]);
  return allFormattedList;
}
