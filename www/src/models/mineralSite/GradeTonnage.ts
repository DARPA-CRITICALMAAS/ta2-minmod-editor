import { InternalID } from "models/typing";

export class GradeTonnage {
  commodity: InternalID; // ID not URI
  totalTonnage?: number;
  totalGrade?: number;
  totalContainedMetal?: number;

  public constructor({ commodity, totalTonnage, totalGrade, totalContainedMetal }: { commodity: InternalID; totalTonnage?: number; totalGrade?: number; totalContainedMetal?: number }) {
    this.commodity = commodity;
    this.totalTonnage = totalTonnage;
    this.totalGrade = totalGrade;
    this.totalContainedMetal = totalContainedMetal;
    if (totalTonnage !== undefined && totalGrade !== undefined && totalContainedMetal === undefined) {
      this.totalContainedMetal = totalTonnage * totalGrade / 100;
    }
  }

  public clone(): GradeTonnage {
    return new GradeTonnage({
      commodity: this.commodity,
      totalTonnage: this.totalTonnage,
      totalGrade: this.totalGrade,
      totalContainedMetal: this.totalContainedMetal,
    });
  }

  public static deserialize(obj: any): GradeTonnage {
    return new GradeTonnage({
      commodity: obj.commodity,
      totalTonnage: obj.total_tonnage,
      totalGrade: obj.total_grade,
      totalContainedMetal: obj.total_contained_metal,
    });
  }
}
