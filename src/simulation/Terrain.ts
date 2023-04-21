import Card from "./Card";
import { Rotation } from "./Rotation";

export enum TerrainType {
  Zero,
  One,
  TwoL,
  TwoI,
  Three,
  Four,
}

export default abstract class Terrain extends Card {
  abstract permutationsCount: number;

  north: boolean = false;
  east: boolean = false;
  south: boolean = false;
  west: boolean = false;

  static create(type: TerrainType): Terrain {
    switch (type) {
      case TerrainType.One:
        return new TerrainOne();
      case TerrainType.TwoI:
        return new TerrainTwoI();
      case TerrainType.TwoL:
        return new TerrainTwoL();
      case TerrainType.Three:
        return new TerrainThree();
      case TerrainType.Four:
        return new TerrainFour();
    }
    return new TerrainZero();
  }

  rotate(rotation: Rotation): void {
    const north = this.north;
    const east = this.east;
    const south = this.south;
    const west = this.west;

    switch (rotation) {
      case Rotation.Clockwise90:
        this.north = west;
        this.west = south;
        this.south = east;
        this.east = north;
        return;
      case Rotation.Clockwise180:
        this.north = south;
        this.west = east;
        this.south = north;
        this.east = west;
        return;
      case Rotation.Clockwise270:
        this.north = east;
        this.west = north;
        this.south = west;
        this.east = south;
        return;
    }
  }

  toString(): string {
    if (!this.north && !this.south && !this.east && !this.west) return "┼";

    if (this.north && !this.south && !this.east && !this.west) return "╀";
    if (!this.north && this.south && !this.east && !this.west) return "╁";
    if (!this.north && !this.south && this.east && !this.west) return "┾";
    if (!this.north && !this.south && !this.east && this.west) return "┽";

    if (this.north && this.south && !this.east && !this.west) return "╂";
    if (!this.north && !this.south && this.east && this.west) return "┿";

    if (this.north && !this.south && this.east && !this.west) return "╄";
    if (!this.north && this.south && this.east && !this.west) return "╆";
    if (!this.north && this.south && !this.east && this.west) return "╅";
    if (this.north && !this.south && !this.east && this.west) return "╃";

    if (!this.north && this.south && this.east && this.west) return "╈";
    if (this.north && !this.south && this.east && this.west) return "╇";
    if (this.north && this.south && !this.east && this.west) return "╉";
    if (this.north && this.south && this.east && !this.west) return "╊";

    if (this.north && this.south && this.east && this.west) return "╋";

    return "?";
  }
}

export class TerrainZero extends Terrain {
  permutationsCount: number = 1;

  constructor() {
    super();
    this.north = false;
    this.south = false;
    this.east = false;
    this.west = false;
  }

  rotate(rotation: Rotation): void {
    // Do nothing.
  }

  // toString(): string {
  //   return "┼";
  // }
}

export class TerrainOne extends Terrain {
  permutationsCount: number = 4;

  constructor() {
    super();
    this.north = true;
    this.south = false;
    this.east = false;
    this.west = false;
  }

  // toString(): string {
  //   if (this.north) return "╀";
  //   if (this.south) return "╁";
  //   if (this.east) return "┾";
  //   if (this.west) return "┽";
  //   return "┼";
  // }
}

export class TerrainTwoI extends Terrain {
  permutationsCount: number = 2;

  constructor() {
    super();
    this.north = true;
    this.south = true;
    this.east = false;
    this.west = false;
  }

  rotate(rotation: Rotation): void {
    const north = this.north;
    const east = this.east;
    const south = this.south;
    const west = this.west;

    switch (rotation) {
      case Rotation.Clockwise90:
        this.north = west;
        this.west = south;
        this.south = east;
        this.east = north;
        return;
      case Rotation.Clockwise270:
        this.north = east;
        this.west = north;
        this.south = west;
        this.east = south;
        return;
    }
  }

  // toString(): string {
  //   if (this.north && this.south) return "╂";
  //   if (this.east && this.west) return "┿";
  //   return "┼";
  // }
}

export class TerrainTwoL extends Terrain {
  permutationsCount: number = 4;

  constructor() {
    super();
    this.north = true;
    this.south = false;
    this.east = true;
    this.west = false;
  }

  // toString(): string {
  //   if (this.north && this.east) return "╄";
  //   if (this.east && this.south) return "╆";
  //   if (this.south && this.west) return "╅";
  //   if (this.west && this.north) return "╃";
  //   return "┼";
  // }
}

export class TerrainThree extends Terrain {
  permutationsCount: number = 4;

  constructor() {
    super();
    this.north = true;
    this.south = false;
    this.east = true;
    this.west = true;
  }

  // toString(): string {
  //   if (!this.north) return "╈";
  //   if (!this.south) return "╇";
  //   if (!this.east) return "╉";
  //   if (!this.west) return "╊";
  //   return "┼";
  // }
}

export class TerrainFour extends Terrain {
  permutationsCount: number = 1;

  constructor() {
    super();
    this.north = true;
    this.south = true;
    this.east = true;
    this.west = true;
  }

  rotate(rotation: Rotation): void {
    // Do nothing.
  }

  toString(): string {
    return "╋";
  }
}
