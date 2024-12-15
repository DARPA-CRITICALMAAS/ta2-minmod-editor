import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "env";

export interface Unit {
    id: string;
    name: string;
}

export class UnitStore extends RStore<string, Unit> {
    constructor() {
        super(`${SERVER}/api/v1/units`, undefined, false);
    }

    public getByURI(uri: string): Unit | undefined {
        const unit = this.records.get(uri);
        if (unit === null) return undefined;
        return unit;
    }

    async fetchAll(): Promise<void> {
        if (this.refetch || this.records.size === 0) {
            await this.fetch({});
        }
    }

    public deserialize(obj: any): Unit {
        return {
            id: obj.uri,
            name: obj.name,
        };
    }

    protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
        return { items: resp.data, total: resp.total };
    }
}
