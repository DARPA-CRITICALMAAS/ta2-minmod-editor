import { Button, Flex } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";
import { useRef } from "react";
import { NewMineralSiteModal, newMineralSiteFormRef } from "./NewMineralSiteModal";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();
  const modalRef = useRef<newMineralSiteFormRef>(null);
  const handleOpenNewMineralSiteForm = () => {
    if (modalRef.current != null || modalRef.current != undefined) {
      modalRef.current.open();
    }
  };
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
        <Button type="primary" onClick={handleOpenNewMineralSiteForm}>
          Add Mineral Site
        </Button>
      </div>
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
      <NewMineralSiteModal
        ref={modalRef}
        commodity={normSearchArgs.commodity}
      />
    </Flex>
  );
});

