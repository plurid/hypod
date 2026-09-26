import { expect, test } from '@playwright/test';

test('an owner can unlock the responsive admin interface and create a namespace', async ({
  page,
  request,
}) => {
  const indexMediaType = 'application/vnd.oci.image.index.v1+json';
  const pushed = await request.put('/v2/plurid/demo/manifests/latest', {
    data: JSON.stringify({
      schemaVersion: 2,
      mediaType: indexMediaType,
      manifests: [],
    }),
    headers: {
      Authorization: `Basic ${Buffer.from('e2e-owner:e2e-owner-key').toString('base64')}`,
      'Content-Type': indexMediaType,
    },
  });
  expect(pushed.status()).toBe(201);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('[data-plurid-entity="PluridSpace"]')).toBeVisible();
  await expect(page.locator('[data-plurid-entity="PluridToolbar"]')).toBeVisible();
  await expect(page.locator('[data-plurid-entity="PluridViewcube"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Registry operations' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log in' }).first()).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  await page.getByRole('button', { name: 'Log in' }).first().click();
  const login = page.getByRole('dialog', { name: 'Unlock registry controls' });
  await login.getByLabel('Identonym').fill('e2e-owner');
  await login.getByLabel('Key').fill('e2e-owner-key');
  await login.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  const spatialLink = page.locator('[data-plurid-entity="PluridLink"]');
  await spatialLink.focus();
  await spatialLink.press('Enter');
  await expect(page.locator('[data-plurid-entity="PluridPlane"]')).toHaveCount(2);
  const backToRegistry = page.getByRole('button', { name: 'Back to registry' });
  await expect(backToRegistry).toBeVisible();
  await backToRegistry.click();
  await expect(backToRegistry).toBeHidden();
  await page.getByRole('button', { name: /Organization/ }).click();
  await page.getByPlaceholder('Namespace name').fill('platform');
  await page.getByPlaceholder('Namespace name').press('Enter');
  await expect(page.getByText('platform', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('button', { name: 'Log in' }).first()).toBeVisible();
});
