import Terrain, { TerrainType } from "./Terrain";

export type TerrainDistribution = Record<TerrainType, number>;

export default class TerrainGenerator {
  static createDistribution(): TerrainDistribution {
    return {
      [TerrainType.Zero]: 0,
      [TerrainType.One]: 20,
      [TerrainType.TwoI]: 20,
      [TerrainType.TwoL]: 20,
      [TerrainType.Three]: 20,
      [TerrainType.Four]: 20,
    };
  }

  static isDistributionValid(distribution: TerrainDistribution): boolean {
    const sum =
      distribution[TerrainType.Zero] +
      distribution[TerrainType.One] +
      distribution[TerrainType.TwoI] +
      distribution[TerrainType.TwoL] +
      distribution[TerrainType.Three] +
      distribution[TerrainType.Four];
    return sum === 100;
  }

  static generate(
    quantity: number,
    distribution: TerrainDistribution
  ): Terrain[] {
    const terrains: Terrain[] = [];

    for (let typeStr in distribution) {
      const type = Number(typeStr) as unknown as TerrainType;
      for (let i = 0; i < (distribution[type] / 100) * quantity; ++i) {
        terrains.push(Terrain.create(type));
      }
    }

    for (let i = 0; i < quantity - terrains.length; ++i) {
      terrains.push(Terrain.create(TerrainType.Four));
    }

    return terrains;
  }
}
