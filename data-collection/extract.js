const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const ROOT = __dirname;
const RAW = path.join(ROOT, "raw");
fs.mkdirSync(RAW, { recursive: true });

async function download(url, out) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 ASHVIK-data-collector" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  return buf;
}

async function processPdf(name, url) {
  const pdfPath = path.join(RAW, name + ".pdf");
  const txtPath = path.join(RAW, name + ".txt");
  if (!fs.existsSync(pdfPath)) {
    console.log("Downloading", url);
    await download(url, pdfPath);
  }
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  const data = await parser.getText();
  fs.writeFileSync(txtPath, data.text);
  console.log(`${name}: ${data.pages ? data.pages.length : "?"} pages, ${data.text.length} chars`);
}

(async () => {
  const sources = [
    ["icmr_stw_vol4_2024", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1733131852_stw_vol_4_2024.pdf"],
    ["icmr_stw_vol3_2022", "https://www.icmr.gov.in/icmrobject/custom_data/pdf/downloadable-books/STW_Vol_3_2022.pdf"],
  ];
  for (const [name, url] of sources) {
    try { await processPdf(name, url); } catch (e) { console.error(name, e.message); }
  }
})();
