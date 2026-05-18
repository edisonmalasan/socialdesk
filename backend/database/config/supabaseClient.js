const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const path = require('path');
const { fileURLToPath } = require('url');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY. Add them to .env at the project root.',
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
