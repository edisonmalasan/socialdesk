# SocialDesk Project Status (as of July 24, 2026)

## Overview

SocialDesk is a social media management dashboard built with a decoupled frontend/backend architecture:

- **Frontend:** Next.js 16 App Router, React 19, Tailwind CSS
- **Backend:** Express.js modulith API on port `5000`
- **Database:** Supabase PostgreSQL and authentication-backed user data
- **Jobs:** BullMQ + Redis for scheduled publishing and analytics ingestion

The platform goal is to let regular users connect social accounts, create content, schedule posts, publish across social platforms, and review analytics. Admin users manage SocialDesk itself: users, system health, account support, platform status, and SaaS-level metrics.

## Current Architecture

The backend now owns the main API surface. Frontend `/api/:path*` requests are rewritten to `http://localhost:5000/api/:path*` by [frontend/next.config.ts](frontend/next.config.ts).

Mounted backend modules in [backend/src/app.js](backend/src/app.js):

| Module | Mount | Current State |
| --- | --- | --- |
| Auth | `/api/auth` | Login/logout, JWT cookie flow, request validation |
| Meta | `/api/auth/facebook` | Facebook OAuth, Facebook publishing, Instagram publishing, Meta token refresh |
| Pinterest | `/api/auth/pinterest` | Pinterest OAuth, board creation, pin creation |
| YouTube | `/api/auth/youtube` | YouTube OAuth, upload, refresh, scheduled video helper |
| Posts | `/api/posts` | Authenticated post CRUD and scheduled-job sync |
| Accounts | `/api/accounts` | Authenticated account list/create/update/disconnect |
| Analytics | `/api/analytics` | Summary, posts, top posts, best-time, export, ingestion queue |
| Scheduled Posts | `/api/scheduled-posts` | BullMQ delayed jobs, recovery scanner, queue controls |
| Users | `/api/users` | Admin user management, current-user profile, password, avatar |
| Notifications | `/api/notifications` | User notifications, unread counts, read/delete actions |
| Dashboard | `/api/dashboard` | Authenticated dashboard overview |
| Settings | `/api/settings` | Profile and notification settings |
| Social Connections | `/api/social-connections` | Platform list and connected account reads |
| Platform Health | `/api/platform-health` | Admin-only platform/system health |
| Account Admin | `/api/account-admin` | Admin-only account support surface |
| SaaS Analytics | `/api/saas-analytics` | Admin-only SaaS-level metrics |

Shared backend conventions now visible in code:

- Authentication middleware: [backend/src/shared/middleware/auth.middleware.js](backend/src/shared/middleware/auth.middleware.js)
- Request validation middleware: [backend/src/shared/middleware/validate.middleware.js](backend/src/shared/middleware/validate.middleware.js)
- Standard response helpers: [backend/src/shared/utils/response.util.js](backend/src/shared/utils/response.util.js)
- Module shape generally follows `routes`, `controller`, `service`, `repository`, and optional `schema`.

## Features Currently Done

| Area | Status | Evidence / Notes |
| --- | --- | --- |
| Express modulith routing | Done | `backend/src/app.js` mounts the main business modules. |
| Frontend API rewrite to backend | Done | `frontend/next.config.ts` proxies `/api/*` to Express. |
| JWT authentication | Done | Backend validates `Authorization: Bearer` or `auth-token` cookie and attaches `req.user`. |
| Backend RBAC | Done | Admin-only middleware is used by users/admin/platform/SaaS routes. |
| Login/logout/session behavior | Done | Auth module and frontend logout page are present. |
| Posts API | Done | Backend posts module owns list/get/create/update/delete. |
| Accounts API | Done | Backend accounts module owns connected account reads and lifecycle actions. |
| User management | Done | Users module supports admin CRUD/disable and frontend management page calls `/api/users`. |
| Current-user profile/password | Done | Users module exposes `/me` and `/me/password`. |
| Avatar upload/delete | Done | Users module uses Media/Cloudinary for avatar upload/delete. |
| Notifications API | Done | Notifications module exposes list, mark read, mark all read, and delete. |
| Navbar/notifications wiring | Done | Frontend navbar and notifications page call `/api/notifications`. |
| Settings API | Done | Settings module handles profile and notification settings. |
| Dashboard API | Done | Dashboard module exposes `/api/dashboard/overview`, and frontend dashboard fetches it. |
| Analytics API | Done | Analytics module exposes summary, posts, top-posts, best-time, and export endpoints. |
| Analytics queue | Done, disabled by default | `ANALYTICS_QUEUE_ENABLED=false` in `.env.example`; queue starts from `server.js` when enabled. |
| Scheduled post execution | Done, disabled by default | BullMQ delayed publishing exists; `SCHEDULED_POSTS_QUEUE_ENABLED=false` by default. |
| Scheduled post recovery scanner | Done | Recovery cron defaults to `*/15 * * * *`. |
| YouTube OAuth/upload/refresh | Done | YouTube module exists and scheduled-post service has YouTube dispatch support. |
| Meta OAuth/token persistence | Done | Meta module persists accounts/tokens through Social Connections. |
| Pinterest OAuth/token persistence | Done | Pinterest module persists accounts/tokens through Social Connections. |
| Social connection read APIs | Done | Social Connections module exposes platforms and accounts reads. |
| Admin support APIs | Done, needs production hardening | Platform health, account admin, and SaaS analytics modules exist. |
| Database schema | Mostly done | Core tables, notifications, and user settings exist in `backend/database/sql/schema.sql`. |
| Backend tests | In progress | Many modules have tests, but not every new module/edge path is covered. |

