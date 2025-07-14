import _ from "lodash";
import { Input, Select, Space } from "antd";
import { CandidateEntity, Commodity, useStores } from "models";
import { FormItem } from "components/FormItem";
import { observer } from "mobx-react-lite";
import { IRI } from "models/typing";
import { Measure } from "models/mineralSite/MineralInventory";
import { useMemo } from "react";

type ValueType = { grade?: Measure; ore?: Measure };

/// An input component for selecting units, the value is normalizedURI
const UnitInput = observer(
  ({
    defaultValue,
    options,
    value,
    onChange,
  }: {
    defaultValue?: string;
    options: Set<IRI>;
    value?: string;
    onChange: (value: string) => void;
  }) => {
    const { unitStore } = useStores();

    const selectOptions = useMemo(() => {
      return unitStore.list
        .filter((unit) => options.has(unit.uri))
        .map((unit) => ({
          value: unit.uri,
          label: unit.name,
        }));
    }, [options, unitStore.records]);

    return <Select defaultValue={defaultValue} value={value} options={selectOptions} onChange={onChange} />;
  }
);

const TONNAGE_UNITS = new Set([
  "https://minmod.isi.edu/resource/Q202",
  "https://minmod.isi.edu/resource/Q200",
  "https://minmod.isi.edu/resource/Q213",
  "https://minmod.isi.edu/resource/Q214",
  "https://minmod.isi.edu/resource/Q215",
]);

const GRADE_UNITS = new Set([
  "https://minmod.isi.edu/resource/Q201",
  "https://minmod.isi.edu/resource/Q203",
  "https://minmod.isi.edu/resource/Q220",
  "https://minmod.isi.edu/resource/Q217",
]);

export const MineralInventoryInput = observer(
  ({
    commodity,
    value,
    setValue,
    createdBy,
  }: {
    createdBy: IRI;
    commodity: Commodity;
    value?: ValueType;
    setValue: (value: ValueType) => void;
  }) => {
    const { unitStore } = useStores();

    return (
      <>
        <FormItem label={"Tonnage"} name="tonnage" tooltip="This is a required field" required={true}>
          <Space.Compact>
            <Input
              type="number"
              value={value?.ore?.value}
              onChange={(e) => {
                const newValue = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value);
                setValue({ ore: new Measure({ value: newValue, unit: value?.ore?.unit }), grade: value?.grade });
              }}
            />
            <UnitInput
              defaultValue="https://minmod.isi.edu/resource/Q202"
              value={value?.ore?.unit?.normalizedURI}
              options={TONNAGE_UNITS}
              onChange={(unitURI) => {
                let ore = value?.ore;
                if (ore === undefined) {
                  ore = new Measure({
                    value: 0,
                  });
                }
                ore.unit = new CandidateEntity({
                  source: createdBy,
                  confidence: 1.0,
                  observedName: unitStore.getByURI(unitURI)?.name,
                  normalizedURI: unitURI,
                });
                setValue({ ore, grade: value?.grade });
              }}
            />
          </Space.Compact>
        </FormItem>
        <FormItem label={"Grade"} name="fieldValueType" tooltip="This is a required field" required={true}>
          <Space.Compact>
            <Input
              type="number"
              value={value?.grade?.value}
              onChange={(e) => {
                const newValue = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value);
                setValue({ grade: new Measure({ value: newValue, unit: value?.grade?.unit }), ore: value?.ore });
              }}
            />
            <UnitInput
              defaultValue="https://minmod.isi.edu/resource/Q201"
              value={value?.grade?.unit?.normalizedURI}
              options={GRADE_UNITS}
              onChange={(unitURI) => {
                let grade = value?.grade;
                if (grade === undefined) {
                  grade = new Measure({
                    value: 0,
                  });
                }
                grade.unit = new CandidateEntity({
                  source: createdBy,
                  confidence: 1.0,
                  observedName: unitStore.getByURI(unitURI)?.name,
                  normalizedURI: unitURI,
                });
                setValue({ ore: value?.ore, grade });
              }}
            />
          </Space.Compact>
        </FormItem>
      </>
    );
  }
);
