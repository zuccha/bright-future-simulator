import Deck from "./Deck";
import Game, { GameReport } from "./Game";
import Terrain from "./Terrain";
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

    return {
      averageTerrainsLeftInDeck: average(
        reports.map((report) => report.totalTerrainsLeftInDeck)
      ),
      averageTerrainsLeftInPlayerHands: average(
        reports.map((report) => report.totalTerrainsLeftInPlayerHands)
      ),
      averageTerrainsLeft: average(
        reports.map((report) => report.totalTerrainsLeft)
      ),
      averageOccupiedLotsOnBoard: average(
        reports.map((report) => report.totalOccupiedLotsOnBoard)
      ),
      averageEmptyLotsOnBoard: average(
        reports.map((report) => report.totalEmptyLotsOnBoard)
      ),
      boardSize: this.boardSize,
      reports,
      terrainDistribution: this.terrainDistribution,
      terrainsCount: this.terrainsCount,
    };
  }
}
