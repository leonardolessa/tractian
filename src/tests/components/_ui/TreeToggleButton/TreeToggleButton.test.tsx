import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TreeToggleButton } from "../../../../components/_ui/TreeToggleButton";

describe("TreeToggleButton", () => {
  it("describes the expand action when the node is collapsed", () => {
    render(<TreeToggleButton expanded={false} label="Linha de montagem" />);

    const toggle = screen.getByRole("button", {
      name: "Expandir Linha de montagem",
    });

    expect(toggle.getAttribute("aria-label")).toBe(
      "Expandir Linha de montagem",
    );
    expect(toggle.getAttribute("type")).toBe("button");
  });

  it("describes the collapse action when the node is expanded", () => {
    render(<TreeToggleButton expanded label="Linha de montagem" />);

    const toggle = screen.getByRole("button", {
      name: "Recolher Linha de montagem",
    });
    const icon = toggle.querySelector("svg");

    expect(toggle.getAttribute("aria-label")).toBe(
      "Recolher Linha de montagem",
    );
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });
});
