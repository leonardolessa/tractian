import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { setSearchTerm } from "../../../store/slices/treeSlice";
import { mockTreeApiSelectors } from "../../mocks/treeApi";
import {
  ASSETS_FIXTURE,
  LOCATIONS_FIXTURE,
  expandTreePath,
  renderTreeView,
} from "./treeViewTestUtils";

describe("TreeView interactions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("expands nested nodes when toggle buttons are used", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderTreeView("company-interactions");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(await screen.findByText("Vibration Sensor")).toBeTruthy();
  });

  it("collapses expanded nodes when the collapse all button is pressed", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    renderTreeView("company-collapse");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(await screen.findByText("Vibration Sensor")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Recolher tudo" }));

    await waitFor(() => {
      expect(screen.queryByText("Vibration Sensor")).toBeNull();
      expect(screen.getByLabelText("Expandir Central Plant")).toBeTruthy();
    });
  });

  it("resets expanded nodes whenever the filters change", async () => {
    mockTreeApiSelectors({
      locations: { data: LOCATIONS_FIXTURE },
      assets: { data: ASSETS_FIXTURE },
    });

    const user = userEvent.setup();

    const { store } = renderTreeView("company-filter");

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
      "Conveyor Motor",
    ]);

    expect(screen.getByLabelText("Recolher Conveyor Belt")).toBeTruthy();
    expect(screen.getByLabelText("Recolher Conveyor Motor")).toBeTruthy();

    act(() => {
      store.dispatch(setSearchTerm("Vibration"));
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Subitens de Central Plant")).toBeNull();
      expect(screen.getByLabelText("Expandir Central Plant")).toBeTruthy();
    });

    await expandTreePath(user, [
      "Central Plant",
      "Packaging Floor",
      "Conveyor Belt",
    ]);

    const conveyorMotorToggle = await screen.findByLabelText(
      "Expandir Conveyor Motor",
    );
    await user.click(conveyorMotorToggle);

    expect(await screen.findByText("Vibration Sensor")).toBeTruthy();
  });
});
