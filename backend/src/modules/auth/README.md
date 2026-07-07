# Auth Module

## Purpose

The Auth module owns backend login for Socialdesk users. It authenticates against the `users` table, verifies bcrypt password hashes, and issues JWTs for the frontend.

## Public Routes

Mounted from `src/app.js` at `/api/auth`.

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/login` | Validates `email` and `password`, then returns the existing login payload. |
| `POST` | `/logout` | Clears the `auth-token`/`user-role` cookies (if set server-side) and returns `{ "message": "Logged out successfully" }`. Sessions are stateless JWTs, so there is no server-side session to invalidate. |

Successful response shape is unchanged:

```json
{
  "token": "jwt",
  "role": "admin",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```

Invalid credentials return `401` with `{ "message": "Invalid email or password" }`. Unexpected errors return `500` with `{ "message": "Internal server error" }`.

## Module API

- `auth.routes.js` exposes the Express router.
- `auth.controller.js` handles request and response behavior.
- `auth.service.js` performs password verification and JWT creation.
- `auth.repository.js` owns the `users` table lookup.

## Data And Dependencies

- Table: `users`
- Libraries: `bcryptjs`, `jsonwebtoken`
- Infrastructure: `src/infrastructure/database/supabaseClient.js`
- Environment variables: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`

## Developer Notes

`src/shared/utils/hash-tool.js` contains the bcrypt hash helper. `scripts/hash-tool.js` remains as a command-line wrapper for developer workflow compatibility.
