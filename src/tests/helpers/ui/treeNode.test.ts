import { describe, expect, it } from "vitest";

import { describeTreeNode } from "../../../helpers/ui/treeNode";
import {
  makeAssetNode,
  makeComponentNode,
  makeLocationNode,
} from "../../fixtures";

describe("describeTreeNode", () => {
  it("summarizes the number of child nodes for a location", () => {
    const location = makeLocationNode(
      { id: "loc-main", name: "Main Plant" },
      {
        children: [
          makeLocationNode({ id: "loc-storage", name: "Storage" }),
          makeLocationNode({ id: "loc-office", name: "Office" }),
          makeAssetNode({ id: "asset-line", name: "Assembly Line" }),
        ],
      },
    );

    const presentation = describeTreeNode(location);

    expect(presentation.subtitle).toBe("Localização");
    expect(presentation.tags).toContainEqual({
      key: "tags-locations",
      tone: "neutral",
      label: "2 sublocalizações",
    });
    expect(presentation.tags).toContainEqual({
      key: "tags-assets",
      tone: "info",
      label: "1 ativos",
    });
    expect(presentation.tags.some((tag) => tag.key === "tags-components")).toBe(
      false,
    );
  });

  it("returns no tags for a location without children", () => {
    const location = makeLocationNode({ id: "loc-empty", name: "Empty Site" });

    const presentation = describeTreeNode(location);

    expect(presentation.subtitle).toBe("Localização");
    expect(presentation.tags).toHaveLength(0);
    expect(presentation.metadata).toHaveLength(0);
  });

  it("includes metadata and the unlinked warning for assets without relations", () => {
    const asset = makeAssetNode(
      { id: "asset-compressor", name: "Compressor 01" },
      {
        children: [
          makeAssetNode({ id: "asset-control", name: "Control Panel" }),
          makeComponentNode({
            id: "comp-pressure",
            name: "Pressure Sensor",
            sensorType: "vibration",
            status: "operating",
            parentId: "asset-compressor",
          }),
        ],
      },
    );

    const presentation = describeTreeNode(asset);

    expect(presentation.subtitle).toBe("Ativo");
    expect(presentation.tags).toEqual(
      expect.arrayContaining([
        {
          key: "tags-subassets",
          tone: "neutral",
          label: "1 subativos",
        },
        {
          key: "tags-components",
          tone: "info",
          label: "1 sensores",
        },
        {
          key: "tags-unlinked",
          tone: "warning",
          label: "sem vínculo",
        },
      ]),
    );
    expect(presentation.metadata).toEqual(
      expect.arrayContaining([
        {
          key: "metadata-id",
          label: "ID",
          value: "asset-compressor",
        },
      ]),
    );
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-location"),
    ).toBe(false);
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-parent"),
    ).toBe(false);
  });

  it("populates linked asset metadata and omits the unlinked tag", () => {
    const asset = makeAssetNode(
      {
        id: "asset-linked",
        name: "Linked Pump",
        locationId: "loc-floor-2",
        parentId: "asset-header",
      },
      {
        children: [],
      },
    );

    const presentation = describeTreeNode(asset);

    expect(presentation.tags.some((tag) => tag.key === "tags-unlinked")).toBe(
      false,
    );
    expect(presentation.tags).toHaveLength(0);
    expect(presentation.metadata).toEqual(
      expect.arrayContaining([
        {
          key: "metadata-location",
          label: "Localização",
          value: "loc-floor-2",
        },
        {
          key: "metadata-parent",
          label: "Ativo pai",
          value: "asset-header",
        },
      ]),
    );
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-id"),
    ).toBe(true);
  });

  it("describes component sensors and highlights alert status", () => {
    const component = makeComponentNode({
      id: "comp-vibration",
      name: "Vibration Sensor",
      sensorId: "VS-201",
      sensorType: "vibration",
      status: "alert",
      gatewayId: "GW-9",
      parentId: "asset-press",
      locationId: "loc-floor-1",
    });

    const presentation = describeTreeNode(component);

    expect(presentation.subtitle).toBe("Componente");
    expect(presentation.tags).toEqual([
      {
        key: "tags-sensor-type",
        tone: "warning",
        label: "Sensor de vibração",
      },
    ]);
    expect(presentation.metadata).toHaveLength(4);
    expect(presentation.metadata).toEqual(
      expect.arrayContaining([
        {
          key: "metadata-sensor",
          label: "Sensor",
          value: "VS-201",
        },
        {
          key: "metadata-gateway",
          label: "Gateway",
          value: "GW-9",
        },
        {
          key: "metadata-parent",
          label: "Ativo pai",
          value: "asset-press",
        },
        {
          key: "metadata-location",
          label: "Localização",
          value: "loc-floor-1",
        },
      ]),
    );
    expect(presentation.statusTag).toEqual({
      key: "status",
      tone: "critical",
      label: "Alerta",
    });
    expect(presentation.highlightClass).toBe(
      "border-critical-500/60 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]",
    );
  });

  it("omits alert styling when the component is operating", () => {
    const component = makeComponentNode({
      id: "comp-energy",
      name: "Energy Sensor",
      sensorId: "EN-200",
      sensorType: "energy",
      status: "operating",
    });

    const presentation = describeTreeNode(component);

    expect(presentation.tags).toEqual([
      {
        key: "tags-sensor-type",
        tone: "info",
        label: "Sensor de energia",
      },
    ]);
    expect(presentation.statusTag).toEqual({
      key: "status",
      tone: "positive",
      label: "Operando",
    });
    expect(presentation.highlightClass).toBeUndefined();
    expect(presentation.metadata).toEqual(
      expect.arrayContaining([
        {
          key: "metadata-sensor",
          label: "Sensor",
          value: "EN-200",
        },
      ]),
    );
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-gateway"),
    ).toBe(false);
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-parent"),
    ).toBe(false);
    expect(
      presentation.metadata.some((entry) => entry.key === "metadata-location"),
    ).toBe(false);
  });
});
