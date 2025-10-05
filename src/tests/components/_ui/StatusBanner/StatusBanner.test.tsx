import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import {
  StatusBanner,
  type StatusBannerTone,
} from "../../../../components/_ui/StatusBanner";

const toneExpectations: Array<
  [StatusBannerTone, string, "status" | "alert", "polite" | "assertive"]
> = [
  ["neutral", "border-surface-800/50", "status", "polite"],
  ["info", "border-info-500/50", "status", "polite"],
  ["success", "border-positive-500/40", "status", "polite"],
  ["warning", "border-warning-500/45", "status", "polite"],
  ["critical", "border-critical-500/50", "alert", "assertive"],
];

describe("StatusBanner", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders children and neutral styling by default", () => {
    render(<StatusBanner>Testing status banner</StatusBanner>);

    const banner = screen.getByRole("status");

    expect(banner.textContent).toContain("Testing status banner");
    expect(banner.className).toContain("border-surface-800/50");
    expect(banner.getAttribute("aria-live")).toBe("polite");
  });

  it("combines custom classes with tone styles", () => {
    render(<StatusBanner className="shadow-lg">Status Banner</StatusBanner>);

    const banner = screen.getByRole("status");

    expect(banner.className).toContain("border-surface-800/50");
    expect(banner.className).toContain("shadow-lg");
  });

  it("renders the leading icon inside an aria-hidden wrapper", () => {
    render(
      <StatusBanner leadingIcon={<svg data-testid="status-icon" />}>
        Status Banner
      </StatusBanner>,
    );

    const icon = screen.getByTestId("status-icon");
    const iconContainer = icon.parentElement;

    expect(iconContainer?.tagName).toBe("SPAN");
    expect(iconContainer?.getAttribute("aria-hidden")).toBe("true");
    expect(iconContainer?.className).toContain("items-center");
  });

  toneExpectations.forEach(
    ([tone, expectedClass, expectedRole, expectedAriaLive]) => {
      it(`applies ${tone} styling and accessibility metadata`, () => {
        render(<StatusBanner tone={tone}>Status banner</StatusBanner>);

        const banner = screen.getByRole(expectedRole);

        expect(banner.className).toContain(expectedClass);
        expect(banner.getAttribute("aria-live")).toBe(expectedAriaLive);
      });
    },
  );
});
