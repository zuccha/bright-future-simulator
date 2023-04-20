import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Switch,
  Text,
  VStack,
} from "@hope-ui/solid";
import { For, Show, createSignal } from "solid-js";

const GAP = 10;
const FORM_CONTROL_PROPS = { flex: 1, minWidth: 120 };

const computeNumberOfCircles = (cardsCount: number): number => {
  if (cardsCount <= 0) return 0;
  const x = Math.ceil(Math.sqrt(cardsCount));
  return Math.ceil((x % 2 == 0 ? x + 1 : x) / 2);
};

function ConfigurationPage() {
  const [errors, setErrors] = createSignal<string[]>([]);

  const [isRunningSimulation, setIsRunningSimulation] = createSignal(false);
  const [simulationProgress, setSimulationProgress] = createSignal(0);

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

  const validate = (): string[] => {
    const errors: string[] = [];
    if (playersCount() <= 0) errors.push("Not enough players (min 1)");
    if (cardsCount() < playersCount())
      errors.push("Not enough cards in deck for all players");
    if (maxCircles() < computeNumberOfCircles(cardsCount()))
      errors.push("Not enought circles, not all cards can be played");
    return errors;
  };

  const handleRunSimulation = async () => {
    const newErrors = validate();
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setIsRunningSimulation(true);

    setSimulationProgress(0);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSimulationProgress(0.1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSimulationProgress(0.5);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSimulationProgress(0.75);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSimulationProgress(0.99);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRunningSimulation(false);
  };

  return (
    <Flex
      height="100%"
      alignItems="center"
      justifyContent="center"
      padding="$10"
    >
      <Flex maxWidth={300} width="100%" gap={GAP} direction="column">
        <Heading size="lg" marginBottom="$4">
          Configure Simulation
        </Heading>

        <Flex wrap="wrap" flex={1} gap={GAP}>
          <FormControl
            {...FORM_CONTROL_PROPS}
            disabled={isRunningSimulation()}
            required
          >
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
          <FormControl
            {...FORM_CONTROL_PROPS}
            disabled={isRunningSimulation()}
            required
          >
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
            disabled={!useCustomMaxCircles() || isRunningSimulation()}
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
            disabled={isRunningSimulation()}
            onChange={handleChangeUseCustomMaxCircles}
          >
            Custom number of circles
          </Checkbox>
        </Flex>

        <Button
          disabled={isRunningSimulation()}
          loading={isRunningSimulation()}
          loadingText={`${Math.ceil(simulationProgress() * 100)}%`}
          marginTop="$4"
          onClick={handleRunSimulation}
        >
          Run Simulation
        </Button>

        <Show when={errors().length > 0}>
          <Flex direction="column">
            <For each={errors()}>
              {(error) => (
                <Text fontSize="$sm" color="red">
                  {error}
                </Text>
              )}
            </For>
          </Flex>
        </Show>
      </Flex>
    </Flex>
  );
}

export default ConfigurationPage;
