import Board from "./Board";
import Deck from "./Deck";
import Player from "./Player";
import Terrain from "./Terrain";

export type GameReport = {
  totalTerrainsLeftInDeck: number;
  totalTerrainsLeftInPlayerHands: number;
  totalTerrainsLeft: number;
  totalOccupiedLotsOnBoard: number;
  totalEmptyLotsOnBoard: number;
  boardState: string;
};

export default class Game {
  private board: Board = new Board(1);
  private deck: Deck<Terrain> = new Deck<Terrain>();
  private players: Player[] = [];
  private roundsCount: number = 3;

  constructor(deck: Deck<Terrain>, boardSize: number, playersCount: number) {
    this.board = new Board(boardSize);
    this.deck = deck;
    this.players = [];
    for (let i = 0; i < playersCount; ++i) this.players.push(new Player());
  }

  simulate(): GameReport {
    // Add one initial card to all players.
    for (let player of this.players) player.add(this.deck.draw(1));

    // Play turns until the game is over.
    while (true) {
      // Each player goes back to 4 cards.
      // Do one card each so that one player doesn't end up with more cards, in
      // case the deck is empty.
      for (let i = 0; i < this.roundsCount; ++i)
        for (let player of this.players) player.add(this.deck.draw(1));

      // Shuffle players' hands for good mesure.
      for (let player of this.players) player.shuffle();

      // For each round, every player plays one card.
      // A player will fail to play a card if they don't have a card that fits
      // on the board, or if they don't have cards in hand.
      for (let i = 0; i < this.roundsCount; ++i) {
        for (let player of this.players) {
          if (!player.play(this.board)) return this.report();
        }
      }
    }
  }

  report(): GameReport {
    const totalTerrainsLeftInDeck = this.deck.size();
    const totalTerrainsLeftInPlayerHands = this.players
      .map((player) => player.size())
      .reduce((sizeSum, size) => sizeSum + size, 0);
    const totalTerrainsLeft =
      totalTerrainsLeftInDeck + totalTerrainsLeftInPlayerHands;

    return {
      totalTerrainsLeftInDeck,
      totalTerrainsLeftInPlayerHands,
      totalTerrainsLeft,
      totalEmptyLotsOnBoard: this.board.emptyLotsCount(),
      totalOccupiedLotsOnBoard: this.board.occupiedLotsCount(),
      boardState: this.board.toString(),
    };
  }

  toString(): string {
    let str = "";
    str += `Deck: ${this.deck.size()}\n`;
    for (let i = 0; i < this.players.length; ++i)
      str += `Player ${i + 1}: ${this.players[i]!.size()}\n`;
    str += this.board.toString();
    return str;
  }
}
