import Deck from "./Deck";
import Game from "./Game";
import Terrain from "./Terrain";

export default class Simulation {
  private terrains: Terrain[];
  private boardSize: number;
  private iterationsCount: number;
  private playersCount: number;

  constructor(
    terrains: Terrain[],
    boardSize: number,
    playersCount: number,
    iterationsCount: number
  ) {
    this.terrains = terrains;
    this.boardSize = boardSize;
    this.playersCount = playersCount;
    this.iterationsCount = iterationsCount;
  }

  run(): string {
    const deck = new Deck<Terrain>();
    deck.add(this.terrains);
    deck.shuffle();

    const game = new Game(deck, this.boardSize, this.playersCount);

    game.simulate();

    return game.toString();
  }
}
