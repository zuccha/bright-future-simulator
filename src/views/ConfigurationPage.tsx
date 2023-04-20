import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
  Text,
} from "@hope-ui/solid";
import { For, Show, createSignal } from "solid-js";

const GAP = 10;
const FORM_CONTROL_PROPS = { flex: 1, minWidth: 120 } as const;
const FORM_GROUP_PROPS = { flex: 1, gap: GAP, wrap: "wrap" } as const;
const INNER_FORM_GROUP_PROPS = {
  ...FORM_GROUP_PROPS,
  borderColor: "$neutral6",
  borderLeftWidth: 2,
  paddingLeft: "$4",
} as const;
const DISTRIBUTION_INPUT_PROPS = {
  flex: 1,
  fontSize: "$sm",
  min: 1,
  max: 100,
  size: "sm",
  // type: "number",
} as const;
const LEFT_DISTRIBUTION_INPUT_PROPS = {
  ...DISTRIBUTION_INPUT_PROPS,
  borderRightRadius: 0,
};
const MIDDLE_DISTRIBUTION_INPUT_PROPS = {
  ...DISTRIBUTION_INPUT_PROPS,
  borderRadius: 0,
  borderLeftWidth: 0,
};
const RIGHT_DISTRIBUTION_INPUT_PROPS = {
  ...DISTRIBUTION_INPUT_PROPS,
  borderLeftRadius: 0,
  borderLeftWidth: 0,
};

const computeCirclesCount = (cardsCount: number): number => {
  if (cardsCount <= 0) return 0;
  const x = Math.ceil(Math.sqrt(cardsCount));
  return Math.ceil((x % 2 == 0 ? x + 1 : x) / 2);
};

const computeTotalDeckDistribution = (
  deckDistribution: DeckDistribution
): number => {
  return (
    deckDistribution["1"] +
    deckDistribution["2A"] +
    deckDistribution["2B"] +
    deckDistribution["3"] +
    deckDistribution["4"]
  );
};

type DeckGenerationType = "Custom" | "Random";

type DeckDistribution = {
  "1": number;
  "2A": number;
  "2B": number;
  "3": number;
  "4": number;
};

