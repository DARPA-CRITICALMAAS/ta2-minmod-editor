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
  const [isCreatingMineralSite, setIsCreatingMineralSite] = useState(false);

  const handleOpenModal = () => setIsCreatingMineralSite(true);
  const handleCloseModal = () => setIsCreatingMineralSite(false);

  return (
    <Flex vertical={true} gap="small">
      <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
      <Button style={{ marginLeft: "1180px", bottom: "40px", width: "200px" }} type="primary" onClick={handleOpenModal}> Add Mineral Site</Button>
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
