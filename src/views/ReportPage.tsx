import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@hope-ui/solid";
import { SimulationReport } from "../simulation/Simulation";
import { For, Show, createMemo, createSignal } from "solid-js";
import { TerrainType } from "../simulation/Terrain";

type ReportPageProps = {
  reports: SimulationReport[];
};

const p = (n: number): string => {
  return d(n * 100);
};

const d = (n: number): string => {
  return (Math.round(n * 100) / 100).toFixed(2);
};

const i = (n: number): string => {
  return (Math.round(n * 100) / 100).toFixed(0);
};

function ReportPage(props: ReportPageProps) {
  const [showPercentages, setShowPercentages] = createSignal(true);

  const handleChangeShowPercentages = (e: { target: Element }): void => {
    const target = e.target as unknown as HTMLInputElement;
    setShowPercentages(target.checked);
  };

  const sortedReports = () => {
    return [...props.reports].sort((r1, r2) => {
      if (r1.score > r2.score) return -1;
      if (r1.score < r2.score) return 1;
      return 0;
    });
  };

  return (
    <Flex direction="column" gap={10} height="100%" padding="$10">
      <Heading size="lg" marginBottom="$2">
        Simulation Report
      </Heading>

      <Flex width="100%" justifyContent="space-between">
        <Flex gap={20}>
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
            <Th numeric>Total cards</Th>
            <Th numeric>╀</Th>
            <Th numeric>╂</Th>
            <Th numeric>╄</Th>
            <Th numeric>╇</Th>
            <Th numeric>╋</Th>
            <Th numeric>Cards used</Th>
            <Th numeric>Cards not used</Th>
            <Th numeric>Total cells</Th>
            <Th numeric>Empty cells</Th>
            <Th numeric>Occupied cells</Th>
          </Tr>
        </Thead>
        <Tbody>
          <For each={sortedReports()}>
            {(report) => {
              return (
                <>
                  <Show when={showPercentages()}>
                    <Tr>
                      <Td numeric>{d(report.score)}</Td>
                      <Td numeric>
                        {p(report.terrainsCount / report.terrainsCount)}
                      </Td>
                      <Td numeric>
                        {p(
                          report.terrainDistribution[TerrainType.One] /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          report.terrainDistribution[TerrainType.TwoI] /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          report.terrainDistribution[TerrainType.TwoL] /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          report.terrainDistribution[TerrainType.Three] /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          report.terrainDistribution[TerrainType.Four] /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          (report.terrainsCount - report.averageTerrainsLeft) /
                            report.terrainsCount
                        )}
                      </Td>
                      <Td numeric>
                        {p(report.averageTerrainsLeft / report.terrainsCount)}
                      </Td>
                      <Td numeric>
                        {p(report.boardSize ** 2 / report.boardSize ** 2)}
                      </Td>
                      <Td numeric>
                        {p(
                          report.averageEmptyLotsOnBoard / report.boardSize ** 2
                        )}
                      </Td>
                      <Td numeric>
                        {p(
                          report.averageOccupiedLotsOnBoard /
                            report.boardSize ** 2
                        )}
                      </Td>
                    </Tr>
                  </Show>
                  <Show when={!showPercentages()}>
                    <Tr>
                      <Td numeric>{d(report.score)}</Td>
                      <Td numeric>{i(report.terrainsCount)}</Td>
                      <Td numeric>
                        {i(report.terrainDistribution[TerrainType.One])}
                      </Td>
                      <Td numeric>
                        {i(report.terrainDistribution[TerrainType.TwoI])}
                      </Td>
                      <Td numeric>
                        {i(report.terrainDistribution[TerrainType.TwoL])}
                      </Td>
                      <Td numeric>
                        {i(report.terrainDistribution[TerrainType.Three])}
                      </Td>
                      <Td numeric>
                        {i(report.terrainDistribution[TerrainType.Four])}
                      </Td>
                      <Td numeric>
                        {d(report.terrainsCount - report.averageTerrainsLeft)}
                      </Td>
                      <Td numeric>{d(report.averageTerrainsLeft)}</Td>
                      <Td numeric>{d(report.boardSize ** 2)}</Td>
                      <Td numeric>{d(report.averageEmptyLotsOnBoard)}</Td>
                      <Td numeric>{d(report.averageOccupiedLotsOnBoard)}</Td>
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
