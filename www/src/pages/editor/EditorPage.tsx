import { Button, Flex, Space } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";
import { useState } from "react";
import { NewMineralSiteModal } from "./NewMineralSiteModal";
import { Commodity } from "models";
import { PlusOutlined } from "@ant-design/icons";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();
  const [isCreatingMineralSite, setisCreatingMineralSite] = useState(false);

  const handleOpenModal = () => setisCreatingMineralSite(true);
  const handleCloseModal = () => setisCreatingMineralSite(false);

  return (
    <Flex vertical={true} gap="small">
      <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
      <Space style={{ marginBottom: 16 }}>
        <Button style={{ marginLeft: "330px", bottom: "40px" }} type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}></Button>
      </Space>
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
      {isCreatingMineralSite && (
        <NewMineralSiteModal
          commodity={normSearchArgs.commodity as Commodity}
          visible={isCreatingMineralSite}
          onClose={handleCloseModal}
        />
      )}
    </Flex>
  );
});
