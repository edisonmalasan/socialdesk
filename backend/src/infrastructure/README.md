# Infrastructure

## Purpose

`src/infrastructure` contains runtime adapters for external systems (e.g. http clients, external services, prisma, etc..). Modules depend on these adapters through explicit imports, while infrastructure code must not import business modules.

## Database

`database/supabaseClient.js` creates and exports the configured Supabase client used by repositories.

`backend/database/` remains the home for database assets such as SQL schema, operational scripts, and database-specific documentation. It does not own the runtime Supabase client.

## Environment Variables

The Supabase client reads:

- `SUPABASE_URL`
- `SUPABASE_KEY`

The client loads `.env` from the backend project root.
