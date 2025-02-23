import { test, expect } from '@playwright/test';

// e2e tests locally working with running backend - not working in CI
test('should navigate from favorites list to WeatherComponent', async ({ page }) => {
  await page.goto('/favorites');

  await page.waitForSelector('table.favoriteTable tbody tr td a');
  const favoriteLink = page.locator('table.favoriteTable tbody tr td a').first();
  await expect(favoriteLink).toBeVisible();

  await favoriteLink.click();

  await page.waitForSelector('h1');
  await expect(page.locator('h1')).toHaveText('Weather Details');
});


test('should load WeatherComponent and display weather details', async ({ page }) => {
  await page.goto('/favorites/1');

  await page.waitForSelector('h1');
  await expect(page.locator('h1')).toHaveText('Weather Details');

  await page.waitForSelector('.card.favoriteData');
  await expect(page.locator('.card.favoriteData')).toBeVisible();

  await page.waitForSelector('.card.metar');
  await expect(page.locator('.card.metar')).toBeVisible();

  await page.waitForSelector('.card.weather');
  await expect(page.locator('.card.weather')).toBeVisible();

  await page.waitForSelector('a.btn-primary.back-button');
  await expect(page.locator('a.btn-primary.back-button')).toBeVisible();
});

test('should navigate back to favorites list when clicking back button', async ({ page }) => {
  await page.goto('/favorites/1');

  await page.click('a.btn-primary.back-button');

  await expect(page).toHaveURL('/favorites');
});