## What Still Needs To Be Done For Production

| Priority | Workstream | What Needs To Be Done |
| --- | --- | --- |
| Critical | Secrets and env validation | Add startup validation for every required env var, document production/staging/local values, and fail fast when a required credential is missing. |
| Critical | TikTok configuration | Fill and validate TikTok env vars, then add OAuth routes, token persistence, app review/scopes, posting support, and scheduled-post integration. |
| Critical | Production database migrations | Convert the single SQL schema into repeatable migrations, including notifications and user settings, so production deploys are deterministic. |
| High | Real provider analytics | Replace mock analytics adapters in Meta, Pinterest, and YouTube services with real platform API calls, rate-limit handling, and partial-failure behavior. |
| High | Scheduled-post operations | Finish queue health/admin inspection, failed-job views, retry controls, and production Redis runbook. |
| High | OAuth callback consistency | Normalize Meta/Pinterest/YouTube/TikTok callback behavior and frontend redirect handling. |
| High | Token refresh orchestration | Ensure every publish and analytics sync can refresh or fail gracefully before provider calls. |
| High | Provider capability gating | Stop showing unavailable actions as usable. TikTok, X, LinkedIn, and unsupported formats should be disabled or marked unavailable until backend support exists. |
| High | Provider app review/compliance | Prepare required privacy policy, terms, data deletion, OAuth scopes, and app-review notes for Meta, Pinterest, Google/YouTube, and TikTok. |
| High | End-to-end smoke testing | Test login, connect account, create post, schedule post, publish job, notification, analytics refresh, export, admin management, and settings from the UI. |
| Medium | Media module routes | Add generic media upload/delete routes for composer assets, thumbnails, and reusable media. |
| Medium | Platform-specific validation | Validate media count, file type, caption length, board/video metadata, and platform capabilities before scheduling. |
| Medium | Audit logs | Track admin user changes, account disconnects, post deletes, publish failures, and token refresh failures. |
| Medium | API docs | Document every backend route, auth requirement, request body, response shape, and error envelope. |
| Medium | Local setup docs | Add a complete setup guide for Supabase, Redis, Cloudinary, OAuth apps, and queue toggles. |
| Low | X/Twitter decision | Confirm paid API access and scope before implementing the module. |
| Low | LinkedIn decision | Decide whether LinkedIn belongs in MVP before adding OAuth/publishing work. |

## Environment Variables Guide

Use [backend/.env.example](backend/.env.example) as the template for backend local development. Never commit real `.env` values.

### Core

| Variable | Where To Get It | Notes |
| --- | --- | --- |
| `JWT_SECRET` | Generate locally, for example with a password manager or `openssl rand -base64 32`. | Must be long and private. Use different values per environment. |
| `SUPABASE_URL` | Supabase project dashboard, Project Settings, API. | Use the project URL for the backend. |
| `SUPABASE_KEY` | Supabase project dashboard, Project Settings, API. | Backend usually needs service-role access for admin/server operations. Keep it server-only. |

### Meta / Facebook / Instagram

