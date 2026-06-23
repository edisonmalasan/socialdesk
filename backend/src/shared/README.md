# Shared Code

## Purpose

`src/shared` contains reusable application code that has no business-module ownership and no direct external infrastructure side effects. It must not import business modules.

## Contents

- `constants/` is reserved for cross-module constants.
- `utils/` contains small reusable helpers.
- `validation/` is reserved for shared validation helpers.

Runtime adapters for external systems belong in `src/infrastructure`, not `src/shared`.

## Environment Variables

The backend currently reads:

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `FB_APP_ID`
- `FB_APP_SECRET`
- `FB_REDIRECT_URI`
- `INSTAGRAM_REDIRECT_URI`
- `PINTEREST_APP_ID`
- `PINTEREST_APP_SECRET`
- `PINTEREST_REDIRECT_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

`.env.example` currently documents only a subset of these values. That is recorded as existing configuration documentation debt.
