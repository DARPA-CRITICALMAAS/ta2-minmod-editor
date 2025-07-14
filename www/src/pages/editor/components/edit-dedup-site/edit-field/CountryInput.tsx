import _ from "lodash";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { MineralSite, useStores } from "models";

export const CountryInput = observer(
  ({
    sites,
    value,
    setValue,
  }: {
    sites: MineralSite[];
    value?: { observedName?: string; normalizedURI?: string };
    setValue: (value: { observedName?: string; normalizedURI?: string }) => void;
  }) => {
    const { countryStore } = useStores();
    let options = _.uniqBy(
      sites
        .flatMap((site) => site.locationInfo?.country || [])
        .filter((country) => country.normalizedURI !== undefined),
      "normalizedURI"
    )
      .sort((a, b) => a.confidence - b.confidence)
      .map((ent) => ({ value: ent.normalizedURI!, label: countryStore.getByURI(ent.normalizedURI!)!.name }));
    const predictedCountries = new Set(options.map((ent) => ent.value));
    options = options.concat(
      countryStore
        .filter((ent) => !predictedCountries.has(ent.uri))
        .map((type) => ({ value: type.uri, label: type.name }))
    );

    return (
      <Select
        showSearch={true}
        options={options}
        optionFilterProp="label"
        value={value?.normalizedURI || ""}
        onChange={(normalizedURI) => {
          setValue({
            normalizedURI: normalizedURI,
            observedName: countryStore.getByURI(normalizedURI)!.name,
          });
        }}
      />
    );
  }
);
