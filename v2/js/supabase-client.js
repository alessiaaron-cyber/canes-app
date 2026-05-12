window.CR = window.CR || {};

(() => {
  const SUPABASE_URL = 'https://hhhxgbztfizmwxbuoprq.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4laNe86TxiC5pLkAF5NeIg_oMmf1unQ';

  function createSupabaseClient() {
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client library did not load.');
    }

    return window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.CR.supabaseConfig = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
  };

  window.CR.getSupabase = () => {
    if (!window.CR.supabase) {
      window.CR.supabase = createSupabaseClient();
    }

    return window.CR.supabase;
  };
})();
