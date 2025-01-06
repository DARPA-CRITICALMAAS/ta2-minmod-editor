import { Button, Flex, Space } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";
import { useRef, useState } from "react";
import { NewMineralSiteModal, NewMineralSiteModalRef } from "./NewMineralSiteModal";
import { Commodity } from "models";
import { PlusOutlined } from "@ant-design/icons";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();
  const modalRef = useRef<NewMineralSiteModalRef>(null);
  const handleOpenModal = () => {
    if (modalRef.current != null || modalRef.current != undefined) {
      modalRef.current.open();
    }
  };


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
      <NewMineralSiteModal
        ref={modalRef}
        commodity={normSearchArgs.commodity as Commodity}
      />
    </Flex>
  );

});

