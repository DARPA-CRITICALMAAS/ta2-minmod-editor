import { EditableSelect } from "components/EditableSelect";
import { MineralSite } from "models";

export const LocationInput = ({
  sites,
  setFieldProvenance,
  value,
  setValue,
}: {
  sites: MineralSite[];
  setFieldProvenance: (key: string | undefined) => void;
  value?: string;
  setValue: (value: string) => void;
}) => {
  const options = sites
    .filter((site) => site.locationInfo?.location !== undefined)
    .map((site) => ({ key: site.id, label: site.locationInfo!.location! }));
  return (
    <EditableSelect
      onProvenanceChange={setFieldProvenance}
      options={options}
      value={value as string}
      onChange={(value) => setValue(value)}
    />
  );
};
