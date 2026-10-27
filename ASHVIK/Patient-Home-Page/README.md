# Patient Home Page

A single-file web app for managing patient details and their **clinical** and **diagnostic** history.

## Features
- Patient list with search (left sidebar)
- Add / Edit / Delete patients (Name, Age, Sex, DOB, Phone, Address, Blood Group, Allergies, Chronic conditions, Notes)
- Tabs: **Clinical History**, **Diagnostic History**, **Vitals / Notes**
- Add / delete history entries
- Data stored in browser `localStorage` (no backend required)

## How to use
1. Open `index.html` in any modern browser (Chrome/Edge/Firefox).
2. Click **+ Add Patient** to create a record.
3. Select a patient → use the tabs to view/add clinical and diagnostic history.

## Files
- `index.html` — the complete app (HTML + CSS + JS)
- `README.md` — this file

## Notes
- Data is saved per-browser in `localStorage`. Clearing browser data will erase records.
- For multi-user/clinic use, connect to a backend database.
