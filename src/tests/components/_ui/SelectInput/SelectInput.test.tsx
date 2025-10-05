import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SelectInput } from "../../../../components/_ui/SelectInput";

describe("SelectInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders icons around the select", () => {
    render(
      <SelectInput
        leadingIcon={<svg data-testid="leading-icon" />}
        trailingIcon={<svg data-testid="trailing-icon" />}
      >
        <option>All assets</option>
      </SelectInput>,
    );

    const leading = screen.getByTestId("leading-icon");
    const trailing = screen.getByTestId("trailing-icon");

    expect(leading.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(trailing.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("disables both the shell and the native select when requested", () => {
    render(
      <SelectInput disabled>
        <option>All assets</option>
      </SelectInput>,
    );

    const select = screen.getByRole("combobox");
    const shell = select.parentElement?.parentElement;

    expect(select.hasAttribute("disabled")).toBe(true);
    expect(shell?.getAttribute("data-disabled")).toBe("true");
    expect(shell?.getAttribute("aria-disabled")).toBe("true");
  });

  it("combines shell and select class names", () => {
    render(
      <SelectInput
        shellClassName="shadow-md"
        selectClassName="text-lg"
        className="mt-2"
      >
        <option>All assets</option>
      </SelectInput>,
    );

    const select = screen.getByRole("combobox");
    const shell = select.parentElement?.parentElement;

    expect(select.className).toContain("text-lg");
    expect(shell?.className).toContain("shadow-md");
    expect(shell?.className).toContain("mt-2");
  });

  it("emits focus events and keeps the select focused", async () => {
    const onFocus = vi.fn();
    const user = userEvent.setup();

    render(
      <SelectInput onFocus={onFocus}>
        <option>All assets</option>
      </SelectInput>,
    );

    const select = screen.getByRole("combobox");

    await user.click(select);

    expect(onFocus).toHaveBeenCalled();
    expect(document.activeElement).toBe(select);
  });
});
