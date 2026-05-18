import supabase from './config/supabaseClient.js';

export async function checkSupabaseConnection() {
  try {
    const url = new URL(supabase.supabaseUrl);
    const healthUrl = new URL('/auth/v1/health', url.origin);

    const res = await fetch(healthUrl, {
      headers: {
        apikey: supabase.supabaseKey,
        Authorization: `Bearer ${supabase.supabaseKey}`,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false,
        message: `Supabase replied with HTTP ${res.status}. Check URL and SUPABASE_KEY.`,
        cause: body || undefined,
      };
    }

    return { ok: true, message: 'Supabase is reachable and accepted your API key.' };
  } catch (err) {
    return {
      ok: false,
      message:
        'Could not reach Supabase. Check SUPABASE_URL and your internet connection.',
      cause: err,
    };
  }
}
