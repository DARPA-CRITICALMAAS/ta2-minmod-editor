import { Button, Flex } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";
import { useRef } from "react";
import { NewMineralSiteModal, NewMineralSiteFormRef } from "./NewMineralSiteModal";
import { ProfileMenu } from "../../components/ProfileMenu";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();
  const newMineralSiteFormRef = useRef<NewMineralSiteFormRef>(null);
  const handleOpenNewMineralSiteForm = () => {
    if (newMineralSiteFormRef.current != null || newMineralSiteFormRef.current != undefined) {
      newMineralSiteFormRef.current.open();
    }
  };
  return (
    <Flex vertical={true} gap="small">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ flex: 1 }}>
          <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button type="primary" onClick={handleOpenNewMineralSiteForm}>
            Add Mineral Site
          </Button>
          <ProfileMenu />
        </div>
      </div>
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
      <NewMineralSiteModal
        ref={newMineralSiteFormRef}
        commodity={normSearchArgs.commodity}
      />
    </Flex>
  );
});

