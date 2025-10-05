import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockTreeApiSelectors } from "../../mocks/treeApi";
import {
  ASSETS_FIXTURE,
  LOCATIONS_FIXTURE,
  expandTreePath,
  renderFilterableTreeView,
} from "./treeViewTestUtils";

describe("TreeView filters", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("filters the tree based on the search text", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderFilterableTreeView("company-search");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(screen.getByText("Torque Sensor")).toBeTruthy();
    expect(screen.getByText("Vibration Sensor")).toBeTruthy();
    expect(screen.getByText("Energy Monitor")).toBeTruthy();

    const searchInput = screen.getByLabelText("Busca rápida");
    await user.clear(searchInput);
    await user.type(searchInput, "Torque");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
    ]);

    expect(await screen.findByText("Torque Sensor")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Vibration Sensor")).toBeNull();
      expect(screen.queryByText("Energy Monitor")).toBeNull();
    });
  });

  it("shows only energy sensors when the dedicated filter is active", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderFilterableTreeView("company-energy");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(screen.getByText("Torque Sensor")).toBeTruthy();
    expect(screen.getByText("Vibration Sensor")).toBeTruthy();
    expect(screen.getByText("Energy Monitor")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Sensores de energia" }),
    );

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(await screen.findByText("Torque Sensor")).toBeTruthy();
    expect(await screen.findByText("Energy Monitor")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Vibration Sensor")).toBeNull();
    });
  });

  it("keeps only critical sensors when the critical status filter is enabled", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderFilterableTreeView("company-critical");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(screen.getByText("Torque Sensor")).toBeTruthy();
    expect(screen.getByText("Vibration Sensor")).toBeTruthy();
    expect(screen.getByText("Energy Monitor")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Status crítico" }));

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
    ]);

    expect(await screen.findByText("Torque Sensor")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Vibration Sensor")).toBeNull();
      expect(screen.queryByText("Energy Monitor")).toBeNull();
    });
  });

  it("collapses expanded branches when the search filter changes through the UI", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderFilterableTreeView("company-search-ui");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(screen.getByLabelText("Recolher Conveyor Belt")).toBeTruthy();
    expect(screen.getByLabelText("Recolher Conveyor Motor")).toBeTruthy();

    const searchInput = screen.getByLabelText("Busca rápida");
    await user.clear(searchInput);
    await user.type(searchInput, "Torque");

    await waitFor(() => {
      expect(screen.queryByLabelText("Subitens de Central Plant")).toBeNull();
      expect(screen.getByLabelText("Expandir Central Plant")).toBeTruthy();
    });

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
    ]);

    expect(await screen.findByText("Torque Sensor")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Vibration Sensor")).toBeNull();
      expect(screen.queryByText("Energy Monitor")).toBeNull();
    });
  });
});
