import { Button, Col, Flex, Row, Select, Space, Table, Typography, Checkbox } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { useStores, Commodity, DedupMineralSite, MineralSite, CandidateEntity, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { useEffect, useMemo, useState } from "react";
import { WithStyles, withStyles } from "@material-ui/styles";
import { CanEntComponent, ListCanEntComponent } from "./editDedupSite/CandidateEntity";
import { join } from "misc";
import { orange } from "@ant-design/colors";

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
const handleUngroupAll = async () => {
    console.log("clicked handleGroup")
}

const handleCreateDedupSite = async () => {
    console.log("clicked handleCreateDedupSite")
}


export const Ungroup = withStyles(css)(
  observer(({ dedupSite, commodity, classes }: UngroupProps & WithStyles<typeof css>) => {
    const stores = useStores();
    const { mineralSiteStore, userStore } = stores;
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const columns = useMemo(() => {
      return [
        {
            title: (
                <Space>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                  <Button style={{background:"#e6f4ff", color:"#1677ff"}}
                    type="default"
                    size="small"
                    onClick={handleUngroupAll} 

                  >
                    Ungroup All
                  </Button>
                  <Button style={{background:"#e6f4ff", color:"#1677ff"}}
                    type="default"
                    size="small"
                    onClick={handleCreateDedupSite}
                  >
                    Create New
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
    }, [commodity.id, selectedRows]);

    useEffect(() => {
      mineralSiteStore.fetchByIds(dedupSite.sites);
    }, [mineralSiteStore]);

    const tmpLst: (MineralSite | null | undefined)[] = dedupSite.sites.map((id) => mineralSiteStore.get(id));
    const fetchedSites = tmpLst.filter((site) => site !== undefined) as (MineralSite | null)[];
    const sites = fetchedSites.filter((site) => site !== null) as MineralSite[];
    const isLoading = mineralSiteStore.state.value === "updating" || fetchedSites.length !== dedupSite.sites.length;

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
