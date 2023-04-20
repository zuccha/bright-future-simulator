import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Text,
  VStack,
} from "@hope-ui/solid";
import { createSignal } from "solid-js";

const GAP = 10;
const FORM_CONTROL_PROPS = { flex: 1, minWidth: 120 };

const computeNumberOfCircles = (cardsCount: number): number => {
  if (cardsCount <= 0) return 0;
  const x = Math.ceil(Math.sqrt(cardsCount));
  return Math.ceil((x % 2 == 0 ? x + 1 : x) / 2);
};

function ConfigurationPage() {
  const [playersCount, setPlayersCount] = createSignal(1);
  const [cardsCount, setCardsCount] = createSignal(1);
  const [useCustomMaxCircles, setUseCustomMaxCircles] = createSignal(false);
  const [maxCircles, setMaxCircles] = createSignal(
    computeNumberOfCircles(cardsCount())
  );

  const handleChangePlayersCount = (e: { target: HTMLInputElement }): void => {
    setPlayersCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeCardsCount = (e: { target: HTMLInputElement }): void => {
    const newCardsCount = Number.parseInt(e.target.value) || 1;
    setCardsCount(newCardsCount);
    if (!useCustomMaxCircles())
      setMaxCircles(computeNumberOfCircles(newCardsCount));
  };

  const handleChangeNumberOfCircles = (e: {
    target: HTMLInputElement;
  }): void => {
    setMaxCircles(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeUseCustomMaxCircles = (e: { target: Element }): void => {
    const target = e.target as unknown as HTMLInputElement;
    setUseCustomMaxCircles(target.checked);
    if (!target.checked) setMaxCircles(computeNumberOfCircles(cardsCount()));
  };

  return (
    <Flex
      height="100%"
      alignItems="center"
      justifyContent="center"
      padding="$10"
    >
      <Flex maxWidth={300} width="100%" gap={GAP} direction="column">
        <Flex wrap="wrap" flex={1} gap={GAP}>
          <FormControl {...FORM_CONTROL_PROPS} required>
            <FormLabel>Players</FormLabel>
            <Input
              min={1}
              max={10}
              onInput={handleChangePlayersCount}
              placeholder="Number of players"
              type="number"
              value={playersCount()}
            />
          </FormControl>
        </Flex>

        <Flex wrap="wrap" flex={1} gap={GAP}>
          <FormControl {...FORM_CONTROL_PROPS} required>
            <FormLabel>Deck size</FormLabel>
            <Input
              min={1}
              max={200}
              onInput={handleChangeCardsCount}
              placeholder="Deck size"
              type="number"
              value={cardsCount()}
            />
          </FormControl>

          <FormControl
            {...FORM_CONTROL_PROPS}
            disabled={!useCustomMaxCircles()}
            readOnly={!useCustomMaxCircles()}
            required
          >
            <FormLabel>Number of circles</FormLabel>
            <Input
              min={1}
              max={200}
              onInput={handleChangeNumberOfCircles}
              placeholder="Number of circles"
              type="number"
              value={maxCircles()}
            />
          </FormControl>

          <Checkbox
            checked={useCustomMaxCircles()}
            onChange={handleChangeUseCustomMaxCircles}
          >
            Custom number of circles
          </Checkbox>
        </Flex>

        <Button>Run Simulation</Button>
      </Flex>
    </Flex>
  );
}

export default ConfigurationPage;
