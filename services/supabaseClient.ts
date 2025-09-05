import { createClient } from '@supabase/supabase-js';
// Replace the placeholder values below with your Supabase project's URL and ANON key.
// DO NOT use your service_role key here. It is not safe for the browser.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
  // Remind the user to configure their keys if they haven't.
  const setupErrorElement = document.getElementById('root');
  if(setupErrorElement) {
    setupErrorElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
        <h1 style="color: #BB2233; font-size: 1.5rem;">Configuration Needed</h1>
        <p style="font-size: 1rem;">Please update <strong>services/supabaseClient.ts</strong> with your Supabase Project URL and Public Anon Key.</p>
      </div>
    `;
  }
  throw new Error('Supabase URL and Anon Key must be provided in services/supabaseClient.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);