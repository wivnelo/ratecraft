import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://ratecraft.test/", {
      headers: { accept: "text/html", host: "ratecraft.test" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the RateCraft product page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /RateCraft/);
  assert.match(html, /Freelance Quote Calculator/);
  assert.match(html, /Price freelance work with margin/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
});

test("keeps starter assets removed and product source complete", async () => {
  const [page, layout, packageJson, previewFiles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../app/_sites-preview/", import.meta.url)).catch(() => []),
  ]);

  assert.deepEqual(previewFiles, []);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|Your site is taking shape/);

  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /Risk buffer/);
  assert.match(page, /Profit margin/);
  assert.match(page, /Proposal copy/);
  await access(new URL("public/og.png", projectRoot));
});
