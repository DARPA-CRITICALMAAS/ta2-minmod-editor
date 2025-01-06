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


  //using ref 

  return (
    <Flex vertical={true} gap="small">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
        <Button type="primary" onClick={handleOpenModal}>
          Add Mineral Site
        </Button>
      </div>
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
      {isCreatingMineralSite && (
        <NewMineralSiteModal
          commodity={normSearchArgs.commodity as Commodity}
          visible={true}
          onClose={handleCloseModal}
        />
      )}
    </Flex>
  );

});

