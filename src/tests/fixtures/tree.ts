import type {
  Asset,
  Company,
  ComponentAsset,
  Location,
  NonComponentAsset,
} from "../../types";
import type {
  AssetTreeNode,
  ComponentTreeNode,
  LocationTreeNode,
  TreeNode,
} from "../../types/tree";
import {
  buildComponentAsset,
  buildLocation,
  buildNonComponentAsset,
} from "./entities";
import { createCompanyListFixture } from "./company";

interface NodeFactoryOptions {
  children?: TreeNode[];
}

const STATIC_LOCATIONS_FIXTURE: Location[] = [
  {
    id: "loc-raw-material",
    name: "Production Area - Raw Material",
    parentId: null,
  },
  {
    id: "loc-charcoal",
    name: "Charcoal Storage Sector",
    parentId: "loc-raw-material",
  },
  {
    id: "loc-finishing",
    name: "Finishing Warehouse",
    parentId: null,
  },
];

const STATIC_ASSETS_FIXTURE: Asset[] = [
  {
    id: "asset-conveyor",
    name: "Conveyor Belt Assembly",
    locationId: "loc-charcoal",
    parentId: null,
    sensorType: null,
    status: null,
    sensorId: null,
    gatewayId: null,
  },
  {
    id: "asset-motor-tc01",
    name: "Motor TC01 Coal Unloading AF02",
    locationId: null,
    parentId: "asset-conveyor",
    sensorType: null,
    status: null,
    sensorId: null,
    gatewayId: null,
  },
  {
    id: "comp-motor-rt",
    name: "Motor RT Coal AF01",
    locationId: null,
    parentId: "asset-motor-tc01",
    sensorType: "vibration",
    status: "operating",
    sensorId: "FIJ309",
    gatewayId: "FRH546",
  },
  {
    id: "comp-alert-vibration",
    name: "Conveyor Vibration Sensor",
    locationId: null,
    parentId: "asset-motor-tc01",
    sensorType: "vibration",
    status: "alert",
    sensorId: "VRB210",
    gatewayId: "ZZT004",
  },
  {
    id: "comp-energy-panel",
    name: "Energy Meter Panel",
    locationId: null,
    parentId: "asset-conveyor",
    sensorType: "energy",
    status: "operating",
    sensorId: "ENG240",
    gatewayId: "ENG-GTW-01",
  },
  {
    id: "comp-structural",
    name: "Structural Sensor",
    locationId: "loc-charcoal",
    parentId: "loc-charcoal",
    sensorType: "energy",
    status: "operating",
    sensorId: "STT993",
    gatewayId: "ST-GW-10",
  },
  {
    id: "asset-packaging",
    name: "Packaging Line 01",
    locationId: "loc-finishing",
    parentId: null,
    sensorType: null,
    status: null,
    sensorId: null,
    gatewayId: null,
  },
  {
    id: "comp-torque",
    name: "Torque Sensor",
    locationId: null,
    parentId: "asset-packaging",
    sensorType: "vibration",
    status: "operating",
    sensorId: "TRQ552",
    gatewayId: "PKG-GATEWAY",
  },
  {
    id: "comp-packaging-energy",
    name: "Packaging Energy Monitor",
    locationId: null,
    parentId: "asset-packaging",
    sensorType: "energy",
    status: "alert",
    sensorId: "ENG554",
    gatewayId: "PKG-ENG-01",
  },
  {
    id: "comp-fan-external",
    name: "Fan - External",
    locationId: null,
    parentId: null,
    sensorType: "vibration",
    status: "operating",
    sensorId: "MTC052",
    gatewayId: "QHI640",
  },
];

export interface TreeApiScenario {
  companies: Company[];
  locations: Location[];
  assets: Asset[];
  defaultCompanyId: Company["id"];
  defaultCompanyName: Company["name"];
}

export const createTreeApiScenario = (): TreeApiScenario => {
  const companies = createCompanyListFixture();
  const [defaultCompany] = companies;

  return {
    companies: [...companies],
    locations: [...STATIC_LOCATIONS_FIXTURE],
    assets: [...STATIC_ASSETS_FIXTURE],
    defaultCompanyId: defaultCompany?.id ?? "company-alpha",
    defaultCompanyName: defaultCompany?.name ?? "Alpha Industries",
  };
};

export const makeLocationNode = (
  overrides: Partial<Location> = {},
  options: NodeFactoryOptions = {},
): LocationTreeNode => {
  const data = buildLocation(overrides);

  return {
    id: data.id,
    name: data.name,
    type: "location",
    data,
    children: options.children ?? [],
  };
};

export const makeAssetNode = (
  overrides: Partial<NonComponentAsset> = {},
  options: NodeFactoryOptions = {},
): AssetTreeNode => {
  const data = buildNonComponentAsset(overrides);

  return {
    id: data.id,
    name: data.name,
    type: "asset",
    data,
    children: options.children ?? [],
  };
};

export const makeComponentNode = (
  overrides: Partial<ComponentAsset> = {},
  options: NodeFactoryOptions = {},
): ComponentTreeNode => {
  const data = buildComponentAsset(overrides);

  return {
    id: data.id,
    name: data.name,
    type: "component",
    data,
    children: options.children ?? [],
  };
};

export const createStaticTreeFixture = (): TreeNode[] => {
  const { locations, assets } = createTreeApiScenario();

  const locationById = new Map(
    locations.map((location) => [location.id, location]),
  );
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  const assertLocation = (id: string): Location => {
    const location = locationById.get(id);
    if (!location) {
      throw new Error(`Location fixture "${id}" not found.`);
    }
    return location;
  };

  const makeLocation = (id: string, options: NodeFactoryOptions = {}) =>
    makeLocationNode(assertLocation(id), options);

  const makeTreeAsset = (id: string, options: NodeFactoryOptions = {}) => {
    const asset = assetById.get(id);
    if (!asset) {
      throw new Error(`Asset fixture "${id}" not found.`);
    }
    return asset.sensorType
      ? makeComponentNode(asset as ComponentAsset, options)
      : makeAssetNode(asset as NonComponentAsset, options);
  };

  const conveyorMotor = makeTreeAsset("asset-motor-tc01", {
    children: [
      makeTreeAsset("comp-motor-rt"),
      makeTreeAsset("comp-alert-vibration"),
    ],
  });

  const conveyorAssembly = makeTreeAsset("asset-conveyor", {
    children: [conveyorMotor, makeTreeAsset("comp-energy-panel")],
  });

  const charcoalStorage = makeLocation("loc-charcoal", {
    children: [conveyorAssembly, makeTreeAsset("comp-structural")],
  });

  const productionArea = makeLocation("loc-raw-material", {
    children: [charcoalStorage],
  });

  const packagingLine = makeTreeAsset("asset-packaging", {
    children: [
      makeTreeAsset("comp-torque"),
      makeTreeAsset("comp-packaging-energy"),
    ],
  });

  const finishingWarehouse = makeLocation("loc-finishing", {
    children: [packagingLine],
  });

  const externalFan = makeTreeAsset("comp-fan-external");

  return [productionArea, finishingWarehouse, externalFan];
};

export const STATIC_TREE: TreeNode[] = createStaticTreeFixture();

export const flattenTreeNodes = (nodes: TreeNode[]): TreeNode[] =>
  nodes.flatMap((node) => [node, ...flattenTreeNodes(node.children)]);
