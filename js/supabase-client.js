window.CR = window.CR || {};

(() => {
  const SUPABASE_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2'
  ];

  let supabaseLibraryPromise = null;

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

  function waitForWindowSupabase(timeoutMs = 2500) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      function check() {
        if (window.supabase?.createClient) {
          resolve(window.supabase);
          return;
        }

        if (Date.now() - start >= timeoutMs) {
          reject(new Error('Supabase client library did not load.'));
          return;
        }

        window.setTimeout(check, 50);
      }

      check();
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-supabase-src="${src}"]`);

      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.supabaseSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureSupabaseLibrary() {
    if (window.supabase?.createClient) {
      return window.supabase;
    }

    if (!supabaseLibraryPromise) {
      supabaseLibraryPromise = (async () => {
        try {
          return await waitForWindowSupabase(1500);
        } catch (_initialError) {
          for (const src of SUPABASE_CDN_URLS) {
            try {
              await loadScript(src);
              return await waitForWindowSupabase(2000);
            } catch (_error) {
              // Try the next CDN.
            }
          }

          throw new Error('Supabase client library did not load.');
        }
      })();
    }

    return await supabaseLibraryPromise;
  }

  async function createSupabaseClient() {
    const supabaseLib = await ensureSupabaseLibrary();
    const config = resolveConfig();

    return supabaseLib.createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  window.CR.getSupabase = async () => {
    if (!window.CR.supabase) {
      window.CR.supabase = await createSupabaseClient();
    }

    return window.CR.supabase;
  };
})();
