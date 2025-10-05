import { vi } from "vitest";

import { treeApi } from "../../store/services/tree";

export interface TreeApiQuerySnapshot<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export const createTreeApiSnapshot = <TData>(
  overrides: Partial<TreeApiQuerySnapshot<TData>> = {},
): TreeApiQuerySnapshot<TData> => ({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

export const mockTreeApiSelectors = <TLocations, TAssets>({
  locations = {},
  assets = {},
}: {
  locations?: Partial<TreeApiQuerySnapshot<TLocations>>;
  assets?: Partial<TreeApiQuerySnapshot<TAssets>>;
} = {}) => {
  const locationsSelector = (() =>
    createTreeApiSnapshot(locations)) as unknown as ReturnType<
    (typeof treeApi.endpoints.getCompanyLocations)["select"]
  >;

  vi.spyOn(treeApi.endpoints.getCompanyLocations, "select").mockReturnValue(
    locationsSelector,
  );

  const assetsSelector = (() =>
    createTreeApiSnapshot(assets)) as unknown as ReturnType<
    (typeof treeApi.endpoints.getCompanyAssets)["select"]
  >;

  vi.spyOn(treeApi.endpoints.getCompanyAssets, "select").mockReturnValue(
    assetsSelector,
  );

  return { locationsSelector, assetsSelector };
};
