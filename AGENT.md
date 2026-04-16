# AGENT.md

Project operating contract for the Study Planner monorepo.

This file defines how contributors and coding agents must build, change, and
review this app. These rules are not optional. When tradeoffs appear, favor
security, clarity, consistency, and small implementations over speed or clever
abstractions.

## Product Summary

Study Planner is a student productivity app with a React frontend and a
Node.js backend. The product helps users:

- create and manage study tasks
- track deadlines and upcoming work
- view planned study sessions
- monitor progress and completion metrics

This is a monorepo. The frontend and backend must evolve together through a
shared, predictable contract.

## Core Principles

- Keep implementations small.
- Do not overengineer.
- Prefer one-file changes or the least number of files possible.
- Every feature must ship with tests.
- No implementation without tests.
- API never trusts the frontend.
- Always validate all external input.
- Security comes first.
- Standardize data flow between frontend and backend.
- Do not expose critical internal errors to users.
- Prevent abusive usage patterns.
- Prefer helpers once files get too large.
- Make good use of Firebase rather than recreating Firebase features poorly.

## Monorepo Structure

Current and target layout:

```text
/
  AGENT.md
  CLAUDE.md
  package.json
  package-lock.json
  web/
    src/
    public/
    package.json
    vite.config.ts
  api/
  packages/
    shared/
```

Rules:

- `web/` contains the React application only.
- `api/` contains the Fastify backend only.
- `packages/shared/` will contain shared Zod schemas, DTOs, typed contracts,
  constants, and utility helpers used by both frontend and backend.
- Do not place backend logic in `web/`.
- Do not place frontend rendering logic in `api/`.
- Shared contracts must not import framework-specific runtime code from React,
  Fastify, or Firebase client SDKs.

## Stack

Frontend:

- React
- TypeScript
- Vite
- React Router

Backend:

- Node.js
- TypeScript
- Fastify
- Zod
- Firebase Admin SDK

Platform and data:

- Firebase Authentication
- Firestore
- Optional Firebase Storage if file uploads are added later

Testing:

- Every feature must include tests
- Prefer fast unit tests plus focused integration tests
- Add end-to-end coverage for critical user flows when the stack is ready

## Scope

Current product scope:

- authentication and session-aware access
- task creation, update, completion, deletion, and listing
- dashboard summaries
- progress analytics
- schedule or study-session management
- user-specific data isolation

Out of scope until explicitly approved:

- social features
- real-time collaboration
- plugin systems
- complex workflow engines
- AI-powered automation
- speculative abstractions for future enterprise use cases

## Architecture

### Frontend Architecture

Use a simple feature-oriented structure as the app grows:

```text
web/src/
  app/
  components/
  features/
    tasks/
    dashboard/
    progress/
    schedule/
    auth/
  lib/
  hooks/
  routes/
  styles/
```

Frontend rules:

- UI components stay presentational when possible.
- Business rules and network calls belong in feature modules, hooks, or client
  services, not inside random components.
- Forms must validate on the client for UX, but client validation never replaces
  backend validation.
- Do not scatter fetch logic across many components.
- Do not duplicate backend response-shape mapping in many places.
- Normalize API access through a small client layer.

### Backend Architecture

Use modular Fastify features with explicit boundaries:

```text
api/src/
  app/
  config/
  plugins/
  middleware/
  modules/
    auth/
    tasks/
    dashboard/
    progress/
    schedule/
    users/
  lib/
  types/
```

Per-module structure should stay small:

```text
modules/tasks/
  task.routes.ts
  task.controller.ts
  task.service.ts
  task.schema.ts
  task.test.ts
```

Backend rules:

- Route layer handles HTTP concerns only.
- Controller layer maps request to service call and response shape.
- Service layer owns business logic and Firebase access.
- Schema layer owns Zod validation and transport contracts.
- Shared reusable utilities belong in `lib/` or `packages/shared/`.
- Do not add repositories, factories, adapters, and indirection layers unless
  there is a demonstrated need.
- Keep the call chain understandable in one read.

