// Generates the machine-readable lab reference record from the single-file app.
// The app embeds the same table so OCR flags and diagnosis work offline.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const appPath = path.join(root, "ASHVIK", "index.html");
const outJson = path.join(root, "ASHVIK", "data", "lab-reference.json");
const outMd = path.join(root, "ASHVIK", "data", "LAB-REFERENCE.md");

const html = fs.readFileSync(appPath, "utf8");
const match = html.match(/const LAB_TESTS = (\[[\s\S]*?\n\]);/);
if (!match) throw new Error("LAB_TESTS table not found in index.html");
const qualMatch = html.match(/const QUAL_TESTS = (\[[\s\S]*?\n\]);/);
if (!qualMatch) throw new Error("QUAL_TESTS table not found in index.html");

const tests = vm.runInNewContext(match[1], {});
const qualTests = vm.runInNewContext(qualMatch[1], {});
const categories = [];
for (const t of tests) {
  if (!categories.includes(t.category)) categories.push(t.category);
}
for (const c of ["Serology", "Urine", "Stool"]) {
  if (!categories.includes(c)) categories.push(c);
}

function qualCategory(name) {
  if (/^Urine/.test(name)) return "Urine";
  if (/^Stool/.test(name)) return "Stool";
  if (/Dengue|Malaria|Typhoid|HBsAg|HCV|HIV|VDRL/i.test(name)) return "Serology";
  return "Other";
}

const qualitative = qualTests.map(t => ({
  name: t.name,
  aliases: t.aliases,
  category: qualCategory(t.name),
  expected: /VDRL|HBsAg|HCV|HIV|Dengue|Malaria|Typhoid/i.test(t.name) ? "Non-reactive / negative" : "Negative",
  note: /Nitrite|Leukocyte Esterase/i.test(t.name) ? "Positive supports UTI; correlate with urine WBC/pus cells and symptoms" : ""
}));

const widal = [
  { name: "Widal Typhi O", cutoff: ">=1:200 positive; 1:125-199 borderline; <=1:100 negative", note: "Report cut-off used; repeat/confirm if borderline" },
  { name: "Widal Typhi H", cutoff: ">=1:200 supportive; 1:125-199 borderline", note: "Supportive; clinical correlation needed" },
  { name: "Widal Para A H", cutoff: ">=1:200 positive range", note: "Paratyphoid A" },
  { name: "Widal Para B H", cutoff: ">=1:200 positive range", note: "Paratyphoid B" }
];

const clean = tests.map(t => ({
  name: t.name,
  aliases: t.aliases,
  unit: t.unit || "",
  category: t.category,
  low: t.low ?? null,
  high: t.high ?? null,
  maleLow: t.maleLow ?? null,
  maleHigh: t.maleHigh ?? null,
  femaleLow: t.femaleLow ?? null,
  femaleHigh: t.femaleHigh ?? null,
  note: t.note || ""
}));

const record = {
  title: "ASHVIK basic pathology reference library",
  version: 1,
  collected: "2026-10-29",
  quantitativeCount: clean.length,
  qualitativeCount: qualitative.length,
  widalTitreCount: widal.length,
  testCount: clean.length + qualitative.length + widal.length,
  source: {
    primary: "Typical adult reference intervals used by Indian NABL-accredited laboratories; cross-checked with Focus Diagnostics' Normal Lab Values & Reference Ranges (January 2025).",
    supporting: [
      "ADA diabetes diagnostic cut-offs (fasting, post-load and HbA1c).",
      "WHO/ICMR-style adult haemoglobin and nutritional anaemia cut-offs.",
      "Standard clinical cut-offs for serology, coagulation, cardiac and urine routine tests."
    ],
    url: "https://focusdiagnostics.in/normal-lab-values"
  },
  caveat: "Reference intervals are method- and population-dependent. Paediatric, pregnancy, critical-care and some analyser-specific ranges differ. Always use the interval printed on the patient's own report; the doctor remains the final approver.",
  categories,
  tests: clean,
  qualitative,
  widal
};

fs.writeFileSync(outJson, JSON.stringify(record, null, 2) + "\n", "utf8");

