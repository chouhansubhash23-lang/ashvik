# Evidence Folder

This folder stores the source material and verification trail for the ASHVIK clinical knowledge base.

## Structure

```
evidence/
├── raw/                      # Original downloaded sources (PDF + extracted text)
│   ├── icmr_stw_vol3_2022.pdf
│   ├── icmr_stw_vol3_2022.txt
│   ├── icmr_stw_vol4_2024.pdf
│   └── icmr_stw_vol4_2024.txt
├── eval/
│   ├── data-quality-checklist.md
│   └── verification-log.md
├── sources.md                # Source URLs, retrieval dates, scope
└── README.md
```

## Rules

1. Every clinical claim in `../data/guidelines/*.md` must point to a source in `sources.md`.
2. Each data point gets a confidence label: **High / Medium / Low**.
3. Drug doses and interactions must be cross-checked against at least one national guideline.
4. Brand names are illustrative examples only — not promotional, and not a substitute for the generic name.
5. Any change to a guideline file must add a row to `eval/verification-log.md`.
6. **This is decision-support content, not a prescription. A qualified doctor must verify every dose before use.**
