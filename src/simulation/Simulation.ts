import Deck from "./Deck";
import Game, { GameReport } from "./Game";
import Terrain, {
  TerrainFour,
  TerrainOne,
  TerrainThree,
  TerrainTwoI,
  TerrainTwoL,
  TerrainType,
  TerrainZero,
} from "./Terrain";
import TerrainGenerator, { TerrainDistribution } from "./TerrainGenerator";

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export type SimulationReport = {
  averageTerrainsLeftInDeck: number;
  averageTerrainsLeftInPlayerHands: number;
  averageTerrainsLeft: number;
  averageOccupiedLotsOnBoard: number;
  averageEmptyLotsOnBoard: number;
  boardSize: number;
  reports: GameReport[];
  score: number;
  terrainDistribution: TerrainDistribution;
  terrainsCount: number;
};

export default class Simulation {
  private terrainsCount: number;
  private terrainDistribution: TerrainDistribution;
  private terrains: Terrain[];
  private boardSize: number;
  private iterationsCount: number;
  private playersCount: number;

  constructor(
    terrainsCount: number,
    terrainDistribution: TerrainDistribution,
    boardSize: number,
    playersCount: number,
    iterationsCount: number
  ) {
    this.terrainsCount = terrainsCount;
    this.terrainDistribution = terrainDistribution;
    this.terrains = TerrainGenerator.generate(
      terrainsCount,
      terrainDistribution
    );
    this.boardSize = boardSize;
    this.playersCount = playersCount;
    this.iterationsCount = iterationsCount;
  }

  run(onIteration: (iteration: number) => void): SimulationReport {
    const reports: GameReport[] = [];

    for (let i = 0; i < this.iterationsCount; ++i) {
      const deck = new Deck<Terrain>();
      deck.add(this.terrains);
      deck.shuffle();

      const game = new Game(deck, this.boardSize, this.playersCount);

      reports.push(game.simulate());
      onIteration(i);
    }

    const countTerrains = (predicate: (terrain: Terrain) => boolean) =>
      this.terrains.reduce(
        (count, terrain) => (predicate(terrain) ? count + 1 : count),
        0
      );

    const averageTerrainsLeftInDeck = average(
      reports.map((report) => report.totalTerrainsLeftInDeck)
    );
    const averageTerrainsLeftInPlayerHands = average(
      reports.map((report) => report.totalTerrainsLeftInPlayerHands)
    );
    const averageTerrainsLeft = average(
      reports.map((report) => report.totalTerrainsLeft)
    );
    const averageOccupiedLotsOnBoard = average(
      reports.map((report) => report.totalOccupiedLotsOnBoard)
    );
    const averageEmptyLotsOnBoard = average(
      reports.map((report) => report.totalEmptyLotsOnBoard)
    );

    return {
      averageTerrainsLeftInDeck,
      averageTerrainsLeftInPlayerHands,
      averageTerrainsLeft,
      averageOccupiedLotsOnBoard,
      averageEmptyLotsOnBoard,
      boardSize: this.boardSize,
      reports,
      score: (this.terrainsCount - averageTerrainsLeft) / this.terrainsCount,
      terrainDistribution: {
        [TerrainType.Zero]: countTerrains((t) => t instanceof TerrainZero),
        [TerrainType.One]: countTerrains((t) => t instanceof TerrainOne),
        [TerrainType.TwoI]: countTerrains((t) => t instanceof TerrainTwoI),
        [TerrainType.TwoL]: countTerrains((t) => t instanceof TerrainTwoL),
        [TerrainType.Three]: countTerrains((t) => t instanceof TerrainThree),
        [TerrainType.Four]: countTerrains((t) => t instanceof TerrainFour),
      },
      terrainsCount: this.terrainsCount,
    };
  }
}
