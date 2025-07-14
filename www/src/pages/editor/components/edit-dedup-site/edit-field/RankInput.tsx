import { MineralSite } from "models";
import _ from "lodash";
import { Select } from "antd";

export const RankInput = ({
  sites,
  value,
  setValue,
}: {
  sites: MineralSite[];
  value?: string;
  setValue: (value: string) => void;
}) => {
  let options = sites.filter((site) => site.siteRank !== undefined).map((site) => site.siteRank!);
  options = options.concat(["A", "B", "C", "D", "E", "U"]);
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