function ConfigurationPage() {
  const [errors, setErrors] = createSignal<string[]>([]);

  const [isRunningSimulation, setIsRunningSimulation] = createSignal(false);
  const [simulationProgress, setSimulationProgress] = createSignal(0);

  const [playersCount, setPlayersCount] = createSignal(2);
  const [cardsCount, setCardsCount] = createSignal(25);
  const [useCustomMaxCircles, setUseCustomMaxCircles] = createSignal(false);
  const [circlesCount, setCirclesCount] = createSignal(
    computeCirclesCount(cardsCount())
  );
  const [deckGenerationType, setDeckGenerationType] =
    createSignal<DeckGenerationType>("Custom");
  const [generatedDecksCount, setGeneratedDecksCount] = createSignal(1);
  const [customDecksDistribution, setCustomDeckDistribution] =
    createSignal<DeckDistribution>({ 1: 20, "2A": 20, "2B": 20, 3: 20, 4: 20 });

  const handleChangePlayersCount = (e: { target: HTMLInputElement }): void => {
    setPlayersCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeCardsCount = (e: { target: HTMLInputElement }): void => {
    const newCardsCount = Number.parseInt(e.target.value) || 1;
    setCardsCount(newCardsCount);
    if (!useCustomMaxCircles())
      setCirclesCount(computeCirclesCount(newCardsCount));
  };

  const handleChangeCirclesCount = (e: { target: HTMLInputElement }): void => {
    setCirclesCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeUseCustomMaxCircles = (e: { target: Element }): void => {
    const target = e.target as unknown as HTMLInputElement;
    setUseCustomMaxCircles(target.checked);
    if (!target.checked) setCirclesCount(computeCirclesCount(cardsCount()));
  };

  const handleChangeGeneratedDecksCount = (e: {
    target: HTMLInputElement;
  }): void => {
    setGeneratedDecksCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeCustomDeckDistribution =
    (key: keyof DeckDistribution) =>
    (e: { target: HTMLInputElement }): void => {
      setCustomDeckDistribution({
        ...customDecksDistribution(),
        [key]: Number.parseInt(e.target.value) || 1,
      });
    };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (playersCount() <= 0) errors.push("Not enough players (min 1)");
    if (cardsCount() < playersCount())
      errors.push("Not enough cards in deck for all players");
    if (circlesCount() < computeCirclesCount(cardsCount()))
      errors.push("Not enought circles, not all cards can be played");
    if (
      deckGenerationType() == "Custom" &&
      computeTotalDeckDistribution(customDecksDistribution()) !== 100
    )
      errors.push("Deck distribution doesn't add up to 100%");
    if (deckGenerationType() == "Random" && generatedDecksCount() <= 0)
      errors.push("Not enough generated decks (min 1)");
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

        <Flex {...FORM_GROUP_PROPS}>
          <FormControl {...FORM_CONTROL_PROPS} disabled={isRunningSimulation()}>
            <FormLabel>Players</FormLabel>
            <Input
              min={1}
              max={10}
              onInput={handleChangePlayersCount}
              placeholder="Number of players"
              size="sm"
              type="number"
              value={playersCount()}
            />
          </FormControl>
        </Flex>

        <Flex {...FORM_GROUP_PROPS}>
          <FormControl {...FORM_CONTROL_PROPS} disabled={isRunningSimulation()}>
            <FormLabel>Deck size</FormLabel>
            <Input
              min={1}
              max={200}
              onInput={handleChangeCardsCount}
              placeholder="Deck size"
              size="sm"
              type="number"
              value={cardsCount()}
            />
          </FormControl>

          <FormControl
            {...FORM_CONTROL_PROPS}
            disabled={!useCustomMaxCircles() || isRunningSimulation()}
            readOnly={!useCustomMaxCircles()}
          >
            <FormLabel>Number of circles</FormLabel>
            <Input
              min={1}
              max={200}
              onInput={handleChangeCirclesCount}
              placeholder="Number of circles"
              size="sm"
              type="number"
              value={circlesCount()}
            />
          </FormControl>

          <Checkbox
            checked={useCustomMaxCircles()}
            disabled={isRunningSimulation()}
            onChange={handleChangeUseCustomMaxCircles}
            size="sm"
          >
            Custom number of circles
          </Checkbox>
        </Flex>

        <Flex {...FORM_GROUP_PROPS}>
          <FormControl {...FORM_CONTROL_PROPS} disabled={isRunningSimulation()}>
            <FormLabel>Deck generation</FormLabel>
            <Select
              value={deckGenerationType()}
              onChange={setDeckGenerationType}
              size="sm"
            >
              <SelectTrigger>
                <SelectPlaceholder>Deck generation</SelectPlaceholder>
                <SelectValue />
                <SelectIcon />
              </SelectTrigger>
              <SelectContent>
                <SelectListbox>
                  <For each={["Custom", "Random"]}>
                    {(item) => (
                      <SelectOption value={item}>
                        <SelectOptionText>{item}</SelectOptionText>
                        <SelectOptionIndicator />
                      </SelectOption>
                    )}
                  </For>
                </SelectListbox>
              </SelectContent>
            </Select>
          </FormControl>
        </Flex>

        <Show when={deckGenerationType() == "Custom"}>
          <Flex {...INNER_FORM_GROUP_PROPS}>
            <FormControl disabled={isRunningSimulation()} flex={1}>
              <FormLabel>╀ / ╂ / ╃ / ╇ / ╋ (%)</FormLabel>
              <Flex>
                <Input
                  {...LEFT_DISTRIBUTION_INPUT_PROPS}
                  value={customDecksDistribution()["1"]}
                  onChange={handleChangeCustomDeckDistribution("1")}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customDecksDistribution()["2A"]}
                  onChange={handleChangeCustomDeckDistribution("2A")}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customDecksDistribution()["2B"]}
                  onChange={handleChangeCustomDeckDistribution("2B")}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customDecksDistribution()["3"]}
                  onChange={handleChangeCustomDeckDistribution("3")}
                />
                <Input
                  {...RIGHT_DISTRIBUTION_INPUT_PROPS}
                  value={customDecksDistribution()["4"]}
                  onChange={handleChangeCustomDeckDistribution("4")}
                />
              </Flex>
            </FormControl>
          </Flex>
        </Show>

        <Show when={deckGenerationType() == "Random"}>
          <Flex {...INNER_FORM_GROUP_PROPS}>
            <FormControl
              {...FORM_CONTROL_PROPS}
              disabled={isRunningSimulation()}
            >
              <FormLabel>Number of generated decks</FormLabel>
              <Input
                min={1}
                max={200}
                onInput={handleChangeGeneratedDecksCount}
                placeholder="Number of generated decks"
                size="sm"
                type="number"
                value={generatedDecksCount()}
              />
            </FormControl>
          </Flex>
        </Show>

        <Button
          disabled={isRunningSimulation()}
          loading={isRunningSimulation()}
          loadingText={`${Math.ceil(simulationProgress() * 100)}%`}
          marginTop="$4"
          onClick={handleRunSimulation}
          size="sm"
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
