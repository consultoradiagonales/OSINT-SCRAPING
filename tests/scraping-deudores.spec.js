import { test, expect } from '@playwright/test';

test.describe('BCRA Central de Deudores - Scraping', () => {
  test.beforeEach(async ({ page }) => {
      await page.goto('/situacion-crediticia/');
        });

          test('Extrae datos de la tabla de deudores', async ({ page }) => {
              const tableRows = page.locator('table tbody tr');
                  expect(await tableRows.count()).toBeGreaterThan(0);
                    });

                      test('Información de deudor es legible', async ({ page }) => {
                          const cells = page.locator('table tbody td');
                              expect(await cells.first().isVisible()).toBeTruthy();
                                });

                                  test('Búsqueda por número de documento', async ({ page }) => {
                                      const searchInput = page.locator('input[type="text"]').first();
                                          await searchInput.fill('12345678');
                                              await expect(searchInput).toHaveValue('12345678');
                                                });

                                                  test('Filtro de búsqueda funciona', async ({ page }) => {
                                                      const filterButton = page.locator('button').first();
                                                          await filterButton.click();
                                                              await page.waitForTimeout(1000);
                                                                });

                                                                  test('Datos extraídos contienen campos requeridos', async ({ page }) => {
                                                                      const headers = page.locator('table thead th');
                                                                          const headerCount = await headers.count();
                                                                              expect(headerCount).toBeGreaterThan(0);
                                                                                });
                                                                                });
