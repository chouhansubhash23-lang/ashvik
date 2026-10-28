const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GUIDELINES = path.join(ROOT, "ASHVIK", "data", "guidelines");
const INDEX = path.join(GUIDELINES, "index.md");
const EVIDENCE = path.join(ROOT, "ASHVIK", "evidence");
const OUT_MD = path.join(ROOT, "ASHVIK", "data", "DATA-RECORD.md");
const OUT_JSON = path.join(ROOT, "ASHVIK", "data", "guidelines-manifest.json");
const OUT_CSV = path.join(ROOT, "ASHVIK", "data", "guidelines-manifest.csv");

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
  const num = Number(m[1]);
  const title = m[2].trim();
  const file = path.join(GUIDELINES, m[4].trim());
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  const words = text.split(/\s+/).filter(Boolean).length;
  const doses = (text.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|mL|mmol|IU)\b/gi) || []).length;
  const status = (text.match(/Status:[\s*]*(Draft|Cross-checked|Clinician-verified)/i) || [])[1] || "Draft";
  rows.push({ number: num, title, file: m[4].trim(), category: categoryOf(num), source: m[5].trim(), status, words, doses });
}
rows.sort((a, b) => a.number - b.number);

let commit = "unknown";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

const catCounts = {};
rows.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });

const totalWords = rows.reduce((s, r) => s + r.words, 0);
const totalDoses = rows.reduce((s, r) => s + r.doses, 0);
const rawFiles = fs.readdirSync(path.join(EVIDENCE, "raw")).filter(f => !f.endsWith(".pdf"));
const evalReport = fs.readFileSync(path.join(EVIDENCE, "eval", "eval-report.md"), "utf8");
const evalScores = [...evalReport.matchAll(/\| (\d+)% \|/g)].map(m => Number(m[1]));
const all100 = evalScores.length > 0 && evalScores.every(s => s === 100);

let md = `# ASHVIK Clinical Data Record\n\n`;
md += `**Generated:** ${new Date().toISOString().slice(0, 10)}\n`;
md += `**Guidelines:** ${rows.length}\n`;
md += `**Total words:** ${totalWords.toLocaleString()}\n`;
md += `**Dose mentions:** ${totalDoses}\n`;
md += `**Git commit:** \`${commit}\`\n`;
md += `**Evaluation:** ${evalScores.length}/${rows.length} files checked; ${all100 ? "**100% structural pass**" : "see eval report"}\n\n`;
md += `> Structural evaluation only. Clinical accuracy still requires clinician sign-off.\n\n`;

md += `## Category breakdown\n\n| Category | Files |\n|---|---|\n`;
Object.entries(catCounts).forEach(([c, n]) => { md += `| ${c} | ${n} |\n`; });

md += `\n## Full index\n\n| # | Condition / topic | File | Category | Status | Words |\n|---|---|---|---|---|---|\n`;
rows.forEach(r => {
  md += `| ${r.number} | ${r.title} | [${r.file}](guidelines/${r.file}) | ${r.category} | ${r.status} | ${r.words} |\n`;
});

md += `\n## Evidence inventory\n\n`;
md += `- Extracted source text: ${rawFiles.length} file(s) in \`evidence/raw/\`\n`;
md += `- Source catalogue: \`evidence/sources.md\`\n`;
md += `- Quality checklist: \`evidence/eval/data-quality-checklist.md\`\n`;
md += `- Verification log: \`evidence/eval/verification-log.md\`\n`;
md += `- Evaluation report: \`evidence/eval/eval-report.md\`\n`;
md += `- Raw PDFs are kept locally and excluded from Git (size).\n`;

md += `\n## Machine-readable files\n\n`;
md += `- \`guidelines-manifest.json\`\n- \`guidelines-manifest.csv\`\n`;

fs.writeFileSync(OUT_MD, md);
fs.writeFileSync(OUT_JSON, JSON.stringify({
  generatedAt: new Date().toISOString(),
  commit,
  total: rows.length,
  totalWords,
  totalDoses,
  evaluation: { checked: evalScores.length, all100 },
  categories: catCounts,
  guidelines: rows,
}, null, 2));

const esc = v => `"${String(v).replace(/"/g, '""')}"`;
const csv = ["number,title,file,category,source,status,words,doses"]
  .concat(rows.map(r => [r.number, r.title, r.file, r.category, r.source, r.status, r.words, r.doses].map(esc).join(",")))
  .join("\n");
fs.writeFileSync(OUT_CSV, csv);

console.log(`Recorded ${rows.length} guidelines.`);
console.log(`Commit: ${commit}`);
console.log(`Outputs: ${OUT_MD}, ${OUT_JSON}, ${OUT_CSV}`);
