import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { normalizeArchive } from "../scripts/archive-tools.mjs";

test("builds a self-contained GitHub Pages site", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));
  const scriptName = assets.find((name) => name.endsWith(".js"));
  assert.ok(scriptName, "compiled JavaScript asset is missing");
  const script = await readFile(new URL(`../dist/assets/${scriptName}`, import.meta.url), "utf8");
  assert.match(html, /FROMM MEDIA Archive/);
  assert.match(html, /\.\/assets\//);
  assert.match(script, /GROUP MEDIA CONTENT/);
  assert.match(script, /MEMBERS MEDIA/);
  assert.match(script, /New \(2017 - 2026\)/);
  assert.doesNotMatch(html, /_next|_vinext/);
});

test("keeps New as the final member tile", async () => {
  const archive = JSON.parse(await readFile(new URL("../app/data/archive.generated.json", import.meta.url), "utf8"));
  const lastMember = archive.members.at(-1);
  assert.equal(lastMember.name, "New (2017 - 2026)");
  assert.ok(lastMember.media.length > 0);
});

test("future Drive syncs keep NEW/CHANHEE visible", () => {
  const archive = normalizeArchive({
    generatedAt: "2026-01-01T00:00:00.000Z",
    nodes: [
      { id: "new-folder", type: "folder", name: "10. NEW", path: ["FROMM MEDIA", "MEMBERS MEDIA"] },
      { id: "new-month", type: "folder", name: "01 (1월)", path: ["FROMM MEDIA", "MEMBERS MEDIA", "10. NEW", "2026"] },
      { id: "new-photo", type: "file", name: "260101.jpg", mimeType: "image/jpeg", path: ["FROMM MEDIA", "MEMBERS MEDIA", "10. NEW", "2026", "01 (1월)"] },
    ],
  });
  assert.equal(archive.members.at(-1)?.name, "New (2017 - 2026)");
  assert.equal(archive.members.at(-1)?.media.length, 1);
});
