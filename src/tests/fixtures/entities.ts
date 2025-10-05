import type {
  Asset,
  ComponentAsset,
  NonComponentAsset,
} from "../../types/asset";
import type { Location } from "../../types/location";

let locationSequence = 0;
let assetSequence = 0;
let componentSequence = 0;
let assetApiSequence = 0;

/**
 * Generates a location entity with sensible defaults for id, name, and parentId.
 * Override any field via the `overrides` parameter to tailor specific scenarios.
 */
export const buildLocation = (overrides: Partial<Location> = {}): Location => {
  const {
    id = `loc-${++locationSequence}`,
    name = "Plant",
    parentId = null,
  } = overrides;

  return {
    id,
    name,
    parentId,
  };
};

/**
 * Builds an asset entry without telemetry metadata. Useful for composing trees
 * where the node can still host child assets or components later on.
 */
export const buildNonComponentAsset = (
  overrides: Partial<NonComponentAsset> = {},
): NonComponentAsset => {
  const {
    id = `asset-${++assetSequence}`,
    name = "Asset",
    locationId = null,
    parentId = null,
  } = overrides;

  const gatewayId =
    "gatewayId" in overrides ? (overrides.gatewayId ?? null) : null;
  const sensorId =
    "sensorId" in overrides ? (overrides.sensorId ?? null) : null;

  return {
    id,
    name,
    locationId,
    parentId,
    sensorType: null,
    status: null,
    sensorId,
    gatewayId,
  };
};

/**
 * Produces a component asset, filling in reasonable defaults for sensor fields
 * while still allowing tests to explicitly pass null to simulate malformed API
 * payloads.
 */
export const buildComponentAsset = (
  overrides: Partial<ComponentAsset> = {},
): ComponentAsset => {
  const {
    id = `comp-${++componentSequence}`,
    name = "Component",
    locationId = null,
    parentId = null,
    sensorType = "energy",
    status = "operating",
  } = overrides;

  const sensorId =
    "sensorId" in overrides && overrides.sensorId !== undefined
      ? overrides.sensorId
      : `sensor-${id}`;
  const gatewayId =
    "gatewayId" in overrides ? (overrides.gatewayId ?? null) : null;

  return {
    id,
    name,
    locationId,
    parentId,
    sensorType,
    status,
    sensorId,
    gatewayId,
  };
};

/**
 * Convenience wrapper that returns the appropriate asset variant based on the
 * presence of `sensorType`. When provided, a component asset is created;
 * otherwise a non-component asset is returned.
 */
export const buildAsset = (overrides: Partial<Asset> = {}): Asset =>
  overrides.sensorType
    ? buildComponentAsset(overrides as Partial<ComponentAsset>)
    : buildNonComponentAsset(overrides as Partial<NonComponentAsset>);

type AssetApiResponseMock = {
  id: string;
  name: string;
  locationId: string | null;
  parentId: string | null;
  sensorType: string | null;
  status?: string | null;
  sensorId?: string | null;
  gatewayId?: string | null;
};

/**
 * Mirrors the API payload consumed by `transformAssetsResponse`, keeping
 * telemetry fields optional so tests can simulate malformed responses.
 */
export const buildAssetApiResponse = (
  overrides: Partial<AssetApiResponseMock> = {},
): AssetApiResponseMock => ({
  id: overrides.id ?? `asset-api-${++assetApiSequence}`,
  name: overrides.name ?? "Asset",
  locationId: overrides.locationId ?? null,
  parentId: overrides.parentId ?? null,
  sensorType: overrides.sensorType ?? null,
  status: overrides.status ?? null,
  sensorId: overrides.sensorId ?? null,
  gatewayId: overrides.gatewayId ?? null,
});

/**
 * Resets every entity builder counter, useful between tests that rely on
 * deterministic identifiers without manually overriding the `id` field.
 */
export const resetEntitySequences = () => {
  locationSequence = 0;
  assetSequence = 0;
  componentSequence = 0;
  assetApiSequence = 0;
};
