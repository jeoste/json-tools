# Electron desktop app (legacy)

This directory is the **legacy desktop packaging** of My Data Toolbox.
The primary product is the **web app** at the repository root (Vite + Vercel Python APIs).

## Status

- Kept for Windows releases via GitHub Actions (`release.yml`, `release-modern.yml`).
- Not deployed to Vercel (see root `.vercelignore`).
- Python business logic must live in root `lib/`; `src/*.py` are thin shims.

## When to touch

Only when shipping a desktop release. Prefer web fixes in the root `src/` React app.

## Local

```bash
cd electron
npm install
npm run electron:dev
```
