# Contributing to My Data Toolbox

## Prerequisites

- Node.js 20+
- Python 3.9+
- Git

## Setup

```bash
git clone https://github.com/jeoste/my-data-toolbox.git
cd my-data-toolbox
npm install
pip install -r requirements.txt
```

## Development

```bash
npm run dev          # frontend only
npx vercel dev       # frontend + Python APIs
npm run lint
npm run test
npm run test:python
```

## Guidelines

- **Web app** is the primary product (`src/` React, `api/` + `lib/` Python).
- Put Python business logic in `lib/` only. `src/*.py` are shims for Electron/CLI.
- Electron under `electron/` is legacy — see `electron/README.md`.
- Prefer TypeScript `unknown` + narrowing over `any` for new code.
- Keep API responses free of stack traces unless `DEBUG=1`.

## Pull requests

1. Branch from `dev`
2. Lint + tests green
3. Describe why, not only what
