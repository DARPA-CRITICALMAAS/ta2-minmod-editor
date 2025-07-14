import { Input } from "antd";
import { FormItem } from "components/FormItem";
import { RockType } from "models/mineralSite/GeologyInfo";

export const RockTypeInput = ({
  label,
  value,
  setValue,
}: {
  label: string;
  value?: RockType;
  setValue: (value: RockType) => void;
}) => {
  return (
    <>
      <FormItem label={label + " Unit"} name="fieldValueUnit" tooltip="This is a required field" required={true}>
        <Input
          value={value?.unit || ""}
          onChange={(e) => setValue(new RockType({ type: value?.type, unit: e.target.value }))}
        />
      </FormItem>
      <FormItem label={label + " Type"} name="fieldValueType" tooltip="This is a required field" required={true}>
        <Input
          value={value?.type || ""}
          onChange={(e) => setValue(new RockType({ type: e.target.value, unit: value?.unit }))}
        />
      </FormItem>
    </>
  );
};
