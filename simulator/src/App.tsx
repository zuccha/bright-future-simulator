import { Button, Center, Flex, VStack } from "@hope-ui/solid";
import { Match, Switch, createSignal } from "solid-js";
import CardsScreen from "./features/cards/CardsScreen";
import SimulationScreen from "./features/simulation/SimulationScreen";

enum Route {
  Cards,
  Simulation,
}

type RouteScreenProps = {
  Screen: any;
  onGoBack: () => void;
};

function RouteScreen({ Screen, onGoBack }: RouteScreenProps) {
  return (
    <Flex direction="column">
      <Flex position="absolute">
        <Button onClick={onGoBack} size="sm" variant="ghost">
          {"← Back"}
        </Button>
      </Flex>
      <Screen />
    </Flex>
  );
}

function App() {
  const [route, setRoute] = createSignal<Route | undefined>(undefined);

  const goBack = () => setRoute(undefined);
  const navigateToCards = () => setRoute(Route.Cards);
  const navigateToSimulation = () => setRoute(Route.Simulation);
  return (
    <Switch
      fallback={
        <Center flex={1} height="100vh">
          <VStack maxW={300} w="100%" gap={10}>
            <Button fullWidth onClick={navigateToCards}>
              Generate Images
            </Button>
            <Button fullWidth onClick={navigateToSimulation}>
              Run Simulation
            </Button>
          </VStack>
        </Center>
      }
    >
      <Match when={route() === Route.Cards}>
        <RouteScreen Screen={CardsScreen} onGoBack={goBack} />
      </Match>
      <Match when={route() === Route.Simulation}>
        <RouteScreen Screen={SimulationScreen} onGoBack={goBack} />
      </Match>
    </Switch>
  );
}

export default App;
