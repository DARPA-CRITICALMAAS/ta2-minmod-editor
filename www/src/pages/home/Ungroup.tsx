import { Button, Col, Flex, Row, Select, Space, Table, Typography, Checkbox } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { useStores, Commodity, DedupMineralSite, MineralSite, CandidateEntity, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { useEffect, useMemo, useState } from "react";
import { WithStyles, withStyles } from "@material-ui/styles";
import { CanEntComponent, ListCanEntComponent } from "./editDedupSite/CandidateEntity";
import { join } from "misc";
import { orange } from "@ant-design/colors";
import axios from "axios";
import { message } from "antd";

const css = {
  table: {
    "& .ant-table": {
      margin: "0px !important",
      border: "1px solid #ccc",
    },
  },
  myEditedRow: {
    backgroundColor: `${orange[1]} !important`,
    "& > td": {
      backgroundColor: `${orange[1]} !important`,
    },
  },
};

interface UngroupProps {
  commodity: Commodity;
  dedupSite: DedupMineralSite;
}





export const Ungroup = withStyles(css)(
  observer(({ dedupSite, commodity, classes }: UngroupProps & WithStyles<typeof css>) => {
    const stores = useStores();
    const { mineralSiteStore,dedupMineralSiteStore, userStore } = stores;
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const tmpLst: (MineralSite | null | undefined)[] = dedupSite.sites.map((id) =>
      mineralSiteStore.get(id)
    );
    const fetchedSites = tmpLst.filter((site) => site !== undefined) as (MineralSite | null)[];
    const sites = fetchedSites.filter((site) => site !== null) as MineralSite[];
    const isLoading =
      mineralSiteStore.state.value === "updating" || fetchedSites.length !== dedupSite.sites.length;

    const handleCreateOne = async () => {
      try {
        const selectedSiteIds = Array.from(selectedRows);
        console.log("Selected Site IDs:", selectedSiteIds);

        const allSiteIds = sites.map((site) => site.id);
        console.log("All Site IDs:", allSiteIds);

        const unselectedSiteIds = allSiteIds.filter((id) => !selectedRows.has(id));
        console.log("Unselected Site IDs:", unselectedSiteIds);

        const sameAsPayload =
         [
            { sites: selectedSiteIds },
            { sites: unselectedSiteIds },
          ]
        console.log("Grouping Payload:", sameAsPayload);

        const sameAsResponse = await axios.post("/api/v1/same-as", sameAsPayload, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        console.log("Group API Response:", sameAsResponse.data);
        const newIds = sameAsResponse.data.map((item: any) => item.id);

        console.log("New Site IDs:", newIds);
  
        if (commodity && commodity.id) {
          const commodityId = commodity.id;
          await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
          message.success("Operation was successful!");

      }else {
        console.error("commodity is undefined or does not have an id");
    } }  catch (error) {
        console.error("Error during handleUngroupAll:", error);
        alert("An error occurred while performing the ungroup operation. Check the console for details.");
      }
    };

    const handleKGroup = async () => {
      try {
        const selectedSiteIds = Array.from(selectedRows);
        console.log("Selected Site IDs:", selectedSiteIds);
    
        const allSiteIds = sites.map((site) => site.id);
        console.log("All Site IDs:", allSiteIds);
    
        const unselectedSiteIds = allSiteIds.filter((id) => !selectedRows.has(id));
        console.log("Unselected Site IDs:", unselectedSiteIds);
    
        const selectedPayload = selectedSiteIds.map((id) => ({ sites: [id] }));
        const unselectedPayload = unselectedSiteIds.length > 0 ? [{ sites: unselectedSiteIds }] : [];
        const createPayload = [...selectedPayload, ...unselectedPayload];
    
        console.log("Create Dedup Site Payload:", createPayload);
    
        const response = await axios.post("/api/v1/same-as", createPayload, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
    
        console.log("Create Dedup Site API Response:", response.data);
    
        const newIds = response.data.map((item: any) => item.id);
        console.log("New Site IDs:", newIds);
    
        if (commodity && commodity.id) {
          const commodityId = commodity.id;
          await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
          message.success("Operation was successful!");
          console.log("Successfully replaced sites.");
        } else {
          console.error("commodity is undefined or does not have an id");
        }
      } catch (error) {
        console.error("Error during handleCreateDedupSite:", error);
        alert("An error occurred while creating dedup sites. Check the console for details.");
      }
    };
    


    const columns = useMemo(() => {
      const selectedCount = selectedRows.size;
      return [
        {
          title: (
            <Space>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <Button
                  style={{ background: "#e6f4ff", color: "#1677ff" }}
                  type="default"
                  size="small"
                  onClick={handleCreateOne} 
                >
                  Create 1 Group
                </Button>
                <Button
                  style={{ background: "#e6f4ff", color: "#1677ff" }}
                  type="default"
                  size="small"
                  onClick={handleKGroup}
                >
                  {selectedCount === 0
                    ? "Create Group"
                    : `Create ${selectedCount} Group${selectedCount > 1 ? "s" : ""}`}
                </Button>
              </div>
            </Space>
          ),        
        key: "select",
          render: (_: any, site: MineralSite) => (
            <Checkbox
              checked={selectedRows.has(site.id)}
              onChange={(e) => {
                const updatedRows = new Set(selectedRows);
                if (e.target.checked) {
                  updatedRows.add(site.id);
                } else {
                  updatedRows.delete(site.id);
                }
                setSelectedRows(updatedRows);
              }}
            />
          ),
        },
        {
          title: "Name", 
          key: "name",
          render: (_: any, site: MineralSite) => {
            return (
              <Typography.Link href={site.uri} target="_blank">
                {site.name}
              </Typography.Link>
            );
          },
        },
        {
          title: "Location", 
          key: "location",
          render: (_: any, site: MineralSite) => {
            return (
              <Typography.Text className="font-small" ellipsis={true} style={{ maxWidth: 200 }}>
                {site.locationInfo.location}
              </Typography.Text>
            );
          },
        },
        {
          title: "CRS",
          key: "crs",
          render: (_: any, site: MineralSite) => {
            return <span>{site.locationInfo.crs?.observedName}</span>;
          },
        },
        {
          title: "Country",
          key: "country",
          render: (_: any, site: MineralSite) => {
            return <ListCanEntComponent entities={site.locationInfo.country} />;
          },
        },
        {
          title: "State/Province",
          key: "state/province",
          render: (_: any, site: MineralSite) => {
            return <ListCanEntComponent entities={site.locationInfo.stateOrProvince} />;
          },
        },
        {
          title: "Dep. Type", // No edit icon
          key: "deposit-type",
          render: (_: any, site: MineralSite) => {
            return <CanEntComponent entity={site.depositTypeCandidate[0]} />;
          },
        },
        {
          title: "Dep. Confidence",
          key: "dep-type-confidence",
          render: (_: any, site: MineralSite) => {
            if (site.depositTypeCandidate.length === 0) {
              return "-";
            }
            return site.depositTypeCandidate[0].confidence.toFixed(4);
          },
        },
        {
          title: "Tonnage (Mt)", // No edit icon
          key: "tonnage",
          render: (_: any, site: MineralSite) => {
            const gradeTonnage = site.gradeTonnage[commodity.id];
            if (gradeTonnage === undefined || gradeTonnage.totalTonnage === undefined) {
              return "-";
            }
            return gradeTonnage.totalTonnage.toFixed(4);
          },
        },
        {
          title: "Grade (%)", // No edit icon
          key: "grade",
          render: (_: any, site: MineralSite) => {
            const gradeTonnage = site.gradeTonnage[commodity.id];
            if (gradeTonnage === undefined || gradeTonnage.totalGrade === undefined) {
              return "-";
            }
            return gradeTonnage.totalGrade.toFixed(2);
          },
        },
        {
          title: "Reference",
          key: "reference",
          render: (_: any, site: MineralSite) => {
            return <ReferenceComponent site={site} />;
          },
        },
      ];
    }, [commodity.id, selectedRows,selectedRows, handleCreateOne]);

    useEffect(() => {
      mineralSiteStore.fetchByIds(dedupSite.sites);
    }, [mineralSiteStore, dedupSite.sites]);

    return (
      <>
        <Table<MineralSite>
          className={classes.table}
          bordered={true}
          pagination={false}
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={sites}
          loading={isLoading}
          rowClassName={(site) => {
            return site.createdBy.includes(userStore.getCurrentUser()!.url) ? classes.myEditedRow : "";
          }}
        />
      </>
    );
  })
) as React.FC<UngroupProps>;

const ReferenceComponent: React.FC<{ site: MineralSite }> = ({ site }) => {
  const docs = useMemo(() => {
    return Object.values(site.getReferencedDocuments());
  }, [site]);

  return (
    <Typography.Text ellipsis={true} style={{ maxWidth: 200 }}>
      {join(
        docs.map((doc) => (
          <Typography.Link key={doc.uri} target="_blank" href={doc.uri}>
            {doc.title || doc.uri}
          </Typography.Link>
        )),
        (index) => (
          <span key={`sep-${index}`}>&nbsp;·&nbsp;</span>
        )
      )}
    </Typography.Text>
  );
};
