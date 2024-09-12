import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = '';
const ANON_KEY = '';

// initialize the JS client
const supabase = createClient(PROJECT_URL, ANON_KEY);

export default supabase;