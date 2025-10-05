import { describe, expect, it } from "vitest";

import { applyTreeFilters, buildTree } from "../../helpers/tree";
import {
  STATIC_TREE,
  buildAsset,
  buildLocation,
  flattenTreeNodes,
} from "../fixtures";
import type { Asset, AssetFilterState, Location, TreeNode } from "../../types";

describe("buildTree", () => {
  it("organizes locations, assets, and components into the expected hierarchy", () => {
    const locations: Location[] = [
      buildLocation({ id: "loc-root", name: "Factory" }),
      buildLocation({ id: "loc-line", name: "Line A", parentId: "loc-root" }),
    ];

    const assets: Asset[] = [
      buildAsset({
        id: "asset-mixer",
        name: "Mixer",
        locationId: "loc-line",
      }),
      buildAsset({
        id: "asset-motor",
        name: "Motor",
        parentId: "asset-mixer",
      }),
      buildAsset({
        id: "comp-torque",
        name: "Torque Sensor",
        parentId: "asset-motor",
        sensorType: "vibration",
        sensorId: "S-TQ-01",
        status: "alert",
      }),
      buildAsset({
        id: "comp-ambient",
        name: "Ambient Sensor",
        locationId: "loc-root",
        sensorType: "energy",
        sensorId: "S-EN-99",
      }),
    ];

    const tree = buildTree(locations, assets);

    expect(tree).toHaveLength(1);
    const [root] = tree;
    expect(root.id).toBe("loc-root");

    const [line, ambient] = root.children;
    expect(line.id).toBe("loc-line");
    expect(ambient.id).toBe("comp-ambient");

    const mixer = line.children[0];
    expect(mixer.id).toBe("asset-mixer");

    const motor = mixer.children[0];
    expect(motor.id).toBe("asset-motor");

    const torque = motor.children[0];
    expect(torque.id).toBe("comp-torque");
    expect(torque.type).toBe("component");
    expect(torque.children).toEqual([]);
  });

  it("keeps orphan assets as roots when no relationship is resolved", () => {
    const locations: Location[] = [
      buildLocation({ id: "loc-a", name: "Area A" }),
    ];

    const assets: Asset[] = [
      buildAsset({
        id: "asset-orphan",
        name: "Generator",
        parentId: "missing",
      }),
      buildAsset({
        id: "comp-solto",
        name: "Loose Sensor",
        sensorType: "energy",
        sensorId: "EN-01",
        parentId: "missing",
        locationId: null,
      }),
    ];

    const tree = buildTree(locations, assets);

    expect(tree.map((node) => node.id)).toContain("loc-a");
    expect(tree.map((node) => node.id)).toContain("asset-orphan");

    const orphan = tree.find((node) => node.id === "asset-orphan");
    expect(orphan?.children).toHaveLength(0);

    const looseSensor = tree.find((node) => node.id === "comp-solto");
    expect(looseSensor?.type).toBe("component");
  });

  it("returns an empty list when no locations or assets are provided", () => {
    expect(buildTree([], [])).toEqual([]);
  });
});

const createFilters = (
  overrides: Partial<AssetFilterState> = {},
): AssetFilterState => ({
  searchTerm: "",
  sensorTypes: [],
  criticalOnly: false,
  ...overrides,
});

describe("applyTreeFilters", () => {
  it("returns the original reference when no filters are active", () => {
    const result = applyTreeFilters(STATIC_TREE, createFilters());
    expect(result).toBe(STATIC_TREE);
  });

  it("preserves ancestor path when a deep node matches the search", () => {
    const result = applyTreeFilters(
      STATIC_TREE,
      createFilters({ searchTerm: "Motor RT Coal AF01" }),
    );

    expect(result).toHaveLength(1);
    const [root] = result;
    expect(root.name).toContain("Production Area");

    const firstLayer = root.children[0];
    expect(firstLayer.name).toContain("Charcoal Storage");

    const conveyor = firstLayer.children[0];
    expect(conveyor.name).toContain("Conveyor Belt");

    const motor = conveyor.children[0];
    expect(motor.name).toContain("Motor TC01");
    expect(motor.children).toHaveLength(1);
    expect(motor.children[0].name).toBe("Motor RT Coal AF01");

    const originalMotor = STATIC_TREE[0].children[0].children[0];
    expect(originalMotor.children).toHaveLength(2);
  });

  it("filters only energy sensors when the energy filter is enabled", () => {
    const result = applyTreeFilters(
      STATIC_TREE,
      createFilters({ sensorTypes: ["energy"] }),
    );

    const components = flattenTreeNodes(result).filter(
      (node): node is Extract<TreeNode, { type: "component" }> =>
        node.type === "component",
    );

    expect(components.length).toBeGreaterThan(0);
    expect(
      components.every((component) => component.data.sensorType === "energy"),
    ).toBe(true);
  });

  it("returns only critical sensors when the critical-only filter is enabled", () => {
    const result = applyTreeFilters(
      STATIC_TREE,
      createFilters({ criticalOnly: true }),
    );

    const components = flattenTreeNodes(result).filter(
      (node): node is Extract<TreeNode, { type: "component" }> =>
        node.type === "component",
    );

    expect(components.length).toBeGreaterThan(0);
    expect(
      components.every((component) => component.data.status === "alert"),
    ).toBe(true);
  });

  it("applies the energy and critical filters together", () => {
    const result = applyTreeFilters(
      STATIC_TREE,
      createFilters({ sensorTypes: ["energy"], criticalOnly: true }),
    );

    const components = flattenTreeNodes(result).filter(
      (node): node is Extract<TreeNode, { type: "component" }> =>
        node.type === "component",
    );

    expect(components).toHaveLength(1);
    expect(components[0].name).toBe("Packaging Energy Monitor");
  });
});
