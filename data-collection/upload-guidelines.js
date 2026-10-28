const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GUIDELINES = path.join(ROOT, "ASHVIK", "data", "guidelines");
const INDEX = path.join(GUIDELINES, "index.md");
const PROJECT = "ashvik-medical";
const API_KEY = "AIzaSyALc8a7N6TrjTw-JlNzeGb0rtPaZ8XjEfg";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/guidelines`;

const categories = [
  { from: 1, to: 10, name: "General medicine & seasonal" },
  { from: 11, to: 15, name: "Skin, respiratory, GI, neuro, mental health" },
  { from: 16, to: 23, name: "Emergency, maternal, paediatric, neuro" },
  { from: 24, to: 32, name: "Skin, renal, COVID, STI, geriatric, palliative, eye/ENT" },
  { from: 33, to: 42, name: "Fever/rash, immunisation, poisoning, metabolic, women's health, oral, occupational" },
  { from: 43, to: 51, name: "Geriatric emergencies, pain, stewardship, palliative" },
  { from: 52, to: 61, name: "Surgical & emergency referral" },
  { from: 62, to: 71, name: "Procedures & skills" },
  { from: 72, to: 81, name: "Diagnostics & monitoring" },
  { from: 82, to: 91, name: "System, quality & documentation" },
  { from: 92, to: 101, name: "Paediatric, maternal & infectious disease" },
  { from: 102, to: 111, name: "Paediatric core" },
  { from: 112, to: 121, name: "Paediatric specialty" },
  { from: 122, to: 131, name: "Geriatric care" },
  { from: 132, to: 141, name: "Pain & screening" },
  { from: 142, to: 151, name: "Lifestyle & metabolic" },
  { from: 152, to: 161, name: "Critical care" },
  { from: 162, to: 171, name: "Emergency & envenomation" },
  { from: 172, to: 181, name: "Maternal health" },
  { from: 182, to: 191, name: "Newborn care" },
  { from: 192, to: 201, name: "Public health & prevention" },
];
const categoryOf = (n) => (categories.find(c => n >= c.from && n <= c.to) || {}).name || "Other";

const indexText = fs.readFileSync(INDEX, "utf8");
const rows = [];
for (const line of indexText.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/);
  if (!m) continue;
  const file = path.join(GUIDELINES, m[4].trim());
  if (!fs.existsSync(file)) continue;
  rows.push({
    number: Number(m[1]),
    title: m[2].trim(),
    slug: m[4].trim().replace(/\.md$/, ""),
    file,
    source: m[5].trim(),
    status: (m[6] || "Draft").trim(),
  });
}
rows.sort((a, b) => a.number - b.number);

function fields(row) {
  const content = fs.readFileSync(row.file, "utf8");
  return {
    fields: {
      number: { integerValue: String(row.number) },
      title: { stringValue: row.title },
      slug: { stringValue: row.slug },
      category: { stringValue: categoryOf(row.number) },
      source: { stringValue: row.source },
      status: { stringValue: row.status },
      content: { stringValue: content },
      updatedAt: { timestampValue: new Date().toISOString() },
    },
  };
}

async function upload(row) {
  const url = `${BASE}/${encodeURIComponent(row.slug)}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields(row)),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${row.slug}: ${res.status} ${text.slice(0, 200)}`);
  }
}

(async () => {
  let ok = 0, fail = 0;
  const queue = [...rows];
  async function worker() {
    while (queue.length) {
      const row = queue.shift();
      try { await upload(row); ok++; console.log(`OK ${row.number} ${row.slug}`); }
      catch (e) { fail++; console.error(`FAIL ${e.message}`); }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  console.log(`\nUploaded ${ok}/${rows.length}, failed ${fail}`);
})();
