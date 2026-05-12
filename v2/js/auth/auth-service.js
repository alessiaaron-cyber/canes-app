window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  async function getSession() {
    const supabase = await CR.getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data?.session || null;
  }

  async function signIn(email) {
    const supabase = await CR.getSupabase();
    const redirectUrl = window.CR?.config?.authRedirectUrl || `${window.location.origin}/canes-rivalry-app/v2/`;

    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
  }

  async function signOut() {
    const supabase = await CR.getSupabase();
    return await supabase.auth.signOut();
  }

  async function loadProfile(user) {
    if (!user?.id) return null;

    const supabase = await CR.getSupabase();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    return data || null;
  }

  async function isAllowedUser(email) {
    const supabase = await CR.getSupabase();

    const { data, error } = await supabase
      .from('allowed_users')
      .select('email')
      .ilike('email', String(email || '').trim())
      .maybeSingle();

    if (error) throw error;

    return !!data;
  }

  CR.auth = {
    getSession,
    signIn,
    signOut,
    loadProfile,
    isAllowedUser
  };
})();
