import { MineralSite } from "models";

export function buildConnectionUrl(site: MineralSite, sourceConnections: Record<string, string>): string | null {
    const sourceId = site.sourceId;
    let connection = sourceConnections[sourceId];

    if (connection != null && connection.startsWith("pdf:::")) {
        connection = connection.replace("pdf:::", "");
        const recordId = site.recordId;
        const pageInfo = site.reference[0]?.pageInfo;

        const page = Array.isArray(pageInfo) && pageInfo.length > 0 ? pageInfo[0]?.page ?? 1 : 1;

        connection = connection
            .replace("{record_id}", recordId)
            .replace(/\{page_number(=[0-9]*)?\}/, `page_number=${page}`);
    }

    return connection;
}
