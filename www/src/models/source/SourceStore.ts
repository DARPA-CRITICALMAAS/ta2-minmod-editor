import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "env";
import { IRI } from "models/typing";

export interface Source {
  id: IRI;
  uri: IRI;
  connection: string;
}
export class SourceStore extends RStore<string, Source> {
  constructor() {
    super(`${SERVER}/api/v1/sources`, undefined, false);
  }

  async fetchSourcesAndConnections(): Promise<Record<string, string>> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }

    const connections: Record<string, string> = {};
    this.records.forEach((source) => {
      if (source !== null && source.connection !== undefined) {
        connections[source.id] = source.connection;
      }
    });
    return connections;
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public deserialize(obj: any): Source {
    return {
      id: obj.id,
      uri: obj.uri,
      connection: obj.connection,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
