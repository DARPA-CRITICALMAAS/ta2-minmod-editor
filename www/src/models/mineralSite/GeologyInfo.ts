export class RockType {
  unit?: string;
  type?: string;

  public constructor({ unit, type }: { unit?: string; type?: string }) {
    this.unit = unit;
    this.type = type;
  }

  public serialize() {
    return {
      unit: this.unit,
      type: this.type,
    };
  }

  public isEmpty(): boolean {
    return (this.unit === undefined || this.unit.trim() === "") && (this.type === undefined || this.type.trim() === "");
  }
}

export class GeologyInfo {
  alteration?: string;
  concentrationProcess?: string;
  oreControl?: string;
  hostRock?: RockType;
  associatedRock?: RockType;
  structure?: string;
  tectonic?: string;

  public constructor({
    alteration,
    concentrationProcess,
    oreControl,
    hostRock,
    associatedRock,
    structure,
    tectonic,
  }: {
    alteration?: string;
    concentrationProcess?: string;
    oreControl?: string;
    hostRock?: RockType;
    associatedRock?: RockType;
    structure?: string;
    tectonic?: string;
  }) {
    this.alteration = alteration;
    this.concentrationProcess = concentrationProcess;
    this.oreControl = oreControl;
    this.hostRock = hostRock;
    this.associatedRock = associatedRock;
    this.structure = structure;
    this.tectonic = tectonic;
  }

  isEmpty(): boolean {
    return this.alteration === undefined &&
      this.concentrationProcess === undefined &&
      this.oreControl === undefined &&
      this.hostRock === undefined &&
      this.associatedRock === undefined &&
      this.structure === undefined &&
      this.tectonic === undefined;
  }

  public static deserialize(obj: any) {
    return new GeologyInfo({
      alteration: obj.alteration,
      concentrationProcess: obj.concentration_process,
      oreControl: obj.ore_control,
      hostRock: obj.host_rock === undefined ? undefined : new RockType(obj.host_rock),
      associatedRock: obj.associated_rock === undefined ? undefined : new RockType(obj.associated_rock),
      structure: obj.structure,
      tectonic: obj.tectonic,
    });
  }

  public serialize() {
    return {
      alteration: this.alteration,
      concentration_process: this.concentrationProcess,
      ore_control: this.oreControl,
      host_rock: this.hostRock?.serialize(),
      associated_rock: this.associatedRock?.serialize(),
      structure: this.structure,
      tectonic: this.tectonic,
    };
  }
}
