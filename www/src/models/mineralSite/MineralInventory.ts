import { Commodity, IStore } from "models";
import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { Reference } from "./Reference";
import { IRI } from "models/typing";
import { UnitStore } from "models/units";

export class MineralInventory {
  category: CandidateEntity[];
  commodity: CandidateEntity;
  grade?: Measure;
  ore?: Measure;
  reference: Reference;

  public constructor({ category, commodity, grade, ore, reference }: { category: CandidateEntity[]; commodity: CandidateEntity; grade?: Measure; ore?: Measure; reference: Reference }) {
    this.category = category;
    this.commodity = commodity;
    this.grade = grade;
    this.ore = ore;
    this.reference = reference;
  }

  public static fromGradeTonnage(commodity: Commodity, createdBy: string, gradeTonnage: GradeTonnage, reference: Reference): MineralInventory {
    return new MineralInventory({
      category: ["Inferred", "Indicated", "Measured"].map(
        (name) => new CandidateEntity({ source: createdBy, confidence: 1.0, observedName: name, normalizedURI: "https://minmod.isi.edu/resource/" + name })
      ),
      commodity: new CandidateEntity({
        source: createdBy,
        confidence: 1.0,
        observedName: commodity.name,
        normalizedURI: commodity.uri,
      }),
      grade:
        gradeTonnage.totalGrade === undefined
          ? undefined
          : new Measure({
            value: gradeTonnage.totalGrade,
            unit: new CandidateEntity({
              source: createdBy,
              confidence: 1.0,
              observedName: "%",
              normalizedURI: "https://minmod.isi.edu/resource/Q201",
            }),
          }),
      ore:
        gradeTonnage.totalTonnage === undefined
          ? undefined
          : new Measure({
            value: gradeTonnage.totalTonnage,
            unit: new CandidateEntity({
              source: createdBy,
              confidence: 1.0,
              observedName: "%",
              normalizedURI: "https://minmod.isi.edu/resource/Q202",
            }),
          }),
      reference: reference,
    });
  }

  public static deserialize(obj: any): MineralInventory {
    return new MineralInventory({
      category: obj.category === undefined ? [] : obj.category.map(CandidateEntity.deserialize),
      commodity: CandidateEntity.deserialize(obj.commodity),
      grade: obj.grade === undefined ? undefined : Measure.deserialize(obj.grade),
      ore: obj.ore === undefined ? undefined : Measure.deserialize(obj.ore),
      reference: Reference.deserialize(obj.reference),
    });
  }

  public serialize(): object {
    return {
      category: this.category.map((entity) => entity.serialize()),
      commodity: this.commodity.serialize(),
      grade: this.grade === undefined ? undefined : this.grade.serialize(),
      ore: this.ore === undefined ? undefined : this.ore.serialize(),
      reference: this.reference.serialize(),
    };
  }

  public clone(): MineralInventory {
    return new MineralInventory({
      category: this.category.map((entity) => entity.clone()),
      commodity: this.commodity.clone(),
      grade: this.grade === undefined ? undefined : this.grade.clone(),
      ore: this.ore === undefined ? undefined : this.ore.clone(),
      reference: this.reference.clone(),
    });
  }
}

export class Measure {
  value: number;
  unit?: CandidateEntity;

  public constructor({ value, unit }: { value: number; unit?: CandidateEntity }) {
    this.value = value;
    this.unit = unit;
  }

  public toUnit(destUnitURI: IRI, createdBy: string, destUnitLabel?: string): Measure {
    let newValue;
    if (this.unit === undefined || this.unit.normalizedURI === undefined) {
      newValue = this.value;
    } else {
      newValue = UnitStore.conversion(this.value, this.unit.normalizedURI, destUnitURI);
    }

    return new Measure({
      value: newValue,
      unit: new CandidateEntity({
        source: createdBy,
        confidence: 1.0,
        observedName: destUnitLabel,
        normalizedURI: destUnitURI,
      })
    });
  }

  public static deserialize(obj: any): Measure {
    return new Measure({
      value: obj.value,
      unit: obj.unit === undefined ? undefined : CandidateEntity.deserialize(obj.unit),
    });
  }

  public serialize(): object {
    return {
      value: this.value,
      unit: this.unit === undefined ? undefined : this.unit.serialize(),
    };
  }

  public clone(): Measure {
    return new Measure({
      value: this.value,
      unit: this.unit === undefined ? undefined : this.unit.clone(),
    });
  }
}
