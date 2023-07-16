import { createSignal } from "solid-js";
import { Flex } from "@hope-ui/solid";
import ConfigurationForm from "./ConfigurationForm";
import ReportTable from "./ReportTable";
import { SimulationReport } from "./models/Simulation";

function SimulationScreen() {
  const [reports, setReports] = createSignal<SimulationReport[]>([]);

  const handleSimulationFinished = (newReports: SimulationReport[]): void => {
    setReports(newReports);
  };

  return (
    <Flex>
      <ConfigurationForm onFinishSimulation={handleSimulationFinished} />
      <ReportTable reports={reports()} />
    </Flex>
  );
}

export default SimulationScreen;
