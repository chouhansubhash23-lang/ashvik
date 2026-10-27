---
name: GitHub
description: Git and GitHub workflows for this project - auth status, commits, branches, remotes, push, pull requests, releases, and issues using git and the GitHub CLI (gh).
---

# GitHub Workflow

Use this skill for any Git/GitHub task in this project.

## Environment

- Repo root: `D:\DOCTOR`
- Remote: `https://github.com/subhashchouhan23/ashvik.git` (branch `main`)
- GitHub CLI: portable install at `%LOCALAPPDATA%\gh_cli\bin\gh.exe`
- Add it to PATH before use:

```powershell
$env:PATH = "$env:LOCALAPPDATA\gh_cli\bin;$env:PATH"
```

## Auth

```powershell
gh auth status
```

If not logged in:

```powershell
gh auth login --hostname github.com --git-protocol https --web
```

This prints a one-time code and opens `https://github.com/login/device`.
Ask the user to authorize. Never ask for or store a password/PAT in the repo.

## Daily flow

1. Inspect before changing:
   ```powershell
   git status --short
   git log --oneline -5
   ```
2. Stage and commit:
   ```powershell
   git add -A
   git commit -m "type: short description"
   ```
3. Push:
   ```powershell
   git push -u origin main
   ```

## Create the repo (first time)

```powershell
gh repo create ashvik --public --source=. --remote=origin --push
```

If the remote already exists, use:

```powershell
git remote set-url origin https://github.com/subhashchouhan23/ashvik.git
git push -u origin main
```

## Pull requests

```powershell
git checkout -b feature/<name>
git push -u origin feature/<name>
gh pr create --fill --base main
```

## Issues / releases

```powershell
gh issue list
gh issue create --title "<title>" --body "<body>"
gh release create v1.0.0 --generate-notes
```

## Safety rules

- Never commit secrets: `.env`, tokens, service-account keys, patient data exports.
- Never `git push --force` on `main` without explicit user approval.
- Review `git diff` before committing.
- Keep Firebase config (public web config) out of commits only if the user asks; the Firebase web API key is not a secret.
- Medical data must never be committed. `ASHVIK` stores data in Firestore/localStorage, not in the repo.
