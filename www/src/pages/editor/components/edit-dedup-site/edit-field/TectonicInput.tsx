import { Input } from "antd";

export const TectonicInput = ({ value, setValue }: { value?: string; setValue: (value: string) => void }) => {
  return <Input value={value || ""} onChange={(e) => setValue(e.target.value)} />;
};
