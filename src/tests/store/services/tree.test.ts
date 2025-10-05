import { describe, expect, it } from "vitest";

import {
  buildAssetInvalidationTags,
  buildEntityTags,
} from "../../../store/services/tree";
import type { Asset, Company, Location } from "../../../types";

describe("tree service helpers", () => {
  const buildCompany = (id: string): Company => ({
    id,
    name: `Company ${id}`,
  });

  const buildLocation = (
    id: string,
    parentId: string | null = null,
  ): Location => ({
    id,
    name: `Location ${id}`,
    parentId,
  });

  const buildAsset = (id: string, overrides: Partial<Asset> = {}): Asset =>
    ({
      id,
      name: `Asset ${id}`,
      locationId: null,
      parentId: null,
      sensorType: null,
      status: null,
      sensorId: null,
      gatewayId: null,
      ...overrides,
    }) as Asset;

  it("maps company responses to cache tags", () => {
    const companies = [buildCompany("company-1"), buildCompany("company-2")];

    const tags = buildEntityTags("Company", companies);

    expect(tags).toEqual([
      { type: "Company", id: "company-1" },
      { type: "Company", id: "company-2" },
      { type: "Company", id: "LIST" },
    ]);
  });

  it("keeps the company list tag when the response is empty", () => {
    const tags = buildEntityTags("Company", undefined);

    expect(tags).toEqual([{ type: "Company", id: "LIST" }]);
  });

  it("maps location responses to cache tags", () => {
    const locations = [buildLocation("loc-1"), buildLocation("loc-2", "loc-1")];

    const tags = buildEntityTags("Location", locations);

    expect(tags).toEqual([
      { type: "Location", id: "loc-1" },
      { type: "Location", id: "loc-2" },
      { type: "Location", id: "LIST" },
    ]);
  });

  it("keeps the location list tag when the response is empty", () => {
    const tags = buildEntityTags("Location", undefined);

    expect(tags).toEqual([{ type: "Location", id: "LIST" }]);
  });

  it("maps asset responses to cache tags", () => {
    const assets: Asset[] = [
      buildAsset("asset-1"),
      buildAsset("asset-2", { parentId: "asset-1" }),
    ];

    const tags = buildEntityTags("Asset", assets);

    expect(tags).toEqual([
      { type: "Asset", id: "asset-1" },
      { type: "Asset", id: "asset-2" },
      { type: "Asset", id: "LIST" },
    ]);
  });

  it("keeps the asset list tag when the response is empty", () => {
    const tags = buildEntityTags("Asset", undefined);

    expect(tags).toEqual([{ type: "Asset", id: "LIST" }]);
  });

  it("returns the invalidation tag for the updated asset", () => {
    const tags = buildAssetInvalidationTags({ id: "asset-145" });

    expect(tags).toEqual([{ type: "Asset", id: "asset-145" }]);
  });
});
