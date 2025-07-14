import _ from "lodash";
import { Input } from "antd";

export const DiscoveredYearInput = ({
  value,
  setValue,
}: {
  value?: number;
  setValue: (value: number | undefined) => void;
}) => {
  return (
    <Input
      type="number"
      value={value || ""}
      onChange={(e) => setValue(e.target.value.trim() === "" ? undefined : parseInt(e.target.value))}
    />
  );
};
