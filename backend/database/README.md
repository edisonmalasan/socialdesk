# Supabase integration (Node.js)

Minimal setup to connect a Node backend to Supabase and verify the connection.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes `fetch` used by the connection check)
- A Supabase project ([Supabase Dashboard](https://supabase.com/dashboard))

## Setup

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Configure environment variables

Create a file named `.env` in the **project root** (same folder as `package.json`).

| Variable         | Description |
|------------------|-------------|
| `SUPABASE_URL`   | **Project URL** — Dashboard → *Project Settings* → *API* → *Project URL* |
| `SUPABASE_KEY`   | **API key** — use the **anon** key for client-style access, or the **service_role** key only on trusted servers (never expose it in the browser) |

Example (replace with your real values):

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=your_key_here
```

Do not commit `.env`. It is listed in `.gitignore`.

### 3. Verify the connection

```bash
npm run check:supabase
```

- **Success:** prints a message that Supabase is reachable and the key was accepted.
- **Failure:** prints an error; confirm URL/key and network, then try again.

## Using the client in your code

Import the runtime client (loads `.env` when this module is first imported):

```js
const supabase = require('../src/infrastructure/database/supabaseClient');

// Example: query a table (adjust name and columns to match your schema)
const { data, error } = await supabase.from('your_table').select('*').limit(5);
```

Programmatic connection check:

```js
import { checkSupabaseConnection } from './database/supadb.js';

const result = await checkSupabaseConnection();
if (!result.ok) {
  console.error(result.message);
}
```

## Project layout

| Path | Role |
|------|------|
| `../src/infrastructure/database/supabaseClient.js` | Loads `.env`, creates `createClient`, exports `supabase` |
| `database/supadb.js` | `checkSupabaseConnection()` — health check via Auth API |
| `scripts/checkSupabase.js` | CLI used by `npm run check:supabase` |



### 4. Apply the database schema

1. In the Supabase dashboard, open *SQL Editor*.
2. Paste the contents of sql/schema.sql and run it.
