import { Tooltip, Typography } from "antd";
import styles from "./FormLabel.module.css";
import { QuestionCircleOutlined } from "@ant-design/icons";

export const FormLabel = ({ label, required = false, help }: { label: string; help?: string; required?: boolean }) => {
  const className = required ? styles.requiredLabel : "";

  if (help !== undefined) {
    return (
      <label className={className}>
        {label}&nbsp;
        <Tooltip title={help}>
          <Typography.Text type="secondary" style={{ cursor: "help" }}>
            <QuestionCircleOutlined />
          </Typography.Text>
        </Tooltip>
      </label>
    );
  }
  return <label className={className}>{label}</label>;
};
