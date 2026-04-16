# Study Planner

Study Planner is a student productivity app for organizing study tasks, tracking deadlines, planning study sessions, and reviewing progress.

This repository is a monorepo with:

- `web/`: React + TypeScript + Vite frontend
- `api/`: Fastify + TypeScript backend

## Features

- dashboard overview for study activity
- add-task flow for creating study items
- schedule page for planned study sessions
- progress page for completion tracking
- backend health endpoint at `/health`

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Fastify, TypeScript, Zod, Firebase Admin SDK
- Testing: Vitest
- Tooling: ESLint, npm workspaces

## Project Structure

```text
.
├── AGENT.md
├── CLAUDE.md
├── package.json
├── api/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       └── app/
│           └── app.ts
└── web/
    ├── package.json
    ├── index.html
    └── src/
        ├── app/
        ├── components/
        ├── features/
        ├── hooks/
        ├── routes/
        └── styles/
```

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install

From the repository root:

```bash
npm install
```

## Running the App

Start the frontend:

```bash
npm run dev
```

Start the backend:

```bash
npm run dev:api
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

## Available Scripts

Run these from the repository root unless noted otherwise.

```bash
npm run dev
npm run dev:api
npm run build
npm run lint
npm run preview
npm run test:api
```

Frontend workspace scripts:

```bash
npm run test --workspace web
npm run test:watch --workspace web
```

Backend workspace scripts:

```bash
npm run test --workspace api
npm run test:watch --workspace api
```

## Environment Notes

The backend currently reads environment variables through `dotenv`.

Common values:

- `PORT`: API port, defaults to `3001`
- `HOST`: API host, defaults to `0.0.0.0`
- `CORS_ORIGIN`: allowed frontend origin, defaults to `http://localhost:5173`

If you add Firebase credentials or other secrets later, keep them out of source control.

## Frontend Architecture

The frontend is organized by responsibility:

- `app/`: app shell and top-level composition
- `routes/`: route registration
- `features/`: page-level feature modules such as dashboard, tasks, schedule, and progress
- `components/`: reusable presentational UI
- `hooks/`: reusable React hooks
- `styles/`: shared global and layout styles

## Backend Architecture

The backend currently has a small Fastify setup with:

- security middleware via Helmet
- CORS configuration
- rate limiting
- a `/health` endpoint

The intended direction is feature-based backend modules as the API grows.

## Testing

Frontend and backend both use Vitest.

Examples:

```bash
npm run test --workspace web
npm run test --workspace api
```

## Notes

- `AGENT.md` defines the project operating contract and architectural expectations.
- `CLAUDE.md` and `.claude/` contain Claude-specific workflow guidance and hook configuration for that environment.
- Some internal package names still use the original workspace naming. That does not affect the visible product name, which is `Study Planner`.
