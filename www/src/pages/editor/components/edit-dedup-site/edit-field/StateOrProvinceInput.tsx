import _ from "lodash";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { MineralSite, useStores } from "models";

export const StateOrProvinceInput = observer(
  ({
    sites,
    value,
    setValue,
  }: {
    sites: MineralSite[];
    value?: { observedName?: string; normalizedURI?: string };
    setValue: (value: { observedName?: string; normalizedURI?: string }) => void;
  }) => {
    const { stateOrProvinceStore } = useStores();
    let options = _.uniqBy(
      sites
        .flatMap((site) => site.locationInfo?.stateOrProvince || [])
        .filter((stateOrProvince) => stateOrProvince.normalizedURI !== undefined),
      "normalizedURI"
    )
      .sort((a, b) => a.confidence - b.confidence)
      .map((ent) => ({
        value: ent.normalizedURI!,
        label: stateOrProvinceStore.getByURI(ent.normalizedURI!)!.name,
      }));
    const predictedSOP = new Set(options.map((ent) => ent.value));
    options = options.concat(
      stateOrProvinceStore
        .filter((ent) => !predictedSOP.has(ent.uri))
        .map((type) => ({ value: type.uri, label: type.name }))
    );

    return (
      <Select
        showSearch={true}
        options={options}
        optionFilterProp="label"
        value={value?.normalizedURI || ""}
        allowClear={true}
        onChange={(normalizedURI) =>
          setValue(
            normalizedURI === undefined
              ? {}
              : {
                  normalizedURI: normalizedURI,
                  observedName: stateOrProvinceStore.getByURI(normalizedURI)!.name,
                }
          )
        }
      />
    );
  }
);
