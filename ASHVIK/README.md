# ASHVIK - Clinical Consultation & Diagnosis

Unified React-based medical software (single file, no build step).

## Features
- Dashboard with stats and recent consultations
- Patients: add/edit/delete/search, start consultation
- New Consultation: patient, vitals (incl. sugar), symptoms, diagnosis templates, Rx table, advice, tests, follow-up, referral, print Rx
- Diagnosis Assistant: symptoms → differential diagnosis, red flags, doctor impression, save note
- History & Rx: consultations, clinical notes, test reports, vitals trend charts
- Test Reports: add/view/delete with file upload
- Settings: language toggle (English/Hindi/Bangla), backup/restore JSON, PWA install
- Medical terms (Disease, Sugar, BP, Rx) stay in English; UI text in selected language

## How to use
1. Open `index.html` in a modern browser (internet needed first load for React CDN).
2. Add patients, create consultations, print Rx.
3. Use Settings to backup/restore data.

## PWA / Offline
- manifest.json + sw.js included. Use browser "Install" / "Add to Home Screen".

## Data
- **Primary store: Firebase Firestore** (`users/ashvik-local/patients`), project `ashvik-medical`.
- **Offline:** Firestore persistent cache (IndexedDB) — reads/writes work offline and sync when back online.
- **Fallback cache:** browser localStorage (`medidesk_patients_v1`).
- Export JSON from Settings for manual backup.

> Security note: Firestore rules are temporarily open (`if true`) while Firebase Auth is being configured. Add auth-based rules before public use.
