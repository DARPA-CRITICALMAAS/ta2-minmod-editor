import { DedupMineralSite, useStores } from "models";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Commodity } from "models/commodity";
import { Alert, Button, Checkbox, Divider, Flex, Space, Spin, Table, Typography } from "antd";
import { FetchResult } from "gena-app";
import { EditOutlined, UngroupOutlined } from "@ant-design/icons";
import { EditDedupMineralSite } from "./editDedupSite/EditDedupMineralSite";
import { Entity } from "components/Entity";
import axios from "axios";
import { DepositTypeStore } from "models/depositType";

interface DedupMineralSiteTableProps {
  commodity: Commodity | undefined;
}

const emptyFetchResult = { records: [], total: 0 };

const columns = [
  {
    title: "Select",
    key: "select",
    render: () => <Checkbox />,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: any, site: DedupMineralSite) => {
      return (
        <Typography.Link href={site.uri} target="_blank">
          {site.name}
        </Typography.Link>
      );
    },
    sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.name.localeCompare(b.name),
  },
  {
    title: "Type",
    key: "type",
    render: (_: any, site: DedupMineralSite) => {
      return <span className="font-small">{site.type}</span>;
    },
    sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.type.localeCompare(b.type),
  },
  {
    title: "Rank",
    key: "rank",
    render: (_: any, site: DedupMineralSite) => {
      return <span className="font-small">{site.rank}</span>;
    },
    sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.rank.localeCompare(b.rank),
  },
  {
    title: "Location",
    key: "location",
    render: (value: any, dedupSite: DedupMineralSite) => {
      if (dedupSite.location !== undefined && dedupSite.location.lat !== undefined && dedupSite.location.lon !== undefined) {
        return `${dedupSite.location.lat.toFixed(5)}, ${dedupSite.location.lon.toFixed(5)}`;
      }
      return "-";
    },
  },
  {
    title: "Country",
    key: "country",
    render: (_: any, site: DedupMineralSite) => {
      if (site.location === undefined) {
        return "-";
      }

      return (
        <Space split={<Divider type="vertical" />}>
          {site.location.country.map((country) => (
            <Entity key={country} uri={country} store="countryStore" />
          ))}
        </Space>
      );
    },
  },
  {
    title: "State/Province",
    key: "state",
    render: (_: any, site: DedupMineralSite) => {
      if (site.location === undefined) {
        return "-";
      }

      return (
        <Space split={<Divider type="vertical" />}>
          {site.location.stateOrProvince.map((province) => (
            <Entity key={province} uri={province} store="stateOrProvinceStore" />
          ))}
        </Space>
      );
    },
  },
  {
    title: "Deposit Type",
    key: "depositType",
    render: (_: any, site: DedupMineralSite) => {
      const dt = site.getTop1DepositType();
      if (dt === undefined) {
        return "-";
      }
      return <Entity uri={dt.uri} store="depositTypeStore" />;
    },
    // sorter: (a: DedupMineralSite, b: DedupMineralSite) => (a.getTop1DepositType()?.name || "").localeCompare(b.getTop1DepositType()?.name || ""),
  },
  {
    title: "Dep. Score",
    key: "depositConfidence",
    render: (_: any, site: DedupMineralSite) => {
      const dt = site.getTop1DepositType();
      if (dt === undefined) {
        return "-";
      }
      return dt.confidence.toFixed(4);
    },
  },
  {
    title: "Tonnage (Mt)",
    dataIndex: "totalTonnage",
    render: (_: any, site: DedupMineralSite) => {
      if (site.gradeTonnage !== undefined && site.gradeTonnage.totalTonnage !== undefined) {
        return site.gradeTonnage.totalTonnage.toFixed(4);
      }
      return "-";
    },
  },
  {
    title: "Grade (%)",
    dataIndex: "totalGrade",
    render: (_: any, site: DedupMineralSite) => {
      if (site.gradeTonnage !== undefined && site.gradeTonnage.totalGrade !== undefined) {
        return site.gradeTonnage.totalGrade.toFixed(2);
      }
      return "-";
    },
  },
  {
    title: "Action",
    key: "action",
  },
];

