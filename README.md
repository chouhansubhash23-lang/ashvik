# ASHVIK — Medical Software Project

Unified medical software for clinical consultation, diagnosis and prescription.
Single-file React frontend, no build step. Data stored in browser localStorage.

## Structure

```
D:\DOCTOR\
├── ASHVIK\                          # Main app (open index.html)
│   ├── index.html                   # Unified app (dashboard, patients, consult, diagnosis, history, reports, settings)
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker (offline)
│   ├── start.bat                    # Start local server + open browser
│   ├── README.md
│   ├── Medical-Software-Frontend\   # Legacy vanilla version
│   ├── Diagnosis-Assistant\         # Legacy vanilla diagnosis assistant
│   ├── Diagnosis-Assistant-React\   # React diagnosis assistant (subset)
│   └── Patient-Home-Page\           # Patient home page
├── IELTS Band Score Checklist.md
└── In many countries.docx
```

## How to run

- **Double-click** `ASHVIK\index.html` in Chrome/Edge (works for most; large file).
- If blank, run `ASHVIK\start.bat` or:
  ```
  cd D:\DOCTOR\ASHVIK
  node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{let f=path.join(process.cwd(),req.url.split('?')[0]);if(fs.statSync(f,{throwIfNoEntry:false})?.isDirectory())f+='index.html';fs.readFile(f,(e,d)=>{if(e){res.statusCode=404;res.end('not found');return;}const ext=path.extname(f);const m={'.html':'text/html','.json':'application/json','.js':'application/javascript'};res.setHeader('Content-Type',m[ext]||'text/plain');res.end(d);});}).listen(8765,()=>console.log('http://localhost:8765'));" 
  ```
  Then open http://localhost:8765

## Features (current)
- Dashboard, Patients CRUD, New Consultation + Rx print
- Diagnosis Assistant (symptoms → differential, red flags, doctor impression)
- History & Rx, Test Reports (file upload), Vitals trend charts
- Settings: language (EN/HI/BN), backup/restore JSON, PWA install
- Top navigation bar (left/right split), no-scroll dashboard

## Data
- localStorage key: `medidesk_patients_v1`
- Export JSON from Settings for backup

## Next phases (later)
- Prescription letterhead, drug/allergy alerts, ICD-10 suggest
- Appointment queue, billing
- Backend API + DB, auth, multi-user
- Deployment (HTTPS), offline sync, testing

Saved: 26 Oct 2026