## Strict File Size Rules

These limits are mandatory:

- No backend file may exceed 250 lines.
- No frontend file may exceed 350 lines.

When a file approaches the limit:

- extract helper functions
- extract schema definitions
- extract reusable components
- extract query or service helpers
- split feature concerns into smaller files

Do not wait until a file is huge before splitting it.

## Shared Contract and Data Flow

Frontend and backend data flow must be standardized.

Required pattern:

1. frontend form/input
2. frontend feature client
3. API request DTO
4. backend Zod validation
5. service logic
6. Firebase call
7. service output DTO
8. frontend mapper if needed
9. UI render

Rules:

- API request and response shapes must be typed and consistent.
- Shared request and response schemas should live in `packages/shared/` once the
  package exists.
- Dates must use a defined format consistently, preferably ISO strings at the
  API boundary.
- Never let raw Firestore document shapes leak directly into UI components.
- Never let arbitrary frontend payloads flow directly into Firebase calls.
- Prefer explicit DTOs over passing whole objects around.

## API Standards

Base prefix:

- `/api`

General conventions:

- Use plural resource names where appropriate.
- Use JSON for request and response bodies.
- Include a stable success/error envelope once the shared contract is created.
- Prefer idempotent operations where semantics require them.
- Do not return internal stack traces.

Suggested initial endpoints:

Auth:

- `POST /api/auth/session`
- `GET /api/auth/me`

Tasks:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `POST /api/tasks/:taskId/complete`

Dashboard:

- `GET /api/dashboard/summary`

Progress:

- `GET /api/progress/overview`

Schedule:

- `GET /api/study-sessions`
- `POST /api/study-sessions`
- `PATCH /api/study-sessions/:sessionId`
- `DELETE /api/study-sessions/:sessionId`

Users:

- `GET /api/users/me/settings`
- `PATCH /api/users/me/settings`

These endpoints are the default plan. Do not add more endpoints unless the UI or
business need clearly requires them.

## Module List

Expected backend modules:

- `auth`
  - Firebase token verification
  - current-user resolution
  - role checks
- `users`
  - user profile metadata
  - settings and preferences
- `tasks`
  - CRUD
  - completion rules
  - filtering and pagination
- `dashboard`
  - summary counts
  - upcoming deadlines
  - weekly metrics
- `progress`
  - completion rate
  - subject breakdown
  - summary analytics
- `schedule`
  - study sessions
  - calendar/list retrieval

Expected frontend feature areas:

- `auth`
- `tasks`
- `dashboard`
- `progress`
- `schedule`
- shared `ui`

## Validation Rules

Always validate. No exceptions.

Required validation:

- request body
- query params
- route params
- headers when relevant
- auth token presence and format
- role access requirements
- Firebase-derived data before trusting assumptions

Rules:

- Use Zod for all API boundary validation.
- Parse and validate before business logic runs.
- Reject unknown or malformed payloads.
- Re-validate transformed data when complexity makes it necessary.
- Frontend form validation is for usability only.
- Backend validation is the source of truth.

## Security Rules

Security is a primary feature.

Mandatory backend protections:

- CORS must be explicit, not wildcard in production.
- Rate limiting must be enabled.
- Authentication required on protected routes.
- Role-based access control required where applicable.
- Input validation on every boundary.
- Output sanitization where needed.
- No direct trust of client-submitted ownership fields.
- User identity must come from verified auth context, not request body.
- No exposure of stack traces, secrets, or database internals in responses.
- Log detailed errors server-side only.
- Return safe generic messages to clients.
- Enforce data ownership on every read and write.
- Prevent mass assignment vulnerabilities by whitelisting allowed fields.
- Do not expose Firebase admin credentials to frontend code.
- Do not return raw Firebase error objects to clients.

Security defaults:

- secure headers
- route-level authorization
- request size limits
- defensive parsing
- conservative CORS origins
- safe error handling

## Role Access Levels

Default role model:

- `student`
  - manages only their own tasks, sessions, and settings
