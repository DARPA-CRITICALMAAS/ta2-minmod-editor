import { useStores } from "models";
import { DedupMineralSite, TraceField } from "models/dedupMineralSite/DedupMineralSite";
import { useEffect, useMemo } from "react";

export class FormattedDedupMineralSite {
  origin: DedupMineralSite;
  isEdited: Partial<Record<TraceField, boolean>>;

  public constructor(origin: DedupMineralSite, isEdited: Partial<Record<TraceField, boolean>> = {}) {
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
  const isEdited: Partial<Record<TraceField, boolean>> = {};
  Object.entries(site.trace).forEach(([field, siteId]) => {
    const username = extractUsernameFromSite(siteId);
    if (username !== undefined && currentUsernames.includes(username)) {
      isEdited[field as TraceField] = true;
    }
  });
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
