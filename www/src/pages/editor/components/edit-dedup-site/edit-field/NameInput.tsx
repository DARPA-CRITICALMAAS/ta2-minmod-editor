import { EditableSelect } from "components/EditableSelect";
import { MineralSite } from "models";

export const NameInput = ({
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
  const options = sites.filter((site) => site.name !== undefined).map((site) => ({ key: site.id, label: site.name! }));
  return (
    <EditableSelect
      onProvenanceChange={setFieldProvenance}
      options={options}
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
};
