import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
const products: { product_id: string; product_name: string }[] = JSON.parse(
  readFileSync(
    new URL("../../public/data/products.json", import.meta.url),
    "utf8",
  ),
);
const cohort = "3-season|freestanding|double-wall|true";
const pair = "nh-cloud-up-20d,nh-cloud-up-pro-standard";
test("scope, canonical hidden reference, sale filter, nulls and downloads", async ({
  page,
}) => {
  await page.goto("/explore/");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "30 variants in scope",
  );
  await page.getByLabel("Comparison cohort").selectOption(cohort);
  await page
    .getByLabel("Brands (none selected = all)")
    .selectOption(["naturehike"]);
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "2 variants in scope",
  );
  await page
    .getByLabel("Price type", { exact: true })
    .selectOption("displayed_unclassified");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "2 variants in scope",
  );
  await page.getByLabel("Weight definition").selectOption("packed_weight_g");
  await page.getByLabel("Brands (none selected = all)").selectOption(["rei"]);
  await page.getByLabel("Price type", { exact: true }).selectOption("all");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "3 variants in scope",
  );
  await expect(page.locator(".stats-panel")).toContainText("$120.00");
  await expect(page.locator(".stats-panel")).toContainText("Baseline n");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download scoped CSV", exact: true })
    .click();
  const result = await download;
  expect(result.suggestedFilename()).toBe("atlas-scope.csv");
  await page.getByRole("button", { name: "Reset scope", exact: true }).click();
  await page
    .getByLabel("Brands (none selected = all)")
    .selectOption(["tarptent"]);
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "3 variants in scope",
  );
  await expect(page.locator("tbody")).toContainText("Not verified");
  await expect(page.locator(".stats-panel .stat-value")).toHaveText(
    "Not verified",
  );
  await page.getByLabel("Maximum USD").fill("1");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "0 variants in scope",
  );
  await expect(
    page.getByText("No matching records.", { exact: false }),
  ).toBeVisible();
});
test("URL restoration, reload, back and forward, invalid notice", async ({
  page,
}) => {
  await page.goto(
    "/explore/?dataset=2026-10-13-v1&brands=naturehike&weight=packed_weight_g",
  );
  await expect(page.getByLabel("Weight definition")).toHaveValue(
    "packed_weight_g",
  );
  await page.getByLabel("Price type", { exact: true }).selectOption("sale");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "1 variants in scope",
  );
  await page.reload();
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "1 variants in scope",
  );
  await page.getByRole("button", { name: "Reset scope", exact: true }).click();
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "30 variants in scope",
  );
  await page.goBack();
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "1 variants in scope",
  );
  await page.goForward();
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "30 variants in scope",
  );
  await page.goto("/explore/?weight=NaN&brands=unknown");
  await expect(page.locator("main")).toContainText(
    "Some unrecognized or invalid URL values were reset",
  );
});
test("linked chart and keyboard selection, source focus return, no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/explore/?cohort=" + encodeURIComponent(cohort));
  await page.getByRole("button", { name: "Load linked scatterplot" }).click();
  await expect(page.locator(".chart svg")).toBeVisible();
  await page.locator('.chart svg path[fill="#157a80"]').first().click();
  await expect(page.locator("tbody tr.selected")).toHaveCount(1);
  await page.getByRole("button",{name:"Clear selection",exact:true}).click();
  await page.getByLabel("Select nh-cloud-up-20d", { exact: true }).check();
  await expect(page.locator("tbody tr.selected")).toHaveCount(1);
  await expect(page.locator(".stats-panel")).toContainText(
    "Selection: 1 records",
  );
  const trigger = page
    .locator("tbody tr.selected")
    .getByRole("button", { name: "Inspect source" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText(
    "nh-cloud-up-20d-source",
  );
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement?.closest('[role="dialog"]'),
    ),
  ).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});
