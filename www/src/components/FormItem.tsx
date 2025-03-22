import { Flex, Space, Tooltip, Typography } from "antd";
import { ReactElement } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

export const FormItem = ({ label, name, required, children, tooltip, inline }: { label: string; name: string; tooltip?: string; required?: boolean; children?: ReactElement; inline?: boolean }) => {
  if (inline === true) {
    return (
      <Space size={"small"}>
        <label htmlFor={name}>
          <Space size={4}>
            {label}
            {tooltip && (
              <Tooltip title={tooltip}>
                <Typography.Text type="secondary" style={{ cursor: "help" }}>
                  <QuestionCircleOutlined />
                </Typography.Text>
              </Tooltip>
            )}
            {required !== true && <Typography.Text type="secondary">(optional)</Typography.Text>}
          </Space>
        </label>
        {children}
      </Space>
    );
  }
  return (
    <Flex vertical={true} gap={4}>
      <label htmlFor={name} style={{ display: "block" }}>
        <Space size={4}>
          {label}
          {tooltip && (
            <Tooltip title={tooltip}>
              <Typography.Text type="secondary" style={{ cursor: "help" }}>
                <QuestionCircleOutlined />
              </Typography.Text>
            </Tooltip>
          )}
          {required !== true && <Typography.Text type="secondary">(optional)</Typography.Text>}
        </Space>
      </label>
      {children}
    </Flex>
  );
};
