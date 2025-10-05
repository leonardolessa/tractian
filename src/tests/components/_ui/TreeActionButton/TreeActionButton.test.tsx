import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { TreeActionButton } from "../../../../components/_ui/TreeActionButton";

describe("TreeActionButton", () => {
  it("shows the label and keeps the icon on the left by default", () => {
    const { getByRole, getByTestId } = render(
      <TreeActionButton icon={<svg data-testid="left-icon" />}>
        Open details
      </TreeActionButton>,
    );

    const button = getByRole("button", { name: "Open details" });
    const icon = getByTestId("left-icon").parentElement;

    expect(icon).not.toBeNull();
    expect((icon as HTMLElement).getAttribute("aria-hidden")).toBe("true");
    expect(button.firstElementChild).toBe(icon);
  });

  it("moves the icon to the right when requested", () => {
    const { getByRole, getByTestId } = render(
      <TreeActionButton
        icon={<svg data-testid="right-icon" />}
        iconPosition="right"
      >
        View summary
      </TreeActionButton>,
    );

    const button = getByRole("button", { name: "View summary" });
    const icon = getByTestId("right-icon").parentElement;

    expect(button.lastElementChild).toBe(icon);
  });

  it("forwards click handlers and extra classes", () => {
    const handleClick = vi.fn();

    const { getByRole } = render(
      <TreeActionButton onClick={handleClick} className="custom">
        Download
      </TreeActionButton>,
    );

    const button = getByRole("button", { name: "Download" });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button.className).toMatch(/custom/);
  });
});
