import Board from "./Board";
import Deck from "./Deck";
import { Rotation } from "./Rotation";
import Terrain from "./Terrain";

export default class Player extends Deck<Terrain> {
  play(board: Board): boolean {
    for (let i = 0; i < this.cards.length; ++i) {
      for (let j = 0; j < this.cards[i]!.permutationsCount; ++j) {
        if (board.placeTerrain(this.cards[i]!)) {
          this.cards.splice(i, 1);
          return true;
        }
        this.cards[i]?.rotate(Rotation.Clockwise90);
      }
    }
    return false;
  }
}
