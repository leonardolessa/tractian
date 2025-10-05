import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InputShell } from "../../../../components/_ui/InputShell";

describe("InputShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders optional leading and trailing icons inside aria-hidden wrappers", () => {
    render(
      <InputShell
        leadingIcon={<svg data-testid="leading-icon" />}
        trailingIcon={<svg data-testid="trailing-icon" />}
      >
        <span>Asset selector</span>
      </InputShell>,
    );

    const leadingIcon = screen.getByTestId("leading-icon");
    const trailingIcon = screen.getByTestId("trailing-icon");

    expect(leadingIcon.parentElement?.tagName).toBe("SPAN");
    expect(leadingIcon.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(trailingIcon.parentElement?.tagName).toBe("SPAN");
    expect(trailingIcon.parentElement?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("marks the shell as disabled when requested", () => {
    render(
      <InputShell disabled data-testid="shell">
        <span>Disabled field</span>
      </InputShell>,
    );

    const shell = screen.getByTestId("shell");

    expect(shell.getAttribute("data-disabled")).toBe("true");
    expect(shell.getAttribute("aria-disabled")).toBe("true");
    expect(shell.className).toContain("cursor-not-allowed");
    expect(shell.className).toContain("opacity-70");
  });

  it("bubbles focus events from children to the shell", async () => {
    const onFocus = vi.fn();
    const user = userEvent.setup();

    render(
      <InputShell onFocus={onFocus}>
        <input aria-label="Asset name" />
      </InputShell>,
    );

    const input = screen.getByLabelText("Asset name");

    await user.click(input);

    expect(onFocus).toHaveBeenCalled();
  });
});
