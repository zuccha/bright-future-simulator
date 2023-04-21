import Card from "./Card";

export default class Deck<C extends Card> {
  protected cards: C[] = [];

  draw(n: number): C[] {
    const cards: C[] = [];
    for (let i = 0; i < n; ++i) {
      const card = this.cards.pop();
      if (card) cards.push(card);
      else break;
    }
    return cards;
  }

  add(cards: C[]): void {
    for (let card of cards) this.cards.push(card);
  }

  shuffle() {
    let currentIndex = this.cards.length;
    let randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex]!,
        this.cards[currentIndex]!,
      ];
    }

    for (let card of this.cards) card.spin();
  }

  size(): number {
    return this.cards.length;
  }
}
