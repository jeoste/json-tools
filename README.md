# My Data Toolbox

> Web app to generate realistic JSON/XML test data, anonymize sensitive fields, validate and query JSON/XML, and work with Swagger/OpenAPI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.0%2B-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)

## Features

- Generate realistic data from JSON skeletons (Python + Faker)
- Random JSON / XML generators
- Optional Swagger/OpenAPI constraints during generation
- JSON anonymization (preserve structure)
- JSON validation and pretty-print
- JSONPath querying (client-side)
- XML validate / XPath (lxml) / generate from skeleton
- Convert JSON example → OpenAPI schema
- Build skeletons from OpenAPI schemas
- Dark/light themes, i18n (EN/FR/KO)

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite 6, Tailwind CSS, shadcn/ui, i18next, Lucide, JSONPath-Plus

**Backend:** Python 3.9+ Vercel serverless (`BaseHTTPRequestHandler`), shared modules in `lib/` (`faker`, `pyyaml`, `jsonschema`, `openapi-spec-validator`, `lxml`)

**Infra:** Vercel + GitHub Actions. Legacy Electron desktop app lives under `electron/` (see `electron/README.md`).

## Project Structure

```
my-data-toolbox/
├─ api/                     # Vercel Python functions
│  ├─ generate.py / anonymize.py / analyze.py
│  ├─ xml-validate.py / xml-path.py / generate-xml.py
│  └─ random-json.py / random-xml.py
├─ lib/                     # Canonical Python business logic + http_handler
├─ src/                     # React SPA (views are code-split)
├─ electron/                # Legacy desktop packaging
├─ tests/                   # pytest smoke tests
├─ examples/
└─ public/fonts/            # Self-hosted Inter
```

## Prerequisites

- Node.js 20+
- Python 3.9+
- npm

## Quick Start

```bash
npm install
pip install -r requirements.txt
npm run dev          # UI only → http://localhost:5173
# or full stack:
npx vercel dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test         # Vitest
npm run test:python  # pytest
```

## Build & Deploy

```bash
npm run build   # → dist/
```

Deploy via Vercel Git integration (recommended) or `.github/workflows/vercel-deploy.yml` (Node 20) with secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Optional env for APIs: `MAX_BODY_BYTES`, `ALLOWED_ORIGINS`, `DEBUG=1` (exposes error details).

## License

MIT — see [LICENSE](LICENSE).