test("2–4 product comparison, reorder, remove, saved IDs, mixed-cohort warning", async ({
  page,
}) => {
  await page.goto("/compare/?compare=" + pair);
  await expect(page.locator(".comparison-table")).toContainText("1,380 g");
  await expect(page.locator(".comparison-table")).toContainText("1,530 g");
  await page
    .getByRole("button", {
      name: "Move nh-cloud-up-pro-standard left",
      exact: true,
    })
    .click();
  expect(new URL(page.url()).searchParams.get("compare")).toBe(
    "nh-cloud-up-pro-standard,nh-cloud-up-20d",
  );
  await page.reload();
  await expect(page.locator(".comparison-table thead th").nth(1)).toContainText(
    "Cloud Up Pro 2",
  );
  await page
    .getByLabel("Add a product (2–4 for comparison)")
    .selectOption("tarptent-dipole-2-dw");
  await expect(page.getByRole("status")).toContainText(
    "Mixed or incomplete cohorts",
  );
  await page
    .getByLabel("Add a product (2–4 for comparison)")
    .selectOption("ba-blacktail-2");
  await expect(
    page.getByLabel("Add a product (2–4 for comparison)"),
  ).toBeDisabled();
  await page
    .getByRole("button", {
      name: "Remove ba-blacktail-2 from comparison",
      exact: true,
    })
    .click();
  await page.goto("/compare/");
  await expect(page.locator(".comparison-table thead th")).toHaveCount(4);
  await page.getByRole("button", { name: "Reset comparison" }).click();
  await expect(page.getByText("Pin at least two variants.")).toBeVisible();
});
test("real-data dossiers and meaningful evidence gates", async ({ page }) => {
  for (const route of [
    "/insights/",
    "/strategy/",
    "/demand/",
    "/methodology/",
    "/about/",
    "/products/tarptent-dipole-2-dw/",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
  await expect(page.locator(".dossier-grid")).toContainText("Not verified");
  await page.goto("/demand/");
  await expect(page.locator("main")).toContainText(
    "No real export has been imported",
  );
  await expect(page.locator("main")).not.toContainText("Seasonal peak");
  await page.goto("/methodology/");
  await page.getByLabel("Search sources", { exact: true }).fill("Cloud Up Pro");
  await expect(page.locator(".source-list article")).toHaveCount(1);
});
test("accessibility on every route and open source drawer", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/explore/",
    "/compare/?compare=" + pair,
    "/insights/",
    "/demand/",
    "/strategy/",
    "/methodology/",
    "/about/",
    "/products/nh-cloud-up-20d/",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const r = await new AxeBuilder({ page }).analyze();
    expect(
      r.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact || ""),
      ),
      route,
    ).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Inspect source", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const r = await new AxeBuilder({ page }).analyze();
  expect(
    r.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact || ""),
    ),
  ).toEqual([]);
});
test("all thirty exported dossier routes resolve", async ({
  page,
  browserName,
}) => {
  if (browserName === "chromium")
    await mkdir("../outputs/public/web/screenshots/dossiers", {
      recursive: true,
    });
  for (const p of products) {
    const response = await page.goto("/products/" + p.product_id + "/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(p.product_name);
    if (browserName === "chromium") {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `../outputs/public/web/screenshots/dossiers/${p.product_id}.png`,
        fullPage: true,
      });
    }
  }
});
test("responsive screenshots, reduced motion and 200% layout", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Representative responsive review in Chromium; core flows checked on all engines.",
  );
  await mkdir("../outputs/public/web/screenshots", { recursive: true });
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of [
      ["home", "/"],
      ["explore", "/explore/"],
      ["compare", "/compare/?compare=" + pair],
      ["insights", "/insights/"],
      ["demand", "/demand/"],
      ["strategy", "/strategy/"],
      ["methodology", "/methodology/"],
      ["about", "/about/"],
      ["product", "/products/nh-cloud-up-20d/"],
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}`,
      ).toBeTruthy();
      await page.screenshot({
        path: `../outputs/public/web/screenshots/${name}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/explore/?cohort=" + encodeURIComponent(cohort));
  await page.getByRole("button", { name: "Load linked scatterplot" }).click();
  await page.getByLabel("Select nh-cloud-up-20d", { exact: true }).check();
  await page.screenshot({
    path: "../outputs/public/web/screenshots/explore-selected.png",
    fullPage: true,
  });
  await page
    .locator("tbody tr.selected")
    .getByRole("button", { name: "Inspect source" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: "../outputs/public/web/screenshots/evidence-drawer.png",
  });
  await page.keyboard.press("Escape");
  await page.getByLabel("Maximum USD").fill("1");
  await page.screenshot({
    path: "../outputs/public/web/screenshots/explore-empty.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "../outputs/public/web/screenshots/home-200-percent.png",
    fullPage: true,
  });
});
test("touch controls at 390px retain correct scope", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8510/explore/?brands=naturehike");
  await expect(page.getByTestId("filtered-count")).toHaveText(
    "3 variants in scope",
  );
  await page.getByRole("button", { name: "Product cards", exact: true }).tap();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page
    .locator(".product-card")
    .first()
    .getByRole("button", { name: "+ Compare", exact: true })
    .tap();
  await expect(page.locator(".compare-tray")).toContainText("1/4 pinned");
  await context.close();
});
