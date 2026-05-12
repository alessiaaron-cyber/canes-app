window.CR = window.CR || {};

(() => {
  function resolveConfig() {
    const runtimeConfig = window.CR?.config || window.APP_CONFIG || {};

    const url = runtimeConfig.supabaseUrl;
    const publishableKey = runtimeConfig.supabaseAnonKey;

    if (!url || !publishableKey) {
      throw new Error('Missing Supabase runtime configuration.');
    }

    return {
      url,
      publishableKey
    };
  }

  function createSupabaseClient() {
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client library did not load.');
    }

    const config = resolveConfig();

    return window.supabase.createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.CR.getSupabase = () => {
    if (!window.CR.supabase) {
      window.CR.supabase = createSupabaseClient();
    }

    return window.CR.supabase;
  };
})();
