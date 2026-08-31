# AI-Assisted Development Workflow

## Tools Used

This project used OpenAI Codex as an AI coding assistant/LLM inside the development workspace. Cursor was not used, so it is intentionally not claimed here.

## Where AI Accelerated Development

AI assistance accelerated repetitive project setup, first-pass React component structure, TipTap integration patterns, the Prisma schema and migration, authorization edge-case enumeration, focused test cases, and documentation completeness checks. It also helped identify repeated permission decisions that belonged in small shared helpers rather than individual actions.

## What I Changed or Rejected

Generated suggestions were treated as drafts. I rejected an over-engineered repository/service/controller split and kept one explicit server-action boundary. Authentication was simplified to seeded demo users with a validated server cookie. WebSockets and speculative real-time infrastructure were excluded. Permission logic was reviewed so shared editors can mutate content but cannot rename, share, or delete. Autosave was changed from independent debounce requests to a serialized queue to avoid stale ordering. The editor and dashboard UX were manually refined around the reviewer journey, and unnecessary controls were omitted instead of shipping nonfunctional UI.

## Verification

AI output was not accepted blindly. Verification included strict TypeScript compilation through the production build, ESLint, Vitest business-logic tests, and code review of each server mutation. The intended manual checklist covers switching users, sharing, persistence after refresh, unauthorized access, empty/unsupported/oversized imports, and responsive dashboard/editor layouts. Database-dependent flows require a configured PostgreSQL instance and seeded demo users.

## AI Philosophy

AI was used to reduce mechanical implementation time, not to delegate product or engineering judgment. The developer remained responsible for architecture, scope, security, UX, testing, and final decisions.
