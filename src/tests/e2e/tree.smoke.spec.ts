import { expect, test, type Route } from "@playwright/test";

import { config } from "../../helpers/config";
import { createTreeApiScenario, type TreeApiScenario } from "../fixtures";

const respondWithJson = (route: Route, payload: unknown) =>
  route.fulfill({
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

let scenario: TreeApiScenario;

test.describe("Asset tree smoke test", () => {
  test.beforeEach(async ({ page }) => {
    scenario = createTreeApiScenario();

    await page.route(`${config.apiBaseUrl}/companies`, (route) =>
      respondWithJson(route, scenario.companies),
    );
    await page.route(
      `${config.apiBaseUrl}/companies/${scenario.defaultCompanyId}/locations`,
      (route) => respondWithJson(route, scenario.locations),
    );
    await page.route(
      `${config.apiBaseUrl}/companies/${scenario.defaultCompanyId}/assets`,
      (route) => respondWithJson(route, scenario.assets),
    );
  });

  test("allows a user to explore and filter assets", async ({ page }) => {
    await page.goto("/");

    const companySelect = page.getByLabel("Empresa");
    await expect(companySelect).toBeVisible();

    await companySelect.selectOption(scenario.defaultCompanyId);

    await expect(
      page.getByRole("heading", { name: scenario.defaultCompanyName }),
    ).toBeVisible();

    await page.getByLabel("Expandir Production Area - Raw Material").click();
    await page.getByLabel("Expandir Charcoal Storage Sector").click();
    await page.getByLabel("Expandir Conveyor Belt Assembly").click();
    await page.getByLabel("Expandir Motor TC01 Coal Unloading AF02").click();

    await expect(page.getByText("Conveyor Vibration Sensor")).toBeVisible();
    await expect(page.getByText("Energy Meter Panel")).toBeVisible();

    await page.getByRole("button", { name: "Sensores de energia" }).click();

    await page.getByLabel("Expandir Production Area - Raw Material").click();
    await page.getByLabel("Expandir Charcoal Storage Sector").click();
    await page.getByLabel("Expandir Conveyor Belt Assembly").click();

    await expect(page.getByText("Energy Meter Panel")).toBeVisible();
    await expect(page.getByText("Conveyor Vibration Sensor")).toHaveCount(0);

    await page.getByRole("button", { name: "Sensores de energia" }).click();

    const searchInput = page.getByLabel("Busca rápida");
    await searchInput.fill("Fan");
    await page.waitForTimeout(400);

    await expect(page.getByText("Fan - External")).toBeVisible();
  });
});
