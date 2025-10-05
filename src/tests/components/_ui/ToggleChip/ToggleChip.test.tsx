import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ToggleChip } from "../../../../components/_ui/ToggleChip";

describe("ToggleChip", () => {
  it("exposes a toggle button with an accessible name", () => {
    render(<ToggleChip>Critical status</ToggleChip>);

    const chip = screen.getByRole("button", { name: "Critical status" });

    expect(chip.tagName).toBe("BUTTON");
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });

  it("marks the button as pressed when the prop is true", () => {
    render(<ToggleChip pressed>Energy sensors</ToggleChip>);

    const chip = screen.getByRole("button", { name: "Energy sensors" });

    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });
});
