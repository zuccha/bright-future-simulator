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
import Simulation, { SimulationReport } from "./models/Simulation";
import TerrainGenerator, {
  TerrainDistribution,
} from "./models/TerrainGenerator";
import { TerrainType } from "./models/Terrain";

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
  size: "sm",
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

const computeBoardSize = (cardsCount: number): number => {
  if (cardsCount + 1 <= 0) return 0;
  const x = Math.ceil(Math.sqrt(cardsCount + 1));
  return x % 2 == 0 ? x + 1 : x;
};

type TerrainGenerationType = "Custom" | "Random";

type ConfigurationFormProps = {
  onFinishSimulation: (reports: SimulationReport[]) => void;
};

function ConfigurationForm(props: ConfigurationFormProps) {
  const [errors, setErrors] = createSignal<string[]>([]);

  const [isRunningSimulation, setIsRunningSimulation] = createSignal(false);

  const [playersCount, setPlayersCount] = createSignal(2);
  const [cardsCount, setCardsCount] = createSignal(24);
  const [useCustomBoardSize, setUseCustomBoardSize] = createSignal(false);
  const [boardSize, setBoardSize] = createSignal(
    computeBoardSize(cardsCount())
  );
  const [terrainGenerationType, setTerrainGenerationType] =
    createSignal<TerrainGenerationType>("Random");
  const [generatedTerrainCount, setGeneratedTerrainCount] = createSignal(100);
  const [customTerrainDistribution, setCustomTerrainDistribution] =
    createSignal<TerrainDistribution>(TerrainGenerator.createDistribution());
  const [iterationsCount, setIterationsCount] = createSignal(1000);

  const handleChangePlayersCount = (e: { target: HTMLInputElement }): void => {
    setPlayersCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeCardsCount = (e: { target: HTMLInputElement }): void => {
    const newCardsCount = Number.parseInt(e.target.value) || 1;
    setCardsCount(newCardsCount);
    if (!useCustomBoardSize()) setBoardSize(computeBoardSize(newCardsCount));
  };

  const handleChangeBoardSize = (e: { target: HTMLInputElement }): void => {
    setBoardSize(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeUseCustomMaxCircles = (e: { target: Element }): void => {
    const target = e.target as unknown as HTMLInputElement;
    setUseCustomBoardSize(target.checked);
    if (!target.checked) setBoardSize(computeBoardSize(cardsCount()));
  };

  const handleChangeGeneratedDecksCount = (e: {
    target: HTMLInputElement;
  }): void => {
    setGeneratedTerrainCount(Number.parseInt(e.target.value) || 1);
  };

  const handleChangeCustomTerrainDistribution =
    (key: TerrainType) =>
    (e: { target: HTMLInputElement }): void => {
      setCustomTerrainDistribution({
        ...customTerrainDistribution(),
        [key]: Number.isNaN(Number(e.target.value))
          ? 0
          : Number(e.target.value),
      });
    };

  const handleChangeIterationsCount = (e: {
    target: HTMLInputElement;
  }): void => {
    setIterationsCount(Number.parseInt(e.target.value) || 1);
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (playersCount() <= 0) errors.push("Not enough players (min 1)");
    if (cardsCount() < playersCount())
      errors.push("Not enough cards in deck for all players");
    if (boardSize() < computeBoardSize(cardsCount()))
      errors.push("Not enought circles, not all cards can be played");
    if (
      terrainGenerationType() == "Custom" &&
      !TerrainGenerator.isDistributionValid(customTerrainDistribution())
    )
      errors.push("Deck distribution doesn't add up to 100%");
    if (terrainGenerationType() == "Random" && generatedTerrainCount() <= 0)
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
    await new Promise((resolve) => setTimeout(resolve, 10));

    const reports: SimulationReport[] = [];

    switch (terrainGenerationType()) {
      case "Custom": {
        const simulation = new Simulation(
          cardsCount(),
          customTerrainDistribution(),
          boardSize(),
          playersCount(),
          iterationsCount()
        );
        reports.push(simulation.run());
        break;
      }
      case "Random": {
        for (let i = 0; i < generatedTerrainCount(); ++i) {
          const simulation = new Simulation(
            cardsCount(),
            TerrainGenerator.createRandomDistribution(),
            boardSize(),
            playersCount(),
            iterationsCount()
          );
          reports.push(simulation.run());
        }
        break;
      }
    }

    setIsRunningSimulation(false);

    props.onFinishSimulation(reports);
  };

  return (
    <Flex height="100%" padding="$10">
      <Flex maxWidth={300} width="100%" gap={GAP} direction="column">
        <Heading size="lg" marginBottom="$2">
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
            disabled={!useCustomBoardSize() || isRunningSimulation()}
            readOnly={!useCustomBoardSize()}
          >
            <FormLabel>
              Board size ({boardSize()}x{boardSize()})
            </FormLabel>
            <Input
              min={1}
              max={200}
              onInput={handleChangeBoardSize}
              placeholder="Board size"
              size="sm"
              type="number"
              value={boardSize()}
            />
          </FormControl>

          <Checkbox
            checked={useCustomBoardSize()}
            disabled={isRunningSimulation()}
            onChange={handleChangeUseCustomMaxCircles}
            size="sm"
          >
            Custom board size
          </Checkbox>
        </Flex>

        <Flex {...FORM_GROUP_PROPS}>
          <FormControl {...FORM_CONTROL_PROPS} disabled={isRunningSimulation()}>
            <FormLabel>Deck generation</FormLabel>
            <Select
              value={terrainGenerationType()}
              onChange={setTerrainGenerationType}
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

        <Show when={terrainGenerationType() == "Custom"}>
          <Flex {...INNER_FORM_GROUP_PROPS}>
            <FormControl disabled={isRunningSimulation()} flex={1}>
              <FormLabel>╀ / ╂ / ╄ / ╇ / ╋ (%)</FormLabel>
              <Flex>
                <Input
                  {...LEFT_DISTRIBUTION_INPUT_PROPS}
                  value={customTerrainDistribution()[TerrainType.One]}
                  onChange={handleChangeCustomTerrainDistribution(
                    TerrainType.One
                  )}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customTerrainDistribution()[TerrainType.TwoI]}
                  onChange={handleChangeCustomTerrainDistribution(
                    TerrainType.TwoI
                  )}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customTerrainDistribution()[TerrainType.TwoL]}
                  onChange={handleChangeCustomTerrainDistribution(
                    TerrainType.TwoL
                  )}
                />
                <Input
                  {...MIDDLE_DISTRIBUTION_INPUT_PROPS}
                  value={customTerrainDistribution()[TerrainType.Three]}
                  onChange={handleChangeCustomTerrainDistribution(
                    TerrainType.Three
                  )}
                />
                <Input
                  {...RIGHT_DISTRIBUTION_INPUT_PROPS}
                  value={customTerrainDistribution()[TerrainType.Four]}
                  onChange={handleChangeCustomTerrainDistribution(
                    TerrainType.Four
                  )}
                />
              </Flex>
            </FormControl>
          </Flex>
        </Show>

        <Show when={terrainGenerationType() == "Random"}>
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
                value={generatedTerrainCount()}
              />
            </FormControl>
          </Flex>
        </Show>

        <Flex {...FORM_GROUP_PROPS}>
          <FormControl {...FORM_CONTROL_PROPS} disabled={isRunningSimulation()}>
            <FormLabel>Number of iterations</FormLabel>
            <Input
              min={1}
              max={10000}
              onInput={handleChangeIterationsCount}
              placeholder="Number of iterations"
              size="sm"
              type="number"
              value={iterationsCount()}
            />
          </FormControl>
        </Flex>

        <Button
          disabled={isRunningSimulation()}
          loading={isRunningSimulation()}
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

export default ConfigurationForm;
