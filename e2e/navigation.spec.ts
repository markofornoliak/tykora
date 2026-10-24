import { expect, test } from '@playwright/test';
test('navigation reaches practice and theme selection', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: /Каждое нажатие/})).toBeVisible();
  await page.getByRole('link', {name: /Практика/}).first().click();
  await expect(page.getByRole('heading', {name: /Точность рождает скорость/})).toBeVisible();
  await page.getByRole('link', {name: /Темы и стиль/}).first().click();
  await expect(page.getByRole('button', {name:/Nightfall/})).toBeVisible();
});
test('focus mode can be exited', async ({ page }) => {
  await page.goto('/#/practice');
  await page.getByRole('button', {name:/Фокус/}).click();
  await expect(page.locator('body')).toHaveClass(/focus-mode/);
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
});
