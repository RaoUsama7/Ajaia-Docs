# Architecture

## Product Scope

Ajaia Docs is designed as a polished shared-document workflow, not a Google Docs clone. The primary product loop is deliberately small: select a demo identity, create or import a document, edit and persist rich text, share it, switch identity, and continue editing with ownership boundaries intact. Features that do not strengthen that loop were left out of the assignment scope.

## System Overview

```text
Browser / React client
        ↓
Next.js App Router and Server Actions
        ↓
Identity, validation, and authorization helpers
        ↓
Prisma Client
        ↓
PostgreSQL (Neon or Supabase)
```

A single Next.js application reduces deployment complexity and allows more time to be invested in document UX, authorization, persistence, and sharing—the areas the assignment actually evaluates. Server components load initial dashboard and editor data. Small client components own interactive state such as TipTap, dialogs, the user switcher, and autosave status. Server actions form the mutation boundary.

For an offline reviewer preview, a development-only adapter stores the same users, documents, and shares in `.local/ajaia-data.json` when no usable `DATABASE_URL` is present. It mirrors the small Prisma surface used by the app, is git-ignored, and is explicitly disabled whenever `NODE_ENV=production`. Deployment therefore remains PostgreSQL-backed.

## Data Model

`User` stores the three seeded demo identities. Email is unique, and the seed uses upserts so it is safe to run repeatedly.

`Document` stores a title, canonical JSON content, timestamps, and a required owner relation. An owner does not need a duplicate share record.

`DocumentShare` joins a document to another user with an `EDITOR` permission. A compound unique constraint on `(documentId, userId)` prevents duplicate access records. Foreign keys cascade shares when a document or user is deleted.

The dashboard asks PostgreSQL for documents where the selected user is either the owner or appears in a share. The result is split into owned and shared sections without extra round trips.

## Rich Text Persistence

TipTap JSON is stored in PostgreSQL JSONB rather than storing HTML as the only source of truth. Structural JSON preserves headings, lists, and marks predictably through refreshes; it is easier to validate and transform for future export; and it avoids making arbitrary stored HTML the rendering contract. The editor validates the top-level document shape before a save. Malformed stored content falls back to an empty document instead of crashing the page.

## Authorization

The demo user ID lives in an HTTP-only, same-site cookie. A cookie value is never accepted as sufficient proof of identity: `getCurrentUser()` resolves it against the database and falls back only to the seeded Alex account. This is intentionally mock authentication, but the request boundary resembles a real authenticated session.

Permission helpers centralize three decisions: ownership, readable access, and editable access. Every document load verifies owner-or-share access. Content updates require owner or editor access. Title changes, sharing changes, and deletion require ownership. UI controls reflect those rules, but the server checks remain authoritative. Missing and forbidden resources receive distinct, friendly experiences without exposing document content.

## Autosave

TipTap updates and title changes are debounced for 900 milliseconds, avoiding a database write per keystroke. Pending title and content updates are coalesced. Saves are placed on a promise queue so requests are applied in creation order, preventing a slow earlier response from overwriting newer content. The UI exposes `Saving…`, `Saved`, and failure states, and a pending edit is flushed during editor cleanup when possible.

## File Import

Import supports only `.txt` and `.md` up to 1 MB. Both client and server validate extension and size; the server also rejects empty files. Plain text becomes paragraph nodes. Markdown is parsed with `marked`, raw HTML is escaped, and TipTap's server converter creates the same JSON structure used by native editing. The filename, without its extension, becomes a normalized title and the current demo user becomes owner.

## Tradeoffs

Production authentication, simultaneous editing, CRDTs, comments, DOCX parsing, and version history are intentionally absent. Each creates a substantially larger security, infrastructure, or UX surface than this evaluation requires. There is one editor permission rather than a partly implemented viewer role. The app also does not pretend that sequential saves are real-time collaboration: a user sees another user's saved work after navigation or refresh.

## Production Evolution

1. Replace demo cookies with production authentication and session rotation.
2. Add workspace and team membership models.
3. Introduce Yjs/Liveblocks (or a comparable collaboration layer) for simultaneous editing.
4. Add immutable versions with restore support.
5. Add anchored comments and mentions.
6. Move large attachments to object storage.
7. Add audit/activity logs.
8. Add rate limiting, telemetry, alerting, and structured error reporting.
