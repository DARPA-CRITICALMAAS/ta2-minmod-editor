import React from "react";
import { Menu, Dropdown, Avatar, Button } from "antd";
import { useStores } from "models";
import { useNavigate } from "react-router";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";


export const ProfileMenu: React.FC = observer(() => {
    const { userStore } = useStores();
    const navigate = useNavigate();
    const handleLogout = async () => {
        userStore.logout()
        navigate("/login")
    };
    const user = userStore.getCurrentUser();
    const menu = (
        <Menu>
            <Menu.Item key="username" disabled>
                <span>{userStore.getCurrentUser()?.name}</span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Button
                type="text"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
                <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}
                />
                {userStore.getCurrentUser()?.name}
            </Button>
        </Dropdown>
    );
});

