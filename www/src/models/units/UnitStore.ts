import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "env";
import { IRI } from "models/typing";

export interface Unit {
    id: IRI;
    uri: IRI;
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
            uri: obj.uri,
            name: obj.name,
        };
    }

    protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
        return { items: resp.data, total: resp.data.length };
    }

    static conversion(value: number, fromUnit: IRI, toUnit: IRI): number {
        if (fromUnit === toUnit) {
            return value;
        }

        if (toUnit.endsWith("Q202")) {
            // Convert to million tonnages
            if (fromUnit.endsWith("Q200")) {
                // from tonnes
                return value / 1_000_000;
            }
            if (fromUnit.endsWith("Q213")) {
                // from million short tons
                return value / 1.10231;
            }
            if (fromUnit.endsWith("Q214")) {
                return value / 1_000_000 / 1.10231;
            }
            if (fromUnit.endsWith("Q215")) {
                // million pounds
                return value * 0.000454;
            }
            throw new Error(`Conversion from ${fromUnit} to ${toUnit} is not implemented`);
        }

        if (toUnit.endsWith("Q201")) {
            // convert to percentage
            if (fromUnit.endsWith("Q203") || fromUnit.endsWith("Q220")) {
                // from grams per tonne or parts per million
                return value / 10_000;
            }
            if (fromUnit.endsWith("Q217")) {
                // from kg per tonne
                return value / 10;
            }
            throw new Error(`Conversion from ${fromUnit} to ${toUnit} is not implemented`);
        }
        throw new Error(`Conversion from ${fromUnit} to ${toUnit} is not implemented`);
    }
}