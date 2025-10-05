import { afterEach, describe, expect, it, vi } from "vitest";

import {
  selectActiveTree,
  selectActiveTreeNodes,
  selectFilteredTreeNodes,
  selectCompany,
  setCriticalOnly,
  setSearchTerm,
  toggleSensorType,
  treeReducer,
} from "../../../store/slices/treeSlice";
import { treeApi } from "../../../store/services/tree";
import type { RootState } from "../../../store";
import type { TreeNode } from "../../../types";
import { buildAsset, buildLocation, flattenTreeNodes } from "../../fixtures";
import { mockTreeApiSelectors } from "../../mocks/treeApi";

const createInitialState = () =>
  treeReducer(undefined, { type: "@@INIT" } as { type: string });

const createState = (
  overrides: Partial<ReturnType<typeof treeReducer>> = {},
): RootState =>
  ({
    tree: { ...createInitialState(), ...overrides },
    [treeApi.reducerPath]: {},
  }) as RootState;

describe("treeSlice reducers", () => {
  it("stores the selected company and resets every filter", () => {
    const initial = createInitialState();

    const result = treeReducer(initial, selectCompany("company-789"));

    expect(result.selectedCompanyId).toBe("company-789");
    expect(result.filters).toEqual({
      searchTerm: "",
      sensorTypes: [],
      criticalOnly: false,
    });
  });

  it("updates only the search term field", () => {
    const initial = createInitialState();

    const result = treeReducer(initial, setSearchTerm("motor"));

    expect(result.filters.searchTerm).toBe("motor");
    expect(result.filters.sensorTypes).toEqual([]);
    expect(result.filters.criticalOnly).toBe(false);
  });

  it("adds and removes the same sensor type", () => {
    const initial = createInitialState();
    const withSensor = treeReducer(initial, toggleSensorType("energy"));

    expect(withSensor.filters.sensorTypes).toEqual(["energy"]);

    const withoutSensor = treeReducer(withSensor, toggleSensorType("energy"));

    expect(withoutSensor.filters.sensorTypes).toEqual([]);
  });

  it("switches the critical flag based on the payload", () => {
    const initial = createInitialState();

    const enabled = treeReducer(initial, setCriticalOnly(true));
    expect(enabled.filters.criticalOnly).toBe(true);

    const disabled = treeReducer(enabled, setCriticalOnly(false));
    expect(disabled.filters.criticalOnly).toBe(false);
  });
});

describe("treeSlice selectors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the idle status when no company is chosen yet", () => {
    const state = createState();

    const result = selectActiveTree(state);

    expect(result).toEqual({ status: "idle", data: [], error: null });
  });

  it("reports loading while either query is still fetching", () => {
    const state = createState({ selectedCompanyId: "company-001" });

    mockTreeApiSelectors({
      locations: { isLoading: true },
      assets: { data: [] },
    });

    const result = selectActiveTree(state);

    expect(result.status).toBe("loading");
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });

  it("bubbles up the first API error message it finds", () => {
    const state = createState({ selectedCompanyId: "company-002" });

    mockTreeApiSelectors({
      locations: {
        isError: true,
        error: { status: 500, data: { message: "Locations crashed" } },
      },
      assets: { data: [] },
    });

    const result = selectActiveTree(state);

    expect(result.status).toBe("failed");
    expect(result.error).toBe("Locations crashed");
    expect(result.data).toEqual([]);
  });

  it("builds the tree nodes when both queries succeed", () => {
    const state = createState({ selectedCompanyId: "company-003" });
    const locations = [
      buildLocation({ id: "loc-main", name: "Main Plant" }),
      buildLocation({ id: "loc-line", name: "Line", parentId: "loc-main" }),
    ];
    const assets = [
      buildAsset({
        id: "asset-press",
        name: "Press",
        locationId: "loc-line",
      }),
      buildAsset({
        id: "asset-sensor",
        name: "Press Sensor",
        parentId: "asset-press",
        sensorType: "energy",
        sensorId: "S-ENERGY",
        status: "alert",
      }),
    ];

    mockTreeApiSelectors({
      locations: { data: locations },
      assets: { data: assets },
    });

    const result = selectActiveTree(state);

    expect(result.status).toBe("succeeded");
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("loc-main");

    const nodes = selectActiveTreeNodes(state);
    expect(nodes).toHaveLength(1);
    const flattened = flattenTreeNodes(nodes);
    const component = flattened.find((node) => node.type === "component");
    expect(component?.name).toBe("Press Sensor");
  });

  it("applies the current filters to the active tree", () => {
    const defaultFilters = createInitialState().filters;
    const locations = [buildLocation({ id: "loc-factory", name: "Factory" })];
    const assets = [
      buildAsset({
        id: "asset-pump",
        name: "Hydraulic Pump",
        locationId: "loc-factory",
      }),
      buildAsset({
        id: "asset-sensor-critical",
        name: "Pump Sensor Critical",
        parentId: "asset-pump",
        sensorType: "energy",
        sensorId: "S-CRIT",
        status: "alert",
      }),
      buildAsset({
        id: "asset-sensor-ok",
        name: "Pump Sensor Normal",
        parentId: "asset-pump",
        sensorType: "energy",
        sensorId: "S-OK",
        status: "operating",
      }),
    ];

    mockTreeApiSelectors({
      locations: { data: locations },
      assets: { data: assets },
    });

    const stateWithFilters = createState({
      selectedCompanyId: "company-004",
      filters: {
        ...defaultFilters,
        searchTerm: "Critical",
        sensorTypes: ["energy"],
        criticalOnly: true,
      },
    });

    const filtered = selectFilteredTreeNodes(stateWithFilters);
    const flatFiltered = flattenTreeNodes(filtered);

    const components = flatFiltered.filter(
      (node): node is Extract<TreeNode, { type: "component" }> =>
        node.type === "component",
    );

    expect(components).toHaveLength(1);
    expect(components[0].name).toBe("Pump Sensor Critical");
    expect(components[0].data.status).toBe("alert");
  });
});
