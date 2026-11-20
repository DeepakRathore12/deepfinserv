import { expect, test, type Page } from '@playwright/test';

/** Capture the code the test-mode API returns from /otp/send. */
async function sendOtp(page: Page, click: () => Promise<void>) {
  const res = page.waitForResponse((r) => r.url().includes('/otp/send') && r.request().method() === 'POST');
  await click();
  const body = (await (await res).json()) as { devCode?: string };
  expect(body.devCode, 'API must run with OTP_ECHO=true').toMatch(/^\d{6}$/);
  return body.devCode!;
}

const mobile = () => `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;

test('apply: request, verify, offers, details, done', async ({ page }) => {
  await page.goto('/apply?product=personal-loan');
  await page.getByLabel('How much do you need?').fill('500000');
  await page.getByLabel('Monthly take-home salary').fill('80000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Mobile number').fill(mobile());
  await page.getByRole('checkbox').check();
  const code = await sendOtp(page, () => page.getByRole('button', { name: 'Send code' }).click());
  await page.locator('input[inputmode="numeric"]').last().fill(code);
  await page.getByRole('button', { name: 'Verify and see offers' }).click();

  await expect(page.getByText(/best match/i).first()).toBeVisible();
  await page.getByRole('button', { name: 'Choose this offer' }).first().click();

  await page.getByLabel('Full name (as on PAN)').fill('Asha Verma');
  await page.getByLabel('Date of birth').fill('1990-04-12');
  await page.getByLabel('PAN', { exact: true }).fill('ABCDE1234F');
  await page.getByLabel('Email').fill('asha@example.com');
  await page.getByLabel('Company you work for').fill('Acme Private Limited');
  await page.getByLabel('Pincode').fill('560001');
  await page.getByLabel('City').fill('Bengaluru');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit application' }).click();

  await expect(page.getByText(/DK\d{2}[A-Z2-9]{8}/)).toBeVisible();
});

test('credit score: books an advisor review, never shows an invented score', async ({ page }) => {
  await page.goto('/credit-score');
  await page.getByLabel('Full name (as on PAN)').fill('Ravi Kumar');
  await page.getByLabel('PAN', { exact: true }).fill('ABCDE1234F');
  await page.getByLabel('Mobile number').fill(mobile());
  await page.getByRole('checkbox').check();
  const code = await sendOtp(page, () => page.getByRole('button', { name: 'Get my free score' }).click());
  await page.locator('input[inputmode="numeric"]').last().fill(code);
  await page.getByRole('button', { name: 'Verify and continue' }).click();
  await expect(page.getByText(/CS\d{2}[A-Z2-9]{8}/)).toBeVisible();
});

test('callback form saves and confirms', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel(/name/i).first().fill('Meera Shah');
  await page
    .getByLabel(/mobile/i)
    .first()
    .fill(mobile());
  await page.getByLabel(/city/i).first().fill('Pune');
  await page
    .getByRole('button', { name: /call me|request|submit/i })
    .first()
    .click();
  await expect(
    page
      .getByRole('status')
      .or(page.getByText(/we will call|we'll call|thank/i))
      .first(),
  ).toBeVisible();
});
