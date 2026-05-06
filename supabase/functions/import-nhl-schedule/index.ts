import { createClient } from "npm:@supabase/supabase-js@2";

const NHL_BASE = "https://api-web.nhle.com/v1";
const TEAM = "CAR";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const authDb = createClient(SUPABASE_URL, ANON_KEY);
const serviceDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return null;

  const { data, error } = await authDb.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

async function requireAllowedUser(user: any) {
  const userEmail = String(user?.email || "").toLowerCase().trim();
  if (!userEmail) return { ok: false, error: "Missing user email", status: 401 };

  const { data, error } = await serviceDb
    .from("allowed_users")
    .select("email")
    .ilike("email", userEmail)
    .maybeSingle();

  if (error) {
    console.error("allowed_users lookup failed:", error);
    return { ok: false, error: "Authorization check failed", status: 500 };
  }

  if (!data) {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, email: userEmail };
}

async function getActiveNhlSeason() {
  const { data: activeSeason, error } = await serviceDb
    .from("seasons")
    .select("season_key")
    .eq("is_active", true)
    .single();

  if (error) throw error;
  if (!activeSeason?.season_key) throw new Error("No active season found.");

  const season = String(activeSeason.season_key).replace(/[^0-9]/g, "");

  if (!/^\d{8}$/.test(season)) {
    throw new Error(`Invalid active season_key: ${activeSeason.season_key}`);
  }

  return season;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const user = await getUser(req);
  if (!user) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const allowed = await requireAllowedUser(user);
  if (!allowed.ok) {
    return json({ ok: false, error: allowed.error }, allowed.status as number);
  }

  try {
    const today = new Date();
    const from = formatDate(addDays(today, -1));
    const to = formatDate(addDays(today, 60));

    const season = await getActiveNhlSeason();
    const url = `${NHL_BASE}/club-schedule-season/${TEAM}/${season}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Canes-Rivalry-App/1.0",
      },
    });

    if (!res.ok) throw new Error(`NHL API failed: ${res.status}`);

    const data = await res.json();

    const games = (data.games || [])
      .filter((g: any) => {
        const d = String(g.gameDate || "").slice(0, 10);
        return d >= from && d <= to;
      })
      .map((g: any) => {
        const isHome = g.homeTeam?.abbrev === TEAM;
        const opponent = isHome ? g.awayTeam?.abbrev : g.homeTeam?.abbrev;

        const gameType =
          Number(g.gameType) === 3 ||
          String(g.gameType || "").toLowerCase().includes("playoff")
            ? "Playoffs"
            : "Regular Season";

        return {
          nhl_game_id: String(g.id),
          game_date: String(g.gameDate || "").slice(0, 10),
          game_start_time: g.startTimeUTC || null,
          opponent,
          home_away: isHome ? "Home" : "Away",
          game_type: gameType,
          nhl_game_state: g.gameState || "PRE",
        };
      });

    return json({
      ok: true,
      authorizedVia: "allowed_user",
      authorizedEmail: allowed.email,
      season,
      count: games.length,
      games,
    });
  } catch (err) {
    return json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});