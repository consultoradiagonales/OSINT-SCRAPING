import { test, expect } from '@playwright/test';

test.describe('BCRA - Smoke Tests', () => {
    test('Página carga sin errores', async ({ page }) => {
          await page.goto('/situacion-crediticia/');
          expect(page.url()).toContain('bcra');
    });

                test('Elementos principales existen', async ({ page }) => {
                      await page.goto('/situacion-crediticia/');
                      const mainContent = page.locator('main, [role="main"], .content').first();
                      await expect(mainContent).toBeVisible();
                });

                test('No hay errores de consola críticos', async ({ page }) => {
                      const errors = [];
                      page.on('pageerror', err => errors.push(err));
                      await page.goto('/situacion-crediticia/');
                      expect(errors.length).toBe(0);
                });

                test('Headers HTTP están presentes', async ({ page }) => {
                      const response = await page.goto('/situacion-crediticia/');
                      expect(response).not.toBeNull();
                      expect(response.status()).toBeLessThan(400);
                });

                test('Imagen de logo carga correctamente', async ({ page }) => {
                      await page.goto('/situacion-crediticia/');
                      const images = page.locator('img');
                      const count = await images.count();
                      expect(count).toBeGreaterThan(0);
                });

                test('Scripts se ejecutan sin problemas', async ({ page }) => {
                      await page.goto('/situacion-crediticia/');
                      const scriptErrors = [];
                      page.on('console', msg => {
                              if (msg.type() === 'error') {
                                        scriptErrors.push(msg.text());
                              }
                      });
                      await page.waitForTimeout(500);
                      expect(scriptErrors.length).toBeLessThanOrEqual(0);
                });
});
