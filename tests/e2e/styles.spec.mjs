import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`Hypod controls do not resize Plurid chrome at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const help = page.getByRole('button', { name: 'Keyboard shortcuts', exact: true });
    await expect(help).toBeVisible();
    await expect(help).toHaveCSS('width', '30px');
    await expect(help).toHaveCSS('height', '30px');

    const viewcube = page.locator('[data-plurid-entity="PluridViewcube"]');
    await expect(viewcube).toBeVisible();
    // Inspect the native face grid, whether its zones are divs (36) or buttons (37).
    const face = viewcube.getByText('front', { exact: true }).locator('..');
    await expect(face).toHaveCSS('width', '50px');
    await expect(face).toHaveCSS('height', '50px');
    const zones = face.locator(':scope > *');
    await expect(zones).toHaveCount(9);
    const tracks = [10, 30, 10];
    for (let index = 0; index < 9; index += 1) {
      await expect(zones.nth(index)).toHaveCSS('width', `${tracks[index % 3]}px`);
      await expect(zones.nth(index)).toHaveCSS('height', `${tracks[Math.floor(index / 3)]}px`);
    }

    await help.focus();
    await help.press('Enter');
    const shortcuts = page.locator('[data-plurid-entity="shortcuts-overlay"]');
    await expect(shortcuts).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(shortcuts).toBeHidden();

    const loginButton = page.getByRole('button', { name: 'Log in', exact: true }).first();
    await expect(loginButton).toHaveCSS('min-height', '42px');
    await loginButton.focus();
    await expect(loginButton).toHaveCSS('outline-style', 'solid');
    await expect(loginButton).toHaveCSS('outline-width', '3px');
    await loginButton.press('Enter');
    const login = page.getByRole('dialog', { name: 'Unlock registry controls' });
    const identonym = login.getByLabel('Identonym');
    await expect(identonym).toHaveCSS('min-height', '42px');
    await expect(login.getByLabel('Key')).toHaveCSS('min-height', '42px');
    await expect(identonym).toBeFocused();
    await login.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(login).toBeHidden();
  });
}
