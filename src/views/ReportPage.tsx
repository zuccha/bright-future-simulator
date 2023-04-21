import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@hope-ui/solid";
import { SimulationReport } from "../simulation/Simulation";
import { For, Show, createSignal } from "solid-js";
import { TerrainType } from "../simulation/Terrain";

type ReportPageProps = {
  onConfigure: () => void;
  reports: SimulationReport[];
};

const f = (n: number): number => {
  return Math.round(n * 100) / 100;
};

function ReportPage(props: ReportPageProps) {
  const [showPercentages, setShowPercentages] = createSignal(false);

  const handleChangeShowPercentages = (e: { target: Element }): void => {
    const target = e.target as unknown as HTMLInputElement;
    setShowPercentages(target.checked);
  };

  return (
    <Flex
      alignItems="center"
      direction="column"
      gap={30}
      height="100%"
      padding="$10"
    >
      <Flex width="100%" justifyContent="space-between">
        <Flex gap={20}>
          <Button size="sm" onClick={props.onConfigure}>
            Configure
          </Button>

          <Divider orientation="vertical" />

          <Checkbox
            checked={showPercentages()}
            onChange={handleChangeShowPercentages}
          >
            Show percentages
          </Checkbox>
        </Flex>
        <Button size="sm" disabled>
          Export CSV
        </Button>
      </Flex>

      <Table striped="odd" dense>
        <TableCaption>Simulations</TableCaption>
        <Thead>
          <Tr>
            <Th numeric>Score</Th>
            <Th numeric>╀ (%)</Th>
            <Th numeric>╂ (%)</Th>
            <Th numeric>╄ (%)</Th>
            <Th numeric>╇ (%)</Th>
            <Th numeric>╋ (%)</Th>
            <Th numeric>Cards used</Th>
            <Th numeric>Cards not used</Th>
            <Th numeric>Empty lots</Th>
            <Th numeric>Occupied lots</Th>
          </Tr>
        </Thead>
        <Tbody>
          <For each={props.reports}>
            {(report) => {
              const score =
                (report.terrainsCount - report.averageTerrainsLeft) /
                report.terrainsCount;

              return (
                <>
                  <Show when={showPercentages()}>
                    <Tr>
                      <Td numeric>{f(score)}</Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.One]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.TwoI]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.TwoL]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.Three]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.Four]}
                      </Td>
                      <Td numeric>
                        {f(
                          (report.terrainsCount - report.averageTerrainsLeft) /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {f(report.averageTerrainsLeft / report.terrainsCount)}
                      </Td>
                      <Td numeric>
                        {f(report.averageEmptyLotsOnBoard / report.boardSize)}
                      </Td>
                      <Td numeric>
                        {f(
                          report.averageOccupiedLotsOnBoard / report.boardSize
                        )}
                      </Td>
                    </Tr>
                  </Show>
                  <Show when={!showPercentages()}>
                    <Tr>
                      <Td numeric>{f(score)}</Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.One]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.TwoI]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.TwoL]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.Three]}
                      </Td>
                      <Td numeric>
                        {report.terrainDistribution[TerrainType.Four]}
                      </Td>
                      <Td numeric>
                        {f(report.terrainsCount - report.averageTerrainsLeft)}
                      </Td>
                      <Td numeric>{f(report.averageTerrainsLeft)}</Td>
                      <Td numeric>{f(report.averageEmptyLotsOnBoard)}</Td>
                      <Td numeric>{f(report.averageOccupiedLotsOnBoard)}</Td>
                    </Tr>
                  </Show>
                </>
              );
            }}
          </For>
        </Tbody>
      </Table>
    </Flex>
  );
}

export default ReportPage;
