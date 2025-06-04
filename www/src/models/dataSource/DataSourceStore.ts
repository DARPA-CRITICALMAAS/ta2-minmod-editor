import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "env";
import { IRI } from "models/typing";

export interface DataSource {
  id: IRI;
  uri: IRI;
  name: string;
  type: "database" | "article" | "mining-report" | "unpublished";
  connection: string;
}

export class DataSourceStore extends RStore<string, DataSource> {
  constructor() {
    super(`${SERVER}/api/v1/data-sources`, undefined, false);
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public deserialize(obj: any): DataSource {
    return {
      id: obj.uri,
      uri: obj.uri,
      name: obj.name,
      type: obj.type,
      connection: obj.connection,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
