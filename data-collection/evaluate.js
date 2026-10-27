const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GUIDELINES = path.join(ROOT, "ASHVIK", "data", "guidelines");
const OUT = path.join(ROOT, "ASHVIK", "evidence", "eval", "eval-report.md");

const required = [
  { key: "title", test: /^#\s+\S/m, label: "Title" },
  { key: "source", test: /Source:/i, label: "Source cited" },
  { key: "verified", test: /Last verified:/i, label: "Verified date" },
  { key: "status", test: /Status:[\s*]*(Draft|Cross-checked|Clinician-verified)/i, label: "Review status" },
  { key: "diagnosis", test: /##\s*\d*\.?\s*Diagnosis/i, label: "Diagnosis section" },
  { key: "treatment", test: /##\s*\d*\.?\s*Treatment/i, label: "Treatment section" },
  { key: "dose", test: /\bmg\b|\bmg\/kg\b|\bmL\b/i, label: "Dose stated" },
  { key: "brand", test: /Brand example|Brand names/i, label: "Brand labelling" },
  { key: "interactions", test: /Drug interactions|interactions and cautions/i, label: "Interactions" },
  { key: "redflags", test: /Red flags|refer immediately/i, label: "Red flags" },
  { key: "disclaimer", test: /Disclaimer/i, label: "Disclaimer" },
  { key: "evidence", test: /evidence\//i, label: "Evidence link" },
];

function evaluate(file) {
  const text = fs.readFileSync(file, "utf8");
  const results = required.map(r => ({ ...r, pass: r.test.test(text) }));
  const passed = results.filter(r => r.pass).length;
  const score = Math.round((passed / results.length) * 100);
  const words = text.split(/\s+/).filter(Boolean).length;
  const brands = (text.match(/Brand example/gi) || []).length;
  const doses = (text.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|mL|mg\/kg)\b/gi) || []).length;
  return { file: path.basename(file), score, passed, total: results.length, words, brands, doses, results };
}

const files = fs.readdirSync(GUIDELINES).filter(f => f.endsWith(".md") && f !== "index.md").sort();
const rows = files.map(f => evaluate(path.join(GUIDELINES, f)));

let md = `# Data Evaluation Report\n\n`;
md += `Generated: ${new Date().toISOString().slice(0,10)}\n\n`;
md += `Scope: ${rows.length} guideline files in \`ASHVIK/data/guidelines/\`.\n\n`;
md += `> Automated structural check only. A clinician must still verify clinical accuracy.\n\n`;
md += `## Summary\n\n`;
md += `| File | Score | Checks | Words | Dose mentions | Brand sections |\n|---|---|---|---|---|---|\n`;
rows.forEach(r => {
  md += `| ${r.file} | ${r.score}% | ${r.passed}/${r.total} | ${r.words} | ${r.doses} | ${r.brands} |\n`;
});
md += `\n## Failed checks\n\n`;
let anyFail = false;
rows.forEach(r => {
  const fails = r.results.filter(x => !x.pass);
  if (fails.length) {
    anyFail = true;
    md += `### ${r.file}\n\n`;
    fails.forEach(f => { md += `- ❌ ${f.label}\n`; });
    md += `\n`;
  }
});
if (!anyFail) md += `All structural checks passed.\n`;

md += `\n## Required checks\n\n`;
required.forEach(r => { md += `- ${r.label}\n`; });

md += `\n## Manual review status\n\n`;
md += `| File | Status | Reviewer | Date |\n|---|---|---|---|\n`;
rows.forEach(r => { md += `| ${r.file} | Draft | — | — |\n`; });

md += `\n## Notes\n\n`;
md += `- Automated checks cannot confirm medical correctness, brand availability, or local resistance patterns.\n`;
md += `- Every file must be reviewed against \`evidence/sources.md\` and signed off in \`evidence/eval/verification-log.md\`.\n`;

fs.writeFileSync(OUT, md);
console.log(`Evaluated ${rows.length} files.`);
rows.forEach(r => console.log(`${r.file}: ${r.score}% (${r.passed}/${r.total})`));
console.log(`Report: ${OUT}`);
