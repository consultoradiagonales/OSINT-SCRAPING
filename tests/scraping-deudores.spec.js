import { test, expect } from "@playwright/test";

test.describe("Bandeja OSINT", () => {
  test("genera reporte OSINT basico desde DNI", async ({ request }) => {
    const response = await request.post("/api/bandeja-osint", {
      data: { identifier: "26534279" }
    });
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.subject.dni).toBe("26534279");
    expect(json.subject.variants.length).toBeGreaterThan(0);
    expect(json.dorks.length).toBeGreaterThan(0);
    expect(json.modules.map(item => item.id)).toContain("bcra");
    expect(json.evidence.reportPath).toContain("bandeja-osint.json");
  });

  test("permite completar el identificador en la UI", async ({ page }) => {
    await page.goto("/bandeja");
    await page.locator("#identifier").fill("26534279");
    await expect(page.locator("#identifier")).toHaveValue("26534279");
  });
});