export const DedupMineralSiteTable: React.FC<DedupMineralSiteTableProps> = observer(({ commodity }) => {
  const { dedupMineralSiteStore, commodityStore } = useStores();
  const [editingDedupSite, setEditingDedupSite] = useState<string | undefined>(undefined);
  const [movedRows, setMovedRows] = useState<DedupMineralSite[]>([]);
  const [currentRows, setCurrentRows] = useState<DedupMineralSite[]>([]);
  const [groupSuccess, setGroupSuccess] = useState(false);
  const [showStickyDiv, setShowStickyDiv] = useState(true);

  useEffect(() => {
    if (commodity !== undefined) {
      dedupMineralSiteStore.fetchByCommodity(commodity);
    }
  }, [commodity]);

  if (dedupMineralSiteStore.state.value === "error") {
    return <Alert message="Error" description="An error occurred while querying dedup mineral sites. Please try again later." type="error" showIcon />;
  }

  const handleRowMove = (site: DedupMineralSite, toMoved: boolean) => {
    setGroupSuccess(false);
    setShowStickyDiv(true);
    if (toMoved) {
      setCurrentRows((rows) => rows.filter((row) => row.id !== site.id));
      setMovedRows((rows) => [...rows, site]);
    } else {
      setMovedRows((rows) => rows.filter((row) => row.id !== site.id));
      setCurrentRows((rows) => [...rows, site]);
    }
  };

  const handleGroup = async () => {
    try {
      const prevIds = movedRows.map((row) => row.id); 
      console.log("OLD Ids", prevIds);

  
      if (prevIds.length === 0) {
        alert("No site IDs found for grouping. Please add some rows.");
        return;
      }
  
      const allSiteIds = movedRows.flatMap((row) => row.sites.map((siteUri) => DedupMineralSite.getId(siteUri)));
  
      const sameAsPayload = [
        {
          sites: allSiteIds,
        },
      ];
  
      console.log("Grouping Payload:", sameAsPayload);
  
      try {
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
          await dedupMineralSiteStore.replaceSites(prevIds, newIds, commodityId);
          setGroupSuccess(true);
          setMovedRows([]);
          setCurrentRows((rows) => [...rows, ...movedRows]);
      } else {
          console.error("commodity is undefined or does not have an id");
      }  
        console.log("Sites replaced successfully.");
      } catch (error) {
        console.error("Error during /same-as API call:", error);
        alert("Group operation failed. Please check the console for details.");
      }
    } catch (generalError) {
      console.error("Unexpected error in handleGroup:", generalError);
      alert("An unexpected error occurred. Please check the console for details.");
    }
  };
  
  const isLoading = dedupMineralSiteStore.state.value === "updating";
  const dedupMineralSites = commodity === undefined || isLoading ? emptyFetchResult : dedupMineralSiteStore.getByCommodity(commodity);
  columns[columns.length - 1].render = (_: any, site: DedupMineralSite) => {
    return (
      <Space>
        <Button
          color="primary"
          size="middle"
          icon={<EditOutlined />}
          variant="filled"
          onClick={() => {
            if (site.id === editingDedupSite) {
              setEditingDedupSite(undefined);
            } else {
              setEditingDedupSite(site.id);
            }
          }}
        >
          Edit
        </Button>
        <Button color="default" size="middle" icon={<UngroupOutlined />} variant="filled">
          Ungroup
        </Button>
      </Space>
    );
  };

  columns[0].render = (_: any, site: DedupMineralSite) => <Checkbox onChange={(e) => handleRowMove(site, e.target.checked)} checked={movedRows.some((row) => row.id === site.id)} />;

  return (
    <>
          {groupSuccess && (
        <Alert
          message="Grouping successful!"
          type="success"
          showIcon
          closable
          afterClose={() => setGroupSuccess(false)}
        />
      )}
      {showStickyDiv && movedRows.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", marginTop: "16px" }}>
          <Typography.Title level={4}>Moved Rows</Typography.Title>
          <Button type="primary" onClick={handleGroup}>
            Group
          </Button>
          <Table<DedupMineralSite>
            bordered={true}
            size="small"
            rowKey="id"
            columns={[
              {
                title: (
                  <Button color="primary" variant="filled">
                    Group
                  </Button>
                ),
                key: "group",
                render: (_: any, site: DedupMineralSite) => <Checkbox type="primary" onClick={() => handleRowMove(site, false)} />,
              },
              ...columns.slice(1),
            ]}
            dataSource={movedRows}
          />
        </div>
      )}
      <Table<DedupMineralSite>
        bordered={true}
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={dedupMineralSites.records}
        loading={isLoading ? { size: "large" } : false}
        expandable={{
          expandedRowRender: (site) => <EditDedupMineralSite commodity={commodity!} dedupSite={site} />,
          showExpandColumn: false,
          expandedRowKeys: editingDedupSite === undefined ? [] : [editingDedupSite],
        }}
      />
    </>
  );
});
