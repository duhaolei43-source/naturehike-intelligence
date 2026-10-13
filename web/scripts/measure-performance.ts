import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const browser = await chromium.launch();
const output = [];
for (const route of ["/", "/explore/"]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(`
    window.atlasPerformance={lcp:0,cls:0};
    new PerformanceObserver(list=>{for(const e of list.getEntries())window.atlasPerformance.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.atlasPerformance.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  `);
  await page.goto("http://127.0.0.1:8510" + route);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const stats = await page.evaluate(() => ({
    ...(window as unknown as { atlasPerformance: { lcp: number; cls: number } })
      .atlasPerformance,
    js: performance
      .getEntriesByType("resource")
      .map((e) => e as PerformanceResourceTiming)
      .filter((e) => new URL(e.name).pathname.endsWith(".js"))
      .map((e) => new URL(e.name).pathname),
  }));
  let compressed = 0;
  for (const path of new Set(stats.js))
    compressed += gzipSync(readFileSync("out" + path)).length;
  output.push({
    route,
    viewport: "390x844",
    cold_context: true,
    network: "Local loopback, unthrottled; no deployed-network claim",
    lcp_ms: stats.lcp,
    cls: stats.cls,
    initial_js_gzip_bytes: compressed,
    js_files: stats.js,
  });
  await context.close();
}
await browser.close();
await mkdir("../outputs/public/web", { recursive: true });
await writeFile(
  "../outputs/public/web/performance.json",
  JSON.stringify(
    {
      setup:
        "Node24.21.0 / Playwright Chromium / macOS / charts not loaded initially",
      measurements: output,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  output.map(({ route, lcp_ms, cls, initial_js_gzip_bytes }) => ({
    route,
    lcp_ms,
    cls,
    initial_js_gzip_bytes,
  })),
);
