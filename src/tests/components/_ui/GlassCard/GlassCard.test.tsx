import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GlassCard } from "../../../../components/_ui/GlassCard";

describe("GlassCard", () => {
  it("shows the header, actions, and content when props are provided", () => {
    render(
      <GlassCard
        heading="Resumo da produção"
        subheading="Dados atualizados a cada 5 minutos"
        description="Confira abaixo as métricas principais do turno em andamento."
        topHeading="Visão geral"
        actions={<button type="button">Atualizar agora</button>}
      >
        <p>Consumo total: 128 kWh</p>
      </GlassCard>,
    );

    expect(
      screen.getByRole("heading", { name: "Resumo da produção" }),
    ).toBeTruthy();
    expect(screen.getByText("Dados atualizados a cada 5 minutos")).toBeTruthy();
    expect(
      screen.getByText(
        "Confira abaixo as métricas principais do turno em andamento.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Visão geral")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Atualizar agora" }),
    ).toBeTruthy();
    expect(screen.getByText("Consumo total: 128 kWh")).toBeTruthy();
  });

  it("allows changing the root element through the as prop", () => {
    render(
      <GlassCard
        as="section"
        aria-label="Indicadores financeiros"
        className="shadow-extra"
      />,
    );

    const card = screen.getByLabelText("Indicadores financeiros");

    expect(card.tagName).toBe("SECTION");
    expect(card.className).toContain("shadow-extra");
  });
});
