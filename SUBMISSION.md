# Ajaia Docs – Submission

## Materials Folder

[Google Drive folder containing the source archive, documentation, screenshot, and setup files](https://drive.google.com/drive/folders/14VkjBVsqMbBFyY46WI0kd0SgByUJA-3Y)

## Live Application

Deployment URL: pending Vercel setup and production PostgreSQL credentials. No live URL is claimed until the database-backed deployment is available.

Local preview: [http://localhost:3000/documents](http://localhost:3000/documents)

## Source Code

[GitHub source repository](https://github.com/RaoUsama7/Ajaia-Docs) and `ajaia-docs-source.zip` in the Google Drive materials folder.

## Walkthrough Video

See `WALKTHROUGH_URL.txt`.

## Demo Users

- Alex Morgan — alex@ajaia.demo
- Jordan Lee — jordan@ajaia.demo
- Taylor Kim — taylor@ajaia.demo

No password is required. Use the **Demo User** selector in the application.

## Local Setup

```bash
npm install
copy .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

For a database-free local preview, leave `DATABASE_URL` missing or set to the example placeholder. The development-only file adapter persists data in `.local/ajaia-data.json`.

## Included Files

- `README.md`
- `ARCHITECTURE.md`
- `AI_WORKFLOW.md`
- `SUBMISSION.md`
- `WALKTHROUGH_URL.txt`
- `docs/dashboard-preview.png`
- Source code
- Database schema and migration
- Automated tests

## Core Functionality Status

- [x] Create documents
- [x] Rename documents
- [x] Rich text editing
- [x] Persistent saving
- [x] Reopen documents
- [x] `.txt` import
- [x] `.md` import
- [x] Document ownership
- [x] Share with another user
- [x] Owned/shared distinction
- [x] Server-side access checks
- [x] Error handling
- [x] Automated tests
- [ ] Deployment (requires database and Vercel project)

## Working

Create/edit/rename/delete, TipTap formatting, autosave and refresh persistence, `.txt`/`.md` import, demo-user switching, owned/shared sections, editor sharing, owner-only controls, server authorization, local preview persistence, tests, and production build all work.

## Incomplete / Pending

There is no live deployment yet because this environment has no Vercel session or production PostgreSQL credentials. The walkthrough URL is still a placeholder. Real-time simultaneous collaboration, production authentication, comments, version history, DOCX import, and advanced sharing roles are intentionally out of scope.

## Intentional Scope Cuts

- Full authentication
- Simultaneous real-time collaboration
- Comments
- Version history
- DOCX import
- Advanced sharing roles

## With Another 2–4 Hours

1. Yjs/Liveblocks-based real-time collaboration
2. Document version history
3. Comments
4. Production authentication
5. Richer import/export