- `admin`
  - limited administrative operations if explicitly implemented later

Rules:

- Start with least privilege.
- Build only the roles the product needs now.
- Do not create unused permission systems.
- Every protected route must define who can access it.
- Ownership checks are required even for authenticated users.
- A signed-in user must never be able to act on another user's records.

## Abuse Prevention

Nobody should be able to do anything unchecked in the app.

Defensive requirements:

- rate limit sensitive and repeated endpoints
- restrict write frequency where abuse risk exists
- validate pagination limits
- reject oversized payloads
- guard expensive queries
- protect auth-related endpoints from brute force patterns
- ensure repeated mutations are safe or explicitly blocked

Do not rely on the frontend to prevent abuse.

## Firebase Usage Rules

Use Firebase intentionally.

Required Firebase guidance:

- Use Firebase Auth for identity.
- Use Firebase Admin SDK only on the backend.
- Use Firestore for application data where it fits.
- Model documents around product access patterns, not abstract purity.
- Keep document shapes simple and explicit.
- Favor indexed, user-scoped queries.
- Store `userId` on owned records.
- Use server-generated timestamps where possible.

Avoid:

- leaking Firestore-specific internals into UI
- deeply nested document structures without a real need
- broad collection scans
- storing unvalidated client blobs
- duplicating data without a read-performance reason

Frontend Firebase rules:

- Frontend may use Firebase client SDK only for auth/session acquisition if the
  architecture calls for it.
- Frontend must not perform privileged database operations directly if the
  backend is the system of record.
- Prefer backend-mediated writes for consistency, authorization, and auditing.

## Error Handling

Rules:

- Never expose critical internal errors to the client.
- Use safe, stable error responses.
- Log structured details server-side.
- Keep user-facing errors understandable and minimal.
- Distinguish validation, auth, permission, not-found, conflict, and server
  failures clearly.
- Do not swallow errors silently in code.

Preferred response categories:

- `400` validation error
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` conflict
- `429` rate limited
- `500` internal server error with safe generic message

## Testing Rules

No feature is complete without tests.

Mandatory rule:

- No implementation without any test.

Minimum expected coverage per feature:

- schema validation tests
- service logic tests
- route or integration tests for critical paths
- frontend interaction tests for meaningful UI behavior

Testing policy:

- Add tests in the same feature/module area whenever possible.
- Prefer focused tests over giant brittle suites.
- Test success paths, validation failures, auth failures, and permission checks.
- For bugs, write a test that reproduces the bug before or with the fix.
- If a change affects a contract, update tests in the same change.

Critical flows that require tests:

- sign in or session validation
- create task
- edit task
- complete task
- delete task
- dashboard summary fetch
- progress fetch
- schedule create/update/delete
- role/ownership enforcement
- rate limit behavior where feasible

## Change Discipline

Keep changes small and reviewable.

Rules:

- Do not touch many files if one or a few files can solve the problem.
- Prefer the minimum number of changed files.
- Avoid broad refactors during feature work unless required to unblock quality.
- If a change spreads, stop and look for a smaller seam.
- Keep implementations local to the feature.
- Do not introduce abstractions before their second real use.

Preferred order of operations:

1. understand the existing code
2. find the smallest correct change
3. add or update tests
4. implement
5. verify

## Implementation Checklist

Before coding:

- confirm scope
- identify affected module
- identify test coverage needed
- check whether the change can stay within one file or a minimal set

During coding:

- validate all inputs
- preserve standardized data flow
- keep files under size limits
- avoid overengineering
- keep auth and ownership checks explicit

Before finishing:

- tests added
- tests passing
- no critical error leakage
- access control verified
- rate limits or abuse safeguards considered
- frontend and backend contract still aligned

## Non-Negotiable Rules

- No backend file over 250 lines.
- No frontend file over 350 lines.
- No feature without tests.
- No trust in frontend input.
- Always validate.
- Security before convenience.
- Keep implementations small.
- Do not overengineer.
- Use the fewest files possible.
- Use Firebase correctly and safely.
