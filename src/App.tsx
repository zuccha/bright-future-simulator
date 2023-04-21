import { Show, createSignal } from "solid-js";
import ConfigurationPage from "./views/ConfigurationPage";
import ReportPage from "./views/ReportPage";
import { SimulationReport } from "./simulation/Simulation";

enum Page {
  Configuration,
  Report,
}

function App() {
  const [page, setPage] = createSignal<Page>(Page.Configuration);
  const [reports, setReports] = createSignal<SimulationReport[]>([]);

  const handleSimulationFinished = (newReports: SimulationReport[]): void => {
    setReports(newReports);
    setPage(Page.Report);
  };

  const handleConfigure = (): void => {
    setPage(Page.Configuration);
  };

  return (
    <>
      <Show when={page() === Page.Configuration}>
        <ConfigurationPage onFinishSimulation={handleSimulationFinished} />
      </Show>
      <Show when={page() === Page.Report}>
        <ReportPage onConfigure={handleConfigure} reports={reports()} />
      </Show>
    </>
  );
}

export default App;