function rangeText(t, sex) {
  const low = sex === "Female" && t.femaleLow != null ? t.femaleLow : t.maleLow != null ? t.maleLow : t.low;
  const high = sex === "Female" && t.femaleHigh != null ? t.femaleHigh : t.maleHigh != null ? t.maleHigh : t.high;
  if (low === 0 && high != null) return `< ${high}`;
  if (low != null && high == null) return `> ${low}`;
  if (low != null && high != null) return `${low}–${high}`;
  return "—";
}

function refCell(t) {
  const hasSex = t.maleLow != null || t.maleHigh != null || t.femaleLow != null || t.femaleHigh != null;
  if (!hasSex) return rangeText(t, "");
  return `M ${rangeText(t, "Male")}; F ${rangeText(t, "Female")}`;
}

const lines = [];
lines.push("# ASHVIK — Basic Lab Reference Library");
lines.push("");
lines.push(`Collected: **${record.collected}** · Report items: **${record.testCount}** (${record.quantitativeCount} quantitative + ${record.qualitativeCount} qualitative/serology + ${record.widalTitreCount} Widal titres) · Categories: **${record.categories.length}**`);
lines.push("");
lines.push("## Why this exists");
lines.push("");
lines.push("ASHVIK reads uploaded lab reports offline, extracts common values, flags them against a reference interval, and uses the values as additional evidence in differential diagnosis. This record documents the reference table embedded in the app.");
lines.push("");
lines.push("## Source and scope");
lines.push("");
lines.push(record.source.primary);
lines.push("");
lines.push("Supporting standards:");
lines.push("");
record.source.supporting.forEach(s => lines.push(`- ${s}`));
lines.push("");
lines.push(`Primary reference chart: ${record.source.url}`);
lines.push("");
lines.push(`> **Caveat:** ${record.caveat}`);
lines.push("");
lines.push("## Reference ranges");
for (const category of categories) {
  lines.push("");
  lines.push(`### ${category}`);
  lines.push("");
  lines.push("| Test | Unit | Adult reference | Notes |");
  lines.push("|---|---|---|---|");
  for (const t of clean.filter(x => x.category === category)) {
    lines.push(`| ${t.name} | ${t.unit || "—"} | ${refCell(t)} | ${t.note || ""} |`);
  }
}
lines.push("");
lines.push("## Qualitative and serology tests");
lines.push("");
lines.push("| Test | Expected | Notes |");
lines.push("|---|---|---|");
for (const t of qualitative) {
  lines.push(`| ${t.name} | ${t.expected} | ${t.note || ""} |`);
}
lines.push("");
lines.push("## Widal titres");
lines.push("");
lines.push("| Test | Cut-off used by the app | Notes |");
lines.push("|---|---|---|");
for (const t of widal) {
  lines.push(`| ${t.name} | ${t.cutoff} | ${t.note} |`);
}
lines.push("");
lines.push("## How the app uses it");
lines.push("");
lines.push("- OCR values are parsed from printed English reports; Widal titres are parsed separately.");
lines.push("- Each numeric value is flagged Low/High using the table above unless the report's own range is available.");
lines.push("- The latest value per test across reports is auto-loaded into Quick Differential and ASHVIK Doctor.");
lines.push("- Abnormal values become **Report-based findings**; the doctor must verify every OCR value and interpretation.");
lines.push("- Urine dipstick results (nitrite, leukocyte esterase, protein, blood, glucose) are used as supporting evidence, not as a standalone diagnosis.");
lines.push("");
lines.push("## Maintenance");
lines.push("");
lines.push("The app table is the source of truth. After editing `ASHVIK/index.html`, regenerate this record with:");
lines.push("");
lines.push("```bash");
lines.push("node data-collection/make-lab-reference.js");
lines.push("```");
lines.push("");

fs.writeFileSync(outMd, lines.join("\n"), "utf8");
console.log(`Wrote ${outJson}`);
console.log(`Wrote ${outMd}`);
console.log(`Items: ${record.testCount} (${clean.length} quantitative + ${qualitative.length} qualitative + ${widal.length} Widal); categories: ${categories.length}`);
