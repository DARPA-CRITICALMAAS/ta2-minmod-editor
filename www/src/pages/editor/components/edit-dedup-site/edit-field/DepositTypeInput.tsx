import _ from "lodash";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { MineralSite, useStores } from "models";

export const DepositTypeInput = observer(
  ({
    sites,
    value,
    setValue,
  }: {
    sites: MineralSite[];
    value?: { observedName?: string; normalizedURI?: string };
    setValue: (value: { observedName?: string; normalizedURI?: string }) => void;
  }) => {
    const { depositTypeStore } = useStores();
    let options = _.uniqBy(
      sites.flatMap((site) => site.depositTypeCandidate).filter((deptype) => deptype.normalizedURI !== undefined),
      "normalizedURI"
    )
      .sort((a, b) => a.confidence - b.confidence)
      .map((type) => ({
        value: type.normalizedURI!,
        label: depositTypeStore.getByURI(type.normalizedURI!)!.name,
      }));
    const predictedDepTypes = new Set(options.map((type) => type.value));
    options = options.concat(
      depositTypeStore
        .filter((type) => !predictedDepTypes.has(type.uri))
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
                  observedName: depositTypeStore.getByURI(normalizedURI)!.name,
                }
          )
        }
      />
    );
  }
);
