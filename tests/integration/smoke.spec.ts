import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Managed Blogging SaaS")).toBeVisible();
});
