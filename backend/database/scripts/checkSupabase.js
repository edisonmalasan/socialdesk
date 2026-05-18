import { checkSupabaseConnection } from '../database/supadb.js';

const result = await checkSupabaseConnection();
if (!result.ok && result.cause) {
  console.error(result.cause);
}
setTimeout(() => {
  process.exit(result.ok ? 0 : 1);
}, 100);