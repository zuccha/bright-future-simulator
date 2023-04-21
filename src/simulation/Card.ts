import { Rotation } from "./Rotation";

const rotations = [
  Rotation.None,
  Rotation.Clockwise90,
  Rotation.Clockwise180,
  Rotation.Clockwise270,
] as const;

export default abstract class Card {
  spin() {
    const rotation: Rotation =
      rotations[Math.floor(Math.random() * rotations.length)]!;
    this.rotate(rotation);
  }

  abstract rotate(rotation: Rotation): void;

  abstract toString(): string;
}
