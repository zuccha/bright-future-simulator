import Terrain, { TerrainType } from "./Terrain";

type Lot = { terrain: Terrain | undefined; x: number; y: number };

export default class Board {
  private buildableLots: Set<Lot> = new Set();
  private grid: Lot[][] = [[]];

  constructor(size: number) {
    if (size % 2 == 0) {
      throw new Error(`Cannot build board of even size ${size}`);
    }

    this.grid = [];
    for (let i = 0; i < size; ++i) {
      this.grid.push([]);
      for (let j = 0; j < size; ++j) {
        this.grid[i]?.push({ terrain: undefined, x: j, y: i });
      }
    }

    const middleLot = this.grid[(size - 1) / 2]![(size - 1) / 2]!;
    this.buildableLots = new Set();
    this.buildableLots.add(middleLot);
    this.build(middleLot, Terrain.create(TerrainType.Four));
  }

  placeTerrain(terrain: Terrain): boolean {
    // We are trying to build the given terrain in any of the buildable lots.
    for (let buildableLot of this.buildableLots) {
      if (terrain.north) {
        const northLot = this.get(buildableLot.x, buildableLot.y - 1);
        if (northLot?.terrain?.south) {
          this.build(buildableLot, terrain);
          return true;
        }
      }
      if (terrain.south) {
        const southLot = this.get(buildableLot.x, buildableLot.y + 1);
        if (southLot?.terrain?.north) {
          this.build(buildableLot, terrain);
          return true;
        }
      }
      if (terrain.east) {
        const eastLot = this.get(buildableLot.x + 1, buildableLot.y);
        if (eastLot?.terrain?.west) {
          this.build(buildableLot, terrain);
          return true;
        }
      }
      if (terrain.west) {
        const westLot = this.get(buildableLot.x - 1, buildableLot.y);
        if (westLot?.terrain?.east) {
          this.build(buildableLot, terrain);
          return true;
        }
      }
    }
    return false;
  }

  emptyLotsCount(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; ++i) {
      for (let j = 0; j < this.grid[i]!.length; ++j) {
        const lot = this.grid[i]![j]!;
        if (!lot.terrain) count++;
      }
    }
    return count;
  }

  occupiedLotsCount(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; ++i) {
      for (let j = 0; j < this.grid[i]!.length; ++j) {
        const lot = this.grid[i]![j]!;
        if (lot.terrain) count++;
      }
    }
    return count;
  }

  toString(): string {
    let str: string = "";
    for (let i = 0; i < this.grid.length; ++i) {
      for (let j = 0; j < this.grid[i]!.length; ++j) {
        const cell = this.grid[i]![j]!;
        str += cell.terrain ? cell.terrain.toString() : "┼";
      }
      str += "\n";
    }
    return str;
  }

  private get(x: number, y: number): Lot | undefined {
    return this.grid[y]?.[x];
  }

  private build(lot: Lot, terrain: Terrain): void {
    if (this.buildableLots.delete(lot)) {
      lot.terrain = terrain;

      if (terrain.north) this.addBuildableLot(this.get(lot.x, lot.y - 1));
      if (terrain.south) this.addBuildableLot(this.get(lot.x, lot.y + 1));
      if (terrain.east) this.addBuildableLot(this.get(lot.x + 1, lot.y));
      if (terrain.west) this.addBuildableLot(this.get(lot.x - 1, lot.y));
    }
  }

  private addBuildableLot(lot: Lot | undefined): void {
    if (lot && lot.terrain === undefined) this.buildableLots.add(lot);
  }
}
