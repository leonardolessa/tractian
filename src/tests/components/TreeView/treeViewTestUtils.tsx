import { screen } from "@testing-library/react";

import { TreeView } from "../../../components/TreeView";
import { StatusBanner } from "../../../components/_ui/StatusBanner";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectActiveTree,
  selectFilteredTreeNodes,
  selectFilterState,
  selectCompany,
  setSearchTerm,
  setCriticalOnly,
  toggleSensorType,
} from "../../../store/slices/treeSlice";
import { buildAsset, buildLocation } from "../../fixtures";
import {
  createTestStore,
  renderWithProviders,
} from "../../utils/renderWithProviders";

export const LOCATIONS_FIXTURE = [
  buildLocation({ id: "loc-root", name: "Central Plant" }),
  buildLocation({
    id: "loc-packaging",
    name: "Packaging Floor",
    parentId: "loc-root",
  }),
];

export const ASSETS_FIXTURE = [
  buildAsset({
    id: "asset-conveyor",
    name: "Conveyor Belt",
    locationId: "loc-packaging",
  }),
  buildAsset({
    id: "asset-motor",
    name: "Conveyor Motor",
    parentId: "asset-conveyor",
  }),
  buildAsset({
    id: "comp-vibration",
    name: "Vibration Sensor",
    parentId: "asset-motor",
    sensorType: "vibration",
    status: "operating",
    sensorId: "VIB-01",
  }),
  buildAsset({
    id: "comp-torque",
    name: "Torque Sensor",
    parentId: "asset-conveyor",
    sensorType: "energy",
    status: "alert",
    sensorId: "TRQ-99",
    gatewayId: "GTW-12",
  }),
  buildAsset({
    id: "comp-energy-monitor",
    name: "Energy Monitor",
    parentId: "asset-motor",
    sensorType: "energy",
    status: "operating",
    sensorId: "ENG-07",
  }),
];

type TreeUserEvents = {
  click: (element: Element) => Promise<void>;
};

export const expandTreePath = async (
  user: TreeUserEvents,
  labels: string[],
) => {
  for (const label of labels) {
    const toggle = await screen.findByLabelText(`Expandir ${label}`);
    await user.click(toggle);
  }
};

export const renderTreeView = (companyId: string) => {
  const store = createTestStore();
  store.dispatch(selectCompany(companyId));

  const TreeViewHarness = () => {
    const tree = useAppSelector(selectActiveTree);
    const nodes = useAppSelector(selectFilteredTreeNodes);

    return (
      <>
        {tree.status === "failed" && tree.error ? (
          <StatusBanner tone="critical">{tree.error}</StatusBanner>
        ) : null}
        <TreeView nodes={nodes} isLoading={tree.status === "loading"} />
      </>
    );
  };

  return renderWithProviders(<TreeViewHarness />, { store });
};

export const renderFilterableTreeView = (companyId: string) => {
  const store = createTestStore();
  store.dispatch(selectCompany(companyId));

  const FilterableTreeHarness = () => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilterState);
    const tree = useAppSelector(selectActiveTree);
    const nodes = useAppSelector(selectFilteredTreeNodes);

    return (
      <div>
        <label htmlFor="search-input">Busca rápida</label>
        <input
          id="search-input"
          value={filters.searchTerm}
          placeholder="Buscar ativos, sensores ou setores"
          onChange={(event) => dispatch(setSearchTerm(event.target.value))}
        />
        <div role="group" aria-label="Filtros rápidos">
          <button
            type="button"
            aria-pressed={filters.sensorTypes.includes("energy")}
            onClick={() => dispatch(toggleSensorType("energy"))}
          >
            Sensores de energia
          </button>
          <button
            type="button"
            aria-pressed={filters.criticalOnly}
            onClick={() => dispatch(setCriticalOnly(!filters.criticalOnly))}
          >
            Status crítico
          </button>
        </div>
        <TreeView nodes={nodes} isLoading={tree.status === "loading"} />
      </div>
    );
  };

  return renderWithProviders(<FilterableTreeHarness />, { store });
};
