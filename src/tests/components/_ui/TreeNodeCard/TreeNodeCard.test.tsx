import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TreeNodeCard } from "../../../../components/_ui/TreeNodeCard";

describe("TreeNodeCard", () => {
  it("displays the icon, primary texts, and optional details", () => {
    render(
      <TreeNodeCard
        iconSrc="/icone-sensor.svg"
        iconAlt="Sensor de energia"
        title="Linha Principal"
        subtitle="Setor Packaging"
        description="Equipamento com monitoramento contínuo de torque."
      >
        <span>Teste filho</span>
      </TreeNodeCard>,
    );

    expect(screen.getByRole("img", { name: "Sensor de energia" })).toBeTruthy();
    expect(screen.getByText("Linha Principal")).toBeTruthy();
    expect(screen.getByText("Setor Packaging")).toBeTruthy();
    expect(
      screen.getByText("Equipamento com monitoramento contínuo de torque."),
    ).toBeTruthy();
    expect(screen.getByText("Teste filho")).toBeTruthy();
  });

  it("renders the status, tags, and actions areas when provided", () => {
    render(
      <TreeNodeCard
        iconSrc="/icone-componentes.svg"
        iconAlt="Componente crítico"
        title="Conjunto Motor"
        statusSlot={<span>Crítico</span>}
        tagsSlot={
          <ul>
            <li>Torque</li>
            <li>Energy</li>
          </ul>
        }
        actionsSlot={<button type="button">Abrir detalhes</button>}
      />,
    );

    expect(screen.getByText("Crítico")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abrir detalhes" })).toBeTruthy();
    expect(screen.getByText("Torque")).toBeTruthy();
    expect(screen.getByText("Energy")).toBeTruthy();
  });
});
