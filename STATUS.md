# SocialDesk — Project Status (as of June 30, 2026)

## Overview

SocialDesk is a social media management dashboard built on Next.js (App Router) with a
separate Express backend. It lets users connect social accounts (Meta/Facebook, Instagram,
Pinterest), schedule/manage posts, and view analytics. Auth is cookie-based with
role-gated routes (admin vs. regular user).

## Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind — [app/](app/)
- **Frontend API layer**: Next.js route handlers calling Supabase directly — [app/api/](app/api/)
- **Backend**: standalone Express server on port 5000 — [backend/](backend/)
- **Database**: Supabase (Postgres) — schema at [backend/database/sql/schema.sql](backend/database/sql/schema.sql)
- **Auth middleware**: [proxy.ts](proxy.ts) — cookie-based (`auth-token`, `user-role`), redirects unauthenticated users to `/login`, restricts `/management` and `/accounts` to admins

There are two backend surfaces today: Next.js route handlers (DB reads/writes via
Supabase) and a separate Express app (auth + OAuth + media). They are not yet
consolidated.

## Feature Status

| Area | Page / Endpoint | Status | Notes |
|---|---|---|---|
| Dashboard | [app/dashboard/page.tsx](app/dashboard/page.tsx) | 🟡 UI only | Hardcoded mock arrays (`ACC_PERF`, `SCHED_POSTS`); not wired to any API |
| Account management | [app/accounts/page.tsx](app/accounts/page.tsx) + [app/api/accounts/route.ts](app/api/accounts/route.ts) | 🟢 Functional | Real GET/POST/DELETE against Supabase |
| Post management | [app/api/posts/route.ts](app/api/posts/route.ts), [app/api/posts/[id]/route.ts](app/api/posts/[id]/route.ts) | 🟢 Functional (API) | CRUD endpoints exist; confirm which page(s) consume them |
| Analytics | [app/analytics/page.tsx](app/analytics/page.tsx) + [app/api/analytics/*](app/api/analytics/) | 🟢 Functional | summary, top-posts, posts endpoints all live, querying Supabase |
| User management | [app/management/page.tsx](app/management/page.tsx) | 🔴 Mock data | Needs `/api/users`, `/api/users/:id/disable` (documented as TODO in-file, not implemented) |
| Notifications | [app/notifications/page.tsx](app/notifications/page.tsx) | 🔴 Mock data | Needs `GET /api/notifications` (not implemented) |
| Profile | [app/profile/page.tsx](app/profile/page.tsx) | 🔴 Mock data | Needs `GET /api/users/me` (not implemented) |
| Auth | [backend/src/modules/auth/](backend/src/modules/auth/) | 🟢 Implemented, tested | JWT + bcrypt, controller/service/repository/routes all present; unit + integration tests cover login |
| Meta (Facebook/Instagram) OAuth | [backend/src/modules/meta/](backend/src/modules/meta/) | 🟢 Implemented, partially tested | Separate controllers for Facebook and Instagram; redirect/post/refresh/callback covered, photo/reel upload paths not yet |
| Pinterest OAuth | [backend/src/modules/pinterest/](backend/src/modules/pinterest/) | 🟢 Implemented, tested | OAuth redirect/callback, board creation, pin creation all covered |
| Media uploads | [backend/src/modules/media/](backend/src/modules/media/) | 🟢 Implemented | Cloudinary-backed, multer middleware |
| Social connections | [backend/src/modules/social-connections/](backend/src/modules/social-connections/) | 🟡 Partial | Service + repository present, no route file found, likely not exposed yet |
| Route protection | [proxy.ts](proxy.ts) | 🟢 Implemented, tested | Cookie check + role gating |
| Frontend/backend integration | n/a | 🔴 Not unified | Express backend (port 5000) and Next.js API routes (Supabase) are separate; no single source of truth for auth between them yet |

Legend: 🟢 functional · 🟡 partially wired / UI-only · 🔴 not implemented

## Testing

Backend has a growing test suite using Node's built-in `node:test` runner + `supertest`,
covering auth, Meta (Facebook/Instagram), and Pinterest:

- [auth/auth.service.test.js](backend/src/modules/auth/auth.service.test.js) — unit
  tests for `authService.login` (unknown user, wrong password, success path incl. JWT
  contents)
- [auth/auth.routes.test.js](backend/src/modules/auth/auth.routes.test.js) — integration
  tests for `POST /api/auth/login` against the real Express app (200/401/401/500 cases)
- [meta/meta.service.test.js](backend/src/modules/meta/meta.service.test.js) — unit
  tests for the Facebook/Instagram OAuth URL builders
- [meta/facebook.routes.test.js](backend/src/modules/meta/facebook.routes.test.js) —
  integration tests for `/redirect`, `/post`, `/refresh`, and the full `/callback` flow
  (token exchange → page lookup → Instagram account detection → DB persist → redirect)
- [pinterest/pinterest.routes.test.js](backend/src/modules/pinterest/pinterest.routes.test.js) —
  integration tests for `/oauth`, `/callback` (account linking), `/board`, and `/pins`

All of these mock the repository/service/axios calls they depend on (never hitting
Supabase, the Graph API, or the Pinterest API), so no real `.env` file or external
credentials are required.

 [src/test-utils/env.js](backend/src/test-utils/env.js)
injects dummy values for `JWT_SECRET`, `SUPABASE_URL`/`KEY`, `FB_*`,
`INSTAGRAM_REDIRECT_URI`, and `PINTEREST_*` so the module chain loads without throwing.
Real `.env` values, if present, are never used by these tests.

Run them with:

```bash
cd backend
npm install   # only needed once, to pull in supertest
npm test
```

Not yet covered on the Meta side: `postPhoto`, `schedulePhotoPost`,
`createInstagramPost`, `createInstagramReelPost` which involve multer file uploads,
Cloudinary streaming, and (for Reels) a real `setTimeout` polling loop, which need either
file fixtures or a source change to make the delay injectable before they're worth
testing.

The frontend now has its own test suite too, using Vitest:

- [proxy.test.ts](proxy.test.ts) — unit tests for the [proxy.ts](proxy.ts)
  route-protection middleware, covering all three redirect branches (authenticated user
  on a public page, unauthenticated user on a protected page, non-admin user on an admin
  page), the pass-through cases, and the default-to-`user` role fallback

Run it with `npm test` from the repo root. Vitest (not Node's built-in `node:test`, which
the backend uses) was needed here specifically because `proxy.ts` imports `next/server`,
which only resolves under a bundler (webpack/Turbopack) — Node's native ESM/CJS loaders
can't follow that import on their own. [vitest.config.ts](vitest.config.ts) excludes
`backend/`, which has its own separate suite and test runner.

A GitHub Actions workflow ([.github/workflows/test.yml](.github/workflows/test.yml)) now
runs both `npm test` (frontend) and `cd backend && npm test` (backend) on every push to
`main` and on every pull request.

This is in-progress work on the `test/auth-suite` branch (not yet merged to `main`).

## Known Gaps

- Dashboard, management, notifications, and profile pages render mock data. Backend
  endpoints either don't exist or aren't called yet.
- Auth, Meta, Pinterest, and `proxy.ts` have tests now (see Testing above). The media
  module, social-connections module, the Meta file-upload/Reel-publishing endpoints, and
  the Next.js `app/api/` routes are still untested.
- Two backends (Express + Next.js API routes) aren't reconciled. Currently unclear which owns
  auth/session truth long-term.
- `social-connections` module has service/repository but no exposed routes.

## Setup

```bash
# frontend
npm run dev        # http://localhost:3000

# backend
cd backend
npm run dev         # http://localhost:5000
```

Both require `.env` files with Supabase credentials (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`) and, for the backend, OAuth credentials for Meta/Pinterest
and Cloudinary keys.
