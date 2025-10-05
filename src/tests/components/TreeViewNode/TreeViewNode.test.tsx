import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TreeViewNode } from "../../../components/TreeViewNode";
import {
  makeAssetNode,
  makeComponentNode,
  makeLocationNode,
} from "../../fixtures";

describe("TreeViewNode", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders location nodes with the appropriate icon and child count tags", () => {
    const locationNode = makeLocationNode(
      { id: "loc-root", name: "Central Plant" },
      {
        children: [
          makeLocationNode({ id: "loc-sub", name: "Packaging" }),
          makeAssetNode({ id: "asset-line", name: "Packaging Line" }),
        ],
      },
    );

    render(
      <TreeViewNode
        node={locationNode}
        depth={0}
        expandedIds={new Set()}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByAltText(`Localização ${locationNode.name}`),
    ).toBeTruthy();
    expect(screen.getByText("1 sublocalizações")).toBeTruthy();
    expect(screen.getByText("1 ativos")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `Expandir ${locationNode.name}` }),
    ).toBeTruthy();
  });

  it("highlights alert component nodes and surfaces sensor metadata", () => {
    const componentNode = makeComponentNode({
      name: "Compressor Sensor",
      status: "alert",
      sensorType: "energy",
      sensorId: "ENG-22",
      gatewayId: "GTW-88",
    });

    const { container } = render(
      <TreeViewNode
        node={componentNode}
        depth={1}
        expandedIds={new Set()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Sensor de energia")).toBeTruthy();
    expect(screen.getByText("Alerta")).toBeTruthy();
    expect(screen.getByText("Sensor")).toBeTruthy();
    expect(screen.getByText(componentNode.data.sensorId)).toBeTruthy();
    expect(container.querySelector(".border-critical-500\\/60")).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: /Expandir|Recolher/ }),
    ).toBeNull();
  });

  it("expands nested children and toggles state for expandable assets", async () => {
    const childNode = makeComponentNode({
      id: "comp-sensor",
      name: "Torque Sensor",
      status: "operating",
      sensorType: "vibration",
    });
    const assetNode = makeAssetNode(
      { id: "asset-conveyor", name: "Conveyor Belt" },
      { children: [childNode] },
    );

    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <TreeViewNode
        node={assetNode}
        depth={0}
        expandedIds={new Set([assetNode.id])}
        onToggle={onToggle}
      />,
    );

    expect(
      screen.getByRole("button", { name: `Recolher ${assetNode.name}` }),
    ).toBeTruthy();
    expect(screen.getByLabelText(`Subitens de ${assetNode.name}`)).toBeTruthy();
    expect(screen.getByText(childNode.name)).toBeTruthy();
    expect(screen.getByText("1 sensores")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: `Recolher ${assetNode.name}` }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(assetNode.id);
  });
});
