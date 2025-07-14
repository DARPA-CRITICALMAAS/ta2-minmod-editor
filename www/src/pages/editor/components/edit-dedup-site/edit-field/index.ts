import _ from "lodash";
import { MineralSite } from "models";
import { InternalID } from "models/typing";


export interface FormItemInputProps<T> {
  currentSite: MineralSite | undefined;
  sites: MineralSite[];
  setFieldProvenance: (key: string | undefined) => void;
  commodity: InternalID;
  value?: T;
  setValue: (value: T) => void;
}