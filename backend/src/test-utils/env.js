// Dummy credentials so modules that construct clients at require-time
// (e.g. supabaseClient.js) don't throw when no real .env is present.
// dotenv.config() never overwrites a value already set on process.env,
// so these stick even if backend/.env defines the real ones.
process.env.JWT_SECRET ||= "test-jwt-secret";
process.env.SUPABASE_URL ||= "http://localhost:54321";
process.env.SUPABASE_KEY ||= "test-anon-key";

process.env.FB_APP_ID ||= "test-fb-app-id";
process.env.FB_APP_SECRET ||= "test-fb-app-secret";
process.env.FB_REDIRECT_URI ||= "http://localhost:5000/api/auth/facebook/callback";
process.env.INSTAGRAM_REDIRECT_URI ||= "http://localhost:5000/api/auth/instagram/callback";

process.env.PINTEREST_APP_ID ||= "test-pinterest-app-id";
process.env.PINTEREST_APP_SECRET ||= "test-pinterest-app-secret";
process.env.PINTEREST_REDIRECT_URI ||= "http://localhost:5000/api/auth/pinterest/callback";

process.env.GOOGLE_CLIENT_ID ||= "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET ||= "test-google-client-secret";
process.env.YOUTUBE_REDIRECT_URI ||= "http://localhost:5000/api/auth/youtube/callback";
