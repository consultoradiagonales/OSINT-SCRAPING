import { test, expect } from "@playwright/test";

test.describe("OSINT-SCRAPING smoke", () => {
  test("home carga sin errores", async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto("/");
    expect(response.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "BCRA OSINT Demo" })).toBeVisible();
    await expect(page.locator("#viewBandeja")).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("bandeja carga sin errores", async ({ page }) => {
    const response = await page.goto("/bandeja");
    expect(response.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Bandeja OSINT" })).toBeVisible();
    await expect(page.locator("#identifier")).toBeVisible();
  });
});
