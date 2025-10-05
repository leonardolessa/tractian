import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../../../App";
import * as treeService from "../../../store/services/tree";
import { mockTreeApiSelectors } from "../../mocks/treeApi";
import type { SensorType } from "../../../types/asset";
import { renderWithProviders } from "../../utils/renderWithProviders";
import type { RootState } from "../../../store";
import { createCompanyListFixture } from "../../fixtures";

const COMPANIES_FIXTURE = createCompanyListFixture();

const createPreloadedState = (): Partial<RootState> => ({
  tree: {
    selectedCompanyId: COMPANIES_FIXTURE[0].id,
    filters: {
      searchTerm: "Torque",
      sensorTypes: ["energy" as SensorType],
      criticalOnly: true,
    },
  },
});

const stubTreeQueries = () => {
  vi.spyOn(treeService, "useGetCompanyLocationsQuery").mockReturnValue({
    data: [],
    currentData: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    isSuccess: true,
    error: null,
    refetch: vi.fn(),
    fulfilledTimeStamp: Date.now(),
  } as unknown as ReturnType<typeof treeService.useGetCompanyLocationsQuery>);

  vi.spyOn(treeService, "useGetCompanyAssetsQuery").mockReturnValue({
    data: [],
    currentData: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    isSuccess: true,
    error: null,
    refetch: vi.fn(),
    fulfilledTimeStamp: Date.now(),
  } as unknown as ReturnType<typeof treeService.useGetCompanyAssetsQuery>);
};

describe("App company selection", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("clears filters and activates the new company when the user changes the dropdown", async () => {
    vi.spyOn(treeService, "useGetCompaniesQuery").mockReturnValue({
      data: COMPANIES_FIXTURE,
      currentData: COMPANIES_FIXTURE,
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      error: null,
      refetch: vi.fn(),
      fulfilledTimeStamp: Date.now(),
    } as unknown as ReturnType<typeof treeService.useGetCompaniesQuery>);

    stubTreeQueries();

    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      preloadedState: createPreloadedState(),
    });

    const companySelect = screen.getByLabelText("Empresa");
    const searchInput = screen.getByLabelText("Busca rápida");
    const energyToggle = screen.getByRole("button", {
      name: "Sensores de energia",
    });
    const criticalToggle = screen.getByRole("button", {
      name: "Status crítico",
    });

    expect((companySelect as HTMLSelectElement).value).toBe("company-alpha");
    expect((searchInput as HTMLInputElement).value).toBe("Torque");
    expect(energyToggle.getAttribute("aria-pressed")).toBe("true");
    expect(criticalToggle.getAttribute("aria-pressed")).toBe("true");

    await user.selectOptions(companySelect, "company-beta");

    await waitFor(() => {
      expect((companySelect as HTMLSelectElement).value).toBe("company-beta");
      expect((searchInput as HTMLInputElement).value).toBe("");
      expect(energyToggle.getAttribute("aria-pressed")).toBe("false");
      expect(criticalToggle.getAttribute("aria-pressed")).toBe("false");
    });

    await waitFor(() => {
      const state = store.getState().tree;
      expect(state.selectedCompanyId).toBe("company-beta");
      expect(state.filters).toEqual({
        searchTerm: "",
        sensorTypes: [],
        criticalOnly: false,
      });
    });
  });

  it("shows a critical status banner when the company request fails", () => {
    vi.spyOn(treeService, "useGetCompaniesQuery").mockReturnValue({
      data: undefined,
      currentData: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      isSuccess: false,
      error: {
        status: 503,
        data: { message: "Companies service unavailable" },
      },
      refetch: vi.fn(),
      fulfilledTimeStamp: Date.now(),
    } as unknown as ReturnType<typeof treeService.useGetCompaniesQuery>);

    stubTreeQueries();

    renderWithProviders(<App />, {
      preloadedState: createPreloadedState(),
    });

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Companies service unavailable");
  });

  it("surfaces the tree error banner when asset data cannot be loaded", async () => {
    vi.spyOn(treeService, "useGetCompaniesQuery").mockReturnValue({
      data: COMPANIES_FIXTURE,
      currentData: COMPANIES_FIXTURE,
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
      error: null,
      refetch: vi.fn(),
      fulfilledTimeStamp: Date.now(),
    } as unknown as ReturnType<typeof treeService.useGetCompaniesQuery>);

    stubTreeQueries();

    mockTreeApiSelectors({
      assets: {
        isError: true,
        error: {
          status: 502,
          data: { message: "Assets request failed" },
        },
      },
    });

    renderWithProviders(<App />, {
      preloadedState: createPreloadedState(),
    });

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Assets request failed");
  });
});
