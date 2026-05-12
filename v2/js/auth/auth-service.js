window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  async function getSession() {
    const supabase = CR.getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data?.session || null;
  }

  async function signIn(email) {
    const supabase = CR.getSupabase();

    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/canes-rivalry-app/v2/`
      }
    });
  }

  async function signOut() {
    const supabase = CR.getSupabase();
    return await supabase.auth.signOut();
  }

  async function loadProfile(user) {
    if (!user?.id) return null;

    const supabase = CR.getSupabase();

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
    const supabase = CR.getSupabase();

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
