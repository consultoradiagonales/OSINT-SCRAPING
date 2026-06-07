import { test, expect } from "@playwright/test";

test.describe("BCRA OSINT Demo", () => {
  test("carga el frontend local", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "BCRA OSINT Demo" })).toBeVisible();
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#apiRun")).toContainText("Consultar API BCRA Wrapper");
  });

  test("expone el visor de resultados", async ({ page }) => {
    await page.goto("/visor");
    await expect(page.getByRole("heading", { name: "Visor BCRA OSINT" })).toBeVisible();
  });

  test("expone la bandeja OSINT", async ({ page }) => {
    await page.goto("/bandeja");
    await expect(page.getByRole("heading", { name: "Bandeja OSINT" })).toBeVisible();
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#run")).toContainText("Rastrear bandeja OSINT");
  });
});