Official docs: [Create a Meta app](https://developers.facebook.com/documentation/development/create-an-app), [Facebook Login manual flow](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow).

| Variable | How To Get It |
| --- | --- |
| `FB_APP_ID` | Create/select an app in Meta for Developers, then copy the App ID from the app dashboard. |
| `FB_APP_SECRET` | In the same Meta app dashboard, copy the App Secret. Keep it server-only. |
| `FB_REDIRECT_URI` | Add your backend callback URL as a valid OAuth redirect URI, for example `http://localhost:5000/api/auth/facebook/callback`. |
| `INSTAGRAM_REDIRECT_URI` | Add the Instagram callback URL configured for this project, usually `http://localhost:5000/api/auth/instagram/callback` if Instagram routes are mounted, or align it with the actual backend callback route before production. |

Required app products/scopes should include Facebook Login and the Meta/Instagram permissions used by the code, such as page list/read/manage and Instagram content publishing permissions.

### Pinterest

Official docs: [Pinterest Connect app](https://developers.pinterest.com/docs/getting-started/connect-app/), [Pinterest authentication](https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/).

| Variable | How To Get It |
| --- | --- |
| `PINTEREST_APP_ID` | Create/request a Pinterest developer app, then copy the app ID from the app details. |
| `PINTEREST_APP_SECRET` | Copy the app secret from the same Pinterest app page. |
| `PINTEREST_REDIRECT_URI` | Register the exact backend callback URL, for example `http://localhost:5000/api/auth/pinterest/callback`. Pinterest requires exact redirect URI matching. |

### Cloudinary

Official docs: [Find Cloudinary credentials](https://cloudinary.com/documentation/finding_your_credentials_tutorial).

| Variable | How To Get It |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Console, product environment / dashboard. |
| `CLOUDINARY_API_KEY` | Cloudinary Console Settings, API Keys page. |
| `CLOUDINARY_API_SECRET` | Cloudinary Console Settings, API Keys page. Keep it server-only. |

### Redis / BullMQ

Official docs: [Redis install guide](https://redis.io/docs/latest/operate/oss_and_stack/install/) and [BullMQ connections](https://docs.bullmq.io/guide/connections).

| Variable | How To Get It |
| --- | --- |
| `REDIS_URL` | Local Redis or hosted Redis provider connection string. Local default is `redis://127.0.0.1:6379`. |
| `SCHEDULED_POSTS_QUEUE_ENABLED` | Set `true` only when Redis is running and you want scheduled publishing jobs active. |
| `ANALYTICS_QUEUE_ENABLED` | Set `true` only when Redis is running and you want analytics ingestion jobs active. |
| `SCHEDULED_POSTS_RECOVERY_ENABLED` | Usually `true`; recovery scanner repairs missed scheduled jobs. |
| `SCHEDULED_POSTS_RECOVERY_PATTERN` | Cron pattern for recovery scans. Default: `*/15 * * * *`. |
| `SCHEDULED_POSTS_BATCH_SIZE` | Max scheduled targets recovered per scan. |
| `SCHEDULED_POSTS_QUEUE_ATTEMPTS` | Publish job retry attempts. |
| `SCHEDULED_POSTS_QUEUE_BACKOFF_DELAY_MS` | Initial retry backoff delay. |
| `SCHEDULED_POSTS_QUEUE_CONCURRENCY` | Number of publish jobs the worker can process at once. |

### Google / YouTube

Official docs: [YouTube authorization credentials](https://developers.google.com/youtube/registering_an_application), [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2).

| Variable | How To Get It |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud Console, APIs & Services, Credentials, OAuth client ID. Enable YouTube Data API v3 first. |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client details page. Keep it server-only. |
| `YOUTUBE_REDIRECT_URI` | Authorized redirect URI on the OAuth client, for example `http://localhost:5000/api/auth/youtube/callback`. |

### TikTok

Official docs: [TikTok create an app](https://developers.tiktok.com/doc/getting-started-create-an-app), [TikTok Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web/).

These placeholders are already in `backend/.env.example`; fill them in once the TikTok backend module is being implemented:

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
```

| Variable | How To Get It |
| --- | --- |
| `TIKTOK_CLIENT_KEY` | TikTok for Developers, Manage apps, selected app, Credentials section. |
| `TIKTOK_CLIENT_SECRET` | Same TikTok app Credentials section. Keep it server-only. |
| `TIKTOK_REDIRECT_URI` | Configure the exact Login Kit redirect URI in the TikTok app, for example `http://localhost:5000/api/auth/tiktok/callback` once the backend module exists. |

TikTok still needs a backend module before these variables are usable in SocialDesk.

## Testing

Backend uses Node's built-in `node:test` runner and `supertest`:

```bash
cd backend
npm install
npm test
```

Frontend uses Vitest:

```bash
cd frontend
npm install
npm test
```

Recommended production-readiness test coverage still needed:

- Scheduled-post queue and Redis failure/recovery behavior
- Analytics ingestion queue and real provider adapters
- TikTok module once implemented
- Media upload edge cases for post media, avatars, and provider uploads
- End-to-end UI smoke tests across login, accounts, posts, schedule, notifications, analytics, dashboard, settings, and admin surfaces

## Production Readiness Checklist

Before calling the system production-ready:

1. Add and validate every required `.env` value per environment.
2. Run Supabase migrations against a clean database and confirm seed data.
3. Confirm Redis/BullMQ queues start only in intended environments.
4. Connect and publish through each supported provider using real app credentials.
5. Replace mock provider analytics adapters with real API calls.
6. Implement TikTok or hide/disable TikTok UI actions until supported.
7. Decide X/Twitter and LinkedIn MVP status and hide/disable unsupported actions.
8. Confirm OAuth app review/scopes/privacy/data deletion requirements for each provider.
9. Add queue/admin observability for failed scheduled posts and analytics ingestion.
10. Run backend tests, frontend tests, and manual end-to-end smoke tests.
