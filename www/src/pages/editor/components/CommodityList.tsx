import { observer } from "mobx-react-lite";
import { useStores, MineralSite } from "models";
import { useMemo } from "react";
import _ from "lodash";

export const CommodityList = observer(({ site }: { site: MineralSite }) => {
  const { commodityStore } = useStores();

  const lst = useMemo(() => {
    return _.uniq(
      site.mineralInventory
        .filter((inv) => inv.commodity.normalizedURI !== undefined)
        .map((inv) => {
          const commodity = commodityStore.getByURI(inv.commodity.normalizedURI!);
          return commodity?.name;
        })
    ).join(", ");
  }, [site.mineralInventory, commodityStore.records]);

  return <span>{lst}</span>;
});
