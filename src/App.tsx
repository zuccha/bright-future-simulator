import { Show, createSignal } from "solid-js";
import ConfigurationPage from "./views/ConfigurationPage";
import ReportPage from "./views/ReportPage";
import { SimulationReport } from "./simulation/Simulation";
import { Divider, Flex } from "@hope-ui/solid";

enum Page {
  Configuration,
  Report,
}

function App() {
  const [page, setPage] = createSignal<Page>(Page.Configuration);
  const [reports, setReports] = createSignal<SimulationReport[]>([]);

  const handleSimulationFinished = (newReports: SimulationReport[]): void => {
    setReports(newReports);
  };

  return (
    <Flex>
      <ConfigurationPage onFinishSimulation={handleSimulationFinished} />
      <ReportPage reports={reports()} />
    </Flex>
  );
}

export default App;
