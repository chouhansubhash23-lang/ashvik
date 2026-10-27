# Diagnosis Assistant

Frontend that takes patient symptoms, history and test reports, asks the doctor's suspected diagnosis, and generates a differential diagnosis with red flags, recommended tests and advice.

## Features
- Patient selector with auto-loaded vitals, symptoms, history, reports
- Symptom chips + free-text notes
- Doctor's suspected diagnosis input with quick picks
- Rule-based differential diagnosis (top 5) with match score
- Red flag alerts based on symptoms/vitals
- Recommended tests list
- Save result to patient clinical history
- Test Reports: add/view/delete with optional file upload (stored locally)
- Patient history view
- Shares patient data with ASHVIK (same localStorage)

## How to use
1. Open `index.html` in a browser.
2. Select a patient (add patients via ASHVIK first, or seed data).
3. Tick symptoms, enter notes, vitals.
4. Enter your suspected diagnosis.
5. Click **Generate Diagnosis**.
6. Save result or copy diagnosis to ASHVIK.

## Disclaimer
Decision-support only. Final diagnosis is the doctor's responsibility.
