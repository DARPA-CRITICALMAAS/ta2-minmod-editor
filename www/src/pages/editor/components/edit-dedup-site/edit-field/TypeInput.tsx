import { MineralSite } from "models";
import _ from "lodash";
import { Select } from "antd";

export const TypeInput = ({
  sites,
  value,
  setValue,
}: {
  sites: MineralSite[];
  value?: string;
  setValue: (value: string) => void;
}) => {
  let options = sites.filter((site) => site.siteType !== undefined).map((site) => site.siteType!);
  options = options.concat(["Mine", "Occurrence", "Prospect", "Past Producer", "Producer", "Plant", "NotSpecified"]);
  const selectOptions = (_.uniqBy as any)(options).map((type: string) => ({ value: type, label: type }));
  return (
    <Select
      showSearch={true}
      options={selectOptions}
      optionFilterProp="label"
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
};
