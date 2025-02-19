import { test, expect } from '@playwright/test';

// e2e tests locally working with running backend - not working in CI
test('should load FavoritesComponent and display form fields', async ({ page }) => {
  await page.goto('/favorites');

  await page.waitForSelector('input#name');
  const nameInput = await page.locator('input#name');
  await expect(nameInput).toBeVisible();

  await page.waitForSelector('input#locationName');
  const locationNameInput = await page.locator('input#locationName');
  await expect(locationNameInput).toBeVisible();

  await page.waitForSelector('button[type="submit"]');
  const submitButton = await page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
});

test('should display a success message when a favorite is created successfully', async ({ page }) => {
  await page.route('/api/favorites', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  await page.goto('/favorites');

  await page.fill('input#name', 'Favorite 1');
  await page.fill('input#locationName', 'Vienna,Austria');

  const alertPromise = page.waitForEvent('dialog');

  await page.click('button[type="submit"]');

  const dialog = await alertPromise;
  expect(dialog.message()).toBe('Favorite successfully created!');
  await dialog.dismiss();
});

test('should display an error message when favorite creation fails', async ({ page }) => {
  await page.route('/api/favorites', async route => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) });
  });

  await page.goto('/favorites');

  await page.fill('input#name', 'Favorite 1');
  await page.fill('input#locationName', 'sadhajgwsda');

  const alertPromise = page.waitForEvent('dialog');

  await page.click('button[type="submit"]');

  const dialog = await alertPromise;
  expect(dialog.message()).toBe('An unexpected error occurred while creating the favorite.');
  await dialog.dismiss();
});

test('should delete a favorite successfully', async ({ page }) => {
  await page.route('/api/favorites', async route => {
    const json = [{ id: 1, name: 'Favorite 1', location: { name: 'Vienna,Austria' } }];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  await page.route('/api/favorites/1', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  await page.goto('/favorites');

  const alertPromise = page.waitForEvent('dialog');

  await page.click(`tr:has-text("Wien") >> button.delete-btn`);

  const dialog = await alertPromise;
  expect(dialog.message()).toBe('Favorite deleted successfully!');
  await dialog.dismiss();
});
