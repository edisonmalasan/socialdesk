# Meta Module

## Purpose

The Meta module owns Facebook and Instagram Business behavior that depends on the Meta Graph API. Facebook and Instagram remain together because Instagram publishing and connection flows depend on Facebook pages and page access tokens.

## Public Routes

Mounted from `src/app.js` at `/api/auth/facebook`.

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/redirect` | Redirects to Facebook OAuth. Requires `userId`. |
| `GET` | `/callback` | Handles Facebook OAuth callback and redirects to the frontend accounts page. |
| `POST` | `/post` | Creates a Facebook page text post, optionally scheduled. |
| `POST` | `/post-photo` | Uploads a photo directly to Facebook. Multipart field: `source`. |
| `POST` | `/schedule-photo` | Uploads a photo through Cloudinary and schedules a Facebook post. Multipart field: `source`. |
| `POST` | `/instagram/post` | Publishes an Instagram image post. Multipart field: `source`. |
| `POST` | `/instagram/postreels` | Publishes an Instagram Reel. Multipart field: `source`. |
| `POST` | `/refresh` | Refreshes a Meta OAuth token. Requires `socialAccountId`. |

`instagram.routes.js` is preserved in this module because it existed before the migration, but it is not mounted by `src/app.js`.

## Module API

- `meta.routes.js` exposes the mounted Express router.
- `facebook.controller.js` owns Facebook-facing routes and the currently mounted Instagram publishing endpoints.
- `instagram.controller.js` preserves the previously unmounted Instagram connection controller.
- `meta.service.js` owns Meta Graph API URL generation, OAuth exchange, token refresh, Facebook posting, Instagram image publishing, and Instagram Reel publishing.

## Data And Dependencies

- External API: Meta Graph API `v25.0`
- Shared modules: Social Connections, Media
- Tables touched through Social Connections: `platforms`, `social_accounts`, `oauth_tokens`
- Environment variables: `FB_APP_ID`, `FB_APP_SECRET`, `FB_REDIRECT_URI`, `INSTAGRAM_REDIRECT_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Runtime Contracts

Frontend redirects remain hardcoded to `http://localhost:3000/accounts?...` as before. OAuth scopes, polling delays, Cloudinary folders, response bodies, and error response shapes are intentionally unchanged.

## Known Limits

Some controller code still performs direct `axios` calls where that was the original behavior. Future cleanup can move those calls behind narrower service functions after characterization coverage is stronger.
