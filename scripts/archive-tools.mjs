import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT_FOLDER_ID = "1FhNROp7NnH20aEduSDkI_hW_SmL3f7Ps";

const memberRules = [
  ["Sangyeon", /(상연|sangyeon)/iu],
  ["Jacob", /(제이콥|jacob)/iu],
  ["Younghoon", /(영훈|younghoon)/iu],
  ["Hyunjae", /(현재|hyunjae)/iu],
  ["Juyeon", /(주연|juyeon)/iu],
  ["Kevin", /(케빈|kevin)/iu],
  ["Q", /(창민|큐|changmin|\bq\b)/iu],
  ["Sunwoo", /(선우|sunwoo)/iu],
  ["Eric", /(에릭|eric)/iu],
];

const stageNames = {
  SANGYEON: "Sangyeon",
  JACOB: "Jacob",
  YOUNGHOON: "Younghoon",
  HYUNJAE: "Hyunjae",
  JUYEON: "Juyeon",
  KEVIN: "Kevin",
  CHANGMIN: "Q",
  SUNWOO: "Sunwoo",
  ERIC: "Eric",
  CHANHEE: "New (2017 - 2026)",
  NEW: "New (2017 - 2026)",
};

const folderKey = (parts) => parts.join("\u001f");

function dateCode(value, fallback = "") {
  const match = String(value).match(/(?:^|\s)(\d{6})(?:\D|$)/);
  if (match) return Number(`20${match[1]}`);
  const time = Date.parse(fallback);
  if (!Number.isNaN(time)) {
    const d = new Date(time);
    return Number(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`);
  }
  return 0;
}

function monthNumber(value) {
  const korean = String(value).match(/\((\d{1,2})월\)/u);
  if (korean) return Number(korean[1]);
  const english = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const upper = String(value).toUpperCase();
  const found = english.findIndex((name) => upper.includes(name));
  return found >= 0 ? found + 1 : Number(String(value).match(/^\s*(\d{1,2})/)?.[1] || 0);
}

function compactMedia(node) {
  const kind = node.mimeType.startsWith("image/") ? "image" : node.mimeType.startsWith("audio/") ? "audio" : node.mimeType.startsWith("video/") ? "video" : "other";
  return { id: node.id, kind, mimeType: node.mimeType, date: dateCode(node.name, node.modifiedTime) };
}

export function normalizeArchive(raw) {
  const folders = new Map(raw.nodes.filter((node) => node.type === "folder").map((node) => [folderKey([...node.path, node.name]), node]));
  const filesByParent = new Map();
  for (const node of raw.nodes.filter((item) => item.type !== "folder")) {
    const key = folderKey(node.path);
    const list = filesByParent.get(key) || [];
    list.push(node);
    filesByParent.set(key, list);
  }

  const groupGalleries = [];
  for (const [key, folder] of folders) {
    if (folder.path.length !== 3 || !folder.path[1]?.startsWith("GROUP CONTENT MEDIA")) continue;
    const media = (filesByParent.get(key) || []).map(compactMedia).filter((item) => item.kind !== "other");
    const date = dateCode(folder.name, folder.modifiedTime);
    groupGalleries.push({
      id: folder.id,
      name: folder.name,
      date,
      year: Number(String(date).slice(0, 4)) || Number(folder.path[2]),
      members: memberRules.filter(([, rule]) => rule.test(folder.name)).map(([name]) => name),
      media,
    });
  }

  const membersMap = new Map();
  for (const [key, folder] of folders) {
    if (folder.path.length !== 4 || !folder.path[1]?.startsWith("MEMBERS MEDIA")) continue;
    const rawMember = folder.path[2].replace(/^\d+\.\s*/, "").toUpperCase();
    const name = stageNames[rawMember] || rawMember;
    const year = Number(folder.path[3]);
    const month = monthNumber(folder.name);
    const media = (filesByParent.get(key) || []).map(compactMedia).filter((item) => item.kind !== "other").sort((a, b) => b.date - a.date);
    const entry = membersMap.get(name) || { id: folders.get(folderKey(folder.path.slice(0, 3)))?.id || "", name, media: [] };
    entry.media.push(...media.map((item) => ({ ...item, year, month })));
    membersMap.set(name, entry);
  }

  const memberOrder = ["Sangyeon", "Jacob", "Younghoon", "Hyunjae", "Juyeon", "Kevin", "Q", "Sunwoo", "Eric", "New (2017 - 2026)"];
  return {
    generatedAt: raw.generatedAt,
    sourceFolderId: ROOT_FOLDER_ID,
    groupGalleries: groupGalleries.sort((a, b) => b.date - a.date),
    members: [...membersMap.values()].sort((a, b) => memberOrder.indexOf(a.name) - memberOrder.indexOf(b.name)),
  };
}

export async function writeNormalized(raw, outputFile) {
  const target = outputFile instanceof URL ? fileURLToPath(outputFile) : outputFile;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(normalizeArchive(raw))}\n`, "utf8");
}
