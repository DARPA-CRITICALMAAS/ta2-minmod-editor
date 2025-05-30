import { Button } from "antd";
import { CheckCircleOutlined, CheckOutlined, EditOutlined, PlusOutlined, SearchOutlined, UngroupOutlined } from "@ant-design/icons";
import { Commodity, DedupMineralSite, DraftCreateMineralSite, DraftUpdateMineralSite, useStores } from "models";
import { useState } from "react";
import { CandidateEntity, LocationInfo } from "models/mineralSite";

export const ConfirmDataButton = ({ dedupSite, commodity }: { dedupSite: DedupMineralSite; commodity: Commodity }) => {
  const [isLoading, setIsLoading] = useState(false);
  const stores = useStores();

  const onClick = async () => {
    /// To confirm data, we just copy the data over to the existing site if it exists.

    if (isLoading) return;
    // Logic to confirm data goes here
    setIsLoading(true);

    const currentUser = stores.userStore.getCurrentUser()!;
    const sites = await stores.mineralSiteStore.fetchByIds(dedupSite.sites.map((site) => site.id));

    const userSite = Object.values(sites).find((site) => site.createdBy.includes(currentUser.url));
    let draftSite: DraftCreateMineralSite | DraftUpdateMineralSite;
    if (userSite === undefined) {
      draftSite = DraftCreateMineralSite.fromMineralSite(dedupSite, currentUser, Object.values(sites)[0].reference);
    } else {
      draftSite = new DraftUpdateMineralSite(userSite);
    }

    if (dedupSite.name !== "") {
      draftSite.name = dedupSite.name;
    }
    if (dedupSite.type !== "") {
      draftSite.siteType = dedupSite.type;
    }
    if (dedupSite.rank !== "") {
      draftSite.siteRank = dedupSite.rank;
    }
    if (dedupSite.location !== undefined) {
      draftSite.locationInfo = new LocationInfo({
        country: [],
        stateOrProvince: [],
      });

      if (dedupSite.location.lat !== undefined && dedupSite.location.lon !== undefined) {
        draftSite.locationInfo.location = `POINT (${dedupSite.location.lon} ${dedupSite.location.lat})`;
      }
      if (dedupSite.location.country.length > 0) {
        draftSite.locationInfo.country = dedupSite.location.country.map((country) => {
          const entity = stores.countryStore.getByURI(country)!;
          return new CandidateEntity({ source: draftSite.createdBy, confidence: 1.0, normalizedURI: entity.uri, observedName: entity.name });
        });
      }
      if (dedupSite.location.stateOrProvince.length > 0) {
        draftSite.locationInfo.stateOrProvince = dedupSite.location.stateOrProvince.map((stateOrProvince) => {
          const entity = stores.stateOrProvinceStore.getByURI(stateOrProvince)!;
          return new CandidateEntity({ source: draftSite.createdBy, confidence: 1.0, normalizedURI: entity.uri, observedName: entity.name });
        });
      }
    }
    if (dedupSite.depositTypes.length > 0) {
      draftSite.depositTypeCandidate = dedupSite.depositTypes.map((depositType) => {
        const entity = stores.depositTypeStore.getByURI(depositType.uri)!;
        return new CandidateEntity({ source: draftSite.createdBy, confidence: 1.0, normalizedURI: entity.uri, observedName: entity.name });
      });
    }

    if (dedupSite.gradeTonnage.totalGrade !== undefined && dedupSite.gradeTonnage.totalTonnage !== undefined) {
      draftSite.updateField(
        stores,
        {
          field: "grade",
          commodity: dedupSite.gradeTonnage.commodity,
          value: dedupSite.gradeTonnage.totalGrade,
        },
        draftSite.reference
      );
      draftSite.updateField(
        stores,
        {
          field: "tonnage",
          commodity: dedupSite.gradeTonnage.commodity,
          value: dedupSite.gradeTonnage.totalTonnage,
        },
        draftSite.reference
      );
    }

    if (userSite === undefined) {
      await stores.mineralSiteStore.createAndUpdateDedup(dedupSite.commodity, draftSite as DraftCreateMineralSite);
    } else {
      await stores.mineralSiteStore.updateAndUpdateDedup(dedupSite.commodity, draftSite as DraftUpdateMineralSite);
    }

    setIsLoading(false);

    // TODO: we should generate correct records and preserve the
    // Get list of sites created by the current user
    // const updatedSites = new Set();
    // const userSites = Object.fromEntries(
    //   Object.values(sites)
    //     .filter((site) => site.createdBy.includes(currentUser.url))
    //     .map((site) => {
    //       return [`${site.sourceId}:${site.recordId}`, new DraftUpdateMineralSite(site)];
    //     })
    // );

    // // Go through each field in the dedup site, if the source of the field is available in the existing sites, then
    // // we update the data, otherwise, we create a new site
    // if (dedupSite.name !== "") {
    //   // we have the name
    //   const siteId = dedupSite.trace.name;
    //   const site = sites[siteId];
    //   const key = `${site.sourceId}:${site.recordId}`;
    //   if (userSites[key] !== undefined) {
    //     // we have the site, update it
    //     userSites[key].name = dedupSite.name;
    //     updatedSites.add(userSites[key].id);
    //   } else {
    //     userSites[key] = DraftCreateMineralSite.fromMineralSite(dedupSite, currentUser, site.reference);
    //   }
    // }

    // // for (const field of ["name", "type", "rank", "coordinates", "country", "state_or_province"]) {
    // //   if (dedupSite.name)
    // // }

    // // if (existingSite === undefined || existingSite.reference.document.uri !== change.reference.document.uri) {
  };

  return (
    <Button variant="solid" color="green" size="middle" icon={<CheckCircleOutlined />} onClick={onClick} loading={isLoading}>
      Confirm Data
    </Button>
  );
};
