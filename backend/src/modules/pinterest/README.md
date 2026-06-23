# Pinterest Module

## Purpose

The Pinterest module owns Pinterest OAuth, profile fetch, board creation, and pin creation.

## Public Routes

Mounted from `src/app.js` at `/api/auth/pinterest`.

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/oauth` | Redirects to Pinterest OAuth. Requires `userId`. |
| `GET` | `/callback` | Exchanges the OAuth code, saves the account and token, then returns JSON. |
| `POST` | `/board` | Creates a Pinterest board. Requires `accessToken` and `name`. |
| `POST` | `/pins` | Creates a Pinterest pin. Requires `accessToken`, `boardId`, and file upload. Multipart field: `file`. |

## Module API

- `pinterest.routes.js` exposes the Express router.
- `pinterest.controller.js` owns request validation and response behavior.
- `pinterest.service.js` owns Pinterest API calls and Cloudinary upload for pins.

## Data And Dependencies

- External API: `https://api-sandbox.pinterest.com/v5`
- Shared modules: Social Connections, Media
- Tables touched through Social Connections: `platforms`, `social_accounts`, `oauth_tokens`
- Environment variables: `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, `PINTEREST_REDIRECT_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Runtime Contracts

The OAuth callback returns JSON rather than redirecting. Pinterest tokens are currently stored without refresh-token or expiry behavior, matching the existing implementation.
