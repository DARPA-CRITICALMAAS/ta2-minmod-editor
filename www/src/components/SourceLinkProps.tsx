import React, { useMemo } from "react";
import { Typography } from "antd";
import { MineralSite } from "models";

interface SourceLinkProps {
    site: MineralSite;
    sourceConnections: Record<string, string>;
}

const SourceLink: React.FC<SourceLinkProps> = ({ site, sourceConnections }) => {
    const connection = useMemo(() => {
        const sourceId = site.sourceId;
        let connection = sourceConnections[sourceId];

        if (connection != null && connection.startsWith("pdf:::")) {
            connection = connection.replace("pdf:::", "");
            const recordId = site.recordId;
            const pageInfo = site.reference[0]?.pageInfo;

            if (Array.isArray(pageInfo) && pageInfo.length > 0) {
                const page = pageInfo[0]?.page ?? 1;
                connection = connection
                    .replace("{record_id}", recordId)
                    .replace(/\{page_number(=[0-9]*)?\}/, `page_number=${page}`);
            } else {
                connection = connection.replace("{record_id}", recordId);
            }
        }

        return connection;
    }, [site, sourceConnections]);

    return connection ? (
        <Typography.Link target="_blank" href={connection}>
            {connection}
        </Typography.Link>
    ) : (
        <ReferenceComponent site={site} />
    );
};

export default SourceLink;

const ReferenceComponent: React.FC<{ site: MineralSite }> = ({ site }) => {
    const docs = useMemo(() => {
        return Object.values(site.getReferencedDocuments());
    }, [site]);

    return (
        <Typography.Text ellipsis={true} style={{ maxWidth: 200 }}>
            {docs.map((doc, index) => (
                <React.Fragment key={doc.uri}>
                    <Typography.Link target="_blank" href={doc.uri}>
                        {doc.title || doc.uri}
                    </Typography.Link>
                    {index < docs.length - 1 && <span>&nbsp;·&nbsp;</span>}
                </React.Fragment>
            ))}
        </Typography.Text>
    );
};
