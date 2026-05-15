window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  async function getSession() {
    const supabase = await CR.getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data?.session || null;
  }

  async function requestOtp(email) {
    const supabase = await CR.getSupabase();

    return await supabase.auth.signInWithOtp({
      email
    });
  }

  async function verifyOtp(email, token) {
    const supabase = await CR.getSupabase();

    return await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
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

  async function isAllowedUser() {
    const supabase = await CR.getSupabase();

    const { data, error } = await supabase.rpc('is_allowed_user');

    if (error) throw error;

    return data === true;
  }

  CR.auth = {
    getSession,
    requestOtp,
    verifyOtp,
    signOut,
    loadProfile,
    isAllowedUser
  };
})();
