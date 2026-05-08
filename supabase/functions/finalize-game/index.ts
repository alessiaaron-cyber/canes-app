import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const serviceDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const authDb = createClient(SUPABASE_URL, ANON_KEY);

const SPOILER_DELAY_MS = 90_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function isAuthorized(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret && cronSecret === CRON_SECRET) {
    return { ok: true, via: "cron", user: null, email: "finalize-game" };
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false, via: "none", user: null, email: null, error: "Unauthorized", status: 401 };
  }

  const { data, error } = await authDb.auth.getUser(token);

  if (error || !data?.user) {
    return { ok: false, via: "auth", user: null, email: null, error: "Unauthorized", status: 401 };
  }

  const userEmail = String(data.user.email || "").toLowerCase().trim();

  if (!userEmail) {
    return { ok: false, via: "auth", user: data.user, email: null, error: "Missing user email", status: 401 };
  }

  const { data: allowedUser, error: allowedError } = await serviceDb
    .from("allowed_users")
    .select("email")
    .ilike("email", userEmail)
    .maybeSingle();

  if (allowedError) {
    console.error("allowed_users lookup failed:", allowedError);
    return { ok: false, via: "auth", user: data.user, email: userEmail, error: "Authorization check failed", status: 500 };
  }

  if (!allowedUser) {
    return { ok: false, via: "auth", user: data.user, email: userEmail, error: "Forbidden", status: 403 };
  }

  return { ok: true, via: "auth", user: data.user, email: userEmail };
}

function normalizeName(name: any) {
  return String(name || "")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nameMatches(a: any, b: any) {
  const aa = normalizeName(a);
  const bb = normalizeName(b);
  if (!aa || !bb) return false;
  if (aa === bb) return true;

  const ap = aa.split(" ").filter(Boolean);
  const bp = bb.split(" ").filter(Boolean);

  if ([...ap].sort().join(" ") === [...bp].sort().join(" ")) return true;

  return !!ap.at(-1) && !!bp.at(-1) && ap.at(-1) === bp.at(-1);
}

function pickPoints(playerName: string, goals: number, assists: number, firstGoal: string) {
  const g = Number(goals || 0);
  const a = Number(assists || 0);
  const bonus =
    playerName && firstGoal && nameMatches(playerName, firstGoal) && g > 0 ? 1 : 0;

  return g * 2 + a + bonus;
}

function winner(a: number, j: number) {
  return a > j ? "Aaron" : j > a ? "Julie" : "Tie";
}

function buildRecap(game: any, a: number, j: number) {
  const w = winner(a, j);
  const matchup =
    game?.opponent && game.opponent !== "Next Game"
      ? `vs ${game.opponent}`
      : "Final Result";

  if (w === "Tie") {
    return `Tie ${a}-${j}. ${matchup}. Nobody gets bragging rights, which frankly feels illegal.`;
  }

  const loser = w === "Aaron" ? "Julie" : "Aaron";
  return `${w} wins ${a}-${j}. ${matchup}. ${loser} may file a formal complaint with the Department of Rivalry Affairs.`;
}

function buildFinalMessage(a: number, j: number) {
  const w = winner(a, j);
  const score = `Aaron ${a} – Julie ${j}`;

  if (w === "Tie") {
    return {
      title: "Final",
      body: `Tie game. ${score}. Chaos.`,
    };
  }

  return {
    title: "Final",
    body: `${w} takes it. ${score}.`,
  };
}

async function enqueueFinalNotification(gameId: number, title: string, body: string) {
  const eventKey = `final-${gameId}`;
  const visibleAfter = new Date(Date.now() + SPOILER_DELAY_MS).toISOString();

  const payload = {
    title,
    message: body,
    tag: eventKey,
    url: "/",
    game_id: gameId,
    triggered_by: "finalize-game",
    triggered_by_name: "Finalize Game",
    delay_visible: true,
    suppress_self: false,
  };

  const { error } = await serviceDb.from("delayed_notifications").insert({
    game_id: gameId,
    event_key: eventKey,
    title,
    message: body,
    payload,
    triggered_by: "finalize-game",
    suppress_self: false,
    visible_after: visibleAfter,
  });

  if (!error) {
    return {
      delayed: true,
      deduped: false,
      title,
      body,
      event_key: eventKey,
      visible_after: visibleAfter,
      push: { attempted: 0, sent: 0, removed: 0 },
    };
  }

  if ((error as any).code === "23505") {
    return {
      delayed: true,
      deduped: true,
      title,
      body,
      event_key: eventKey,
      visible_after: visibleAfter,
      push: { attempted: 0, sent: 0, removed: 0 },
    };
  }

  console.error("delayed final notification insert failed:", error);
  throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  const auth = await isAuthorized(req);

  if (!auth.ok) {
    return json({ ok: false, error: auth.error || "Unauthorized" }, auth.status || 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const gameId = Number(body?.game_id);

    if (!gameId) {
      return json({ ok: false, error: "Missing game_id" }, 400);
    }

    const { data: game, error: gameError } = await serviceDb
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError) throw gameError;
    if (!game) return json({ ok: false, error: "Game not found" }, 404);

    if (game.status === "Final") {
      return json({
        ok: true,
        alreadyFinal: true,
        authorizedVia: auth.via,
        game_id: gameId,
        score: {
          Aaron: Number(game.aaron_points || 0),
          Julie: Number(game.julie_points || 0),
        },
        winner: game.winner || winner(Number(game.aaron_points || 0), Number(game.julie_points || 0)),
        recap: game.recap || "",
        notification: {
          skipped: "already-final",
          sent: false,
        },
      });
    }

    const { data: picks, error: picksError } = await serviceDb
      .from("picks")
      .select("*")
      .eq("game_id", gameId)
      .order("owner")
      .order("pick_slot");

    if (picksError) throw picksError;

    const filledPicks = (picks || []).filter((p: any) =>
      String(p.player_name || "").trim(),
    );

    if (filledPicks.length < 4) {
      return json(
        {
          ok: false,
          error: "Pick all 4 players first.",
          game_id: gameId,
          filledPicks: filledPicks.length,
        },
        400,
      );
    }

    const names = filledPicks.map((p: any) => normalizeName(p.player_name));
    if (new Set(names).size !== names.length) {
      return json(
        {
          ok: false,
          error: "Each player can only be picked once for this game.",
          game_id: gameId,
        },
        400,
      );
    }

    let aaronPoints = 0;
    let juliePoints = 0;

    for (const pick of picks || []) {
      const points = pickPoints(
        String(pick.player_name || ""),
        Number(pick.goals || 0),
        Number(pick.assists || 0),
        String(game.first_goal_scorer || ""),
      );

      if (Number(points) !== Number(pick.points || 0)) {
        const { error: pickUpdateError } = await serviceDb
          .from("picks")
          .update({ points })
          .eq("id", pick.id);

        if (pickUpdateError) throw pickUpdateError;
      }

      if (pick.owner === "Aaron") aaronPoints += points;
      if (pick.owner === "Julie") juliePoints += points;
    }

    const finalWinner = winner(aaronPoints, juliePoints);
    const recap = buildRecap(game, aaronPoints, juliePoints);

    const { error: updateError } = await serviceDb
      .from("games")
      .update({
        status: "Final",
        aaron_points: aaronPoints,
        julie_points: juliePoints,
        winner: finalWinner,
        recap,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", gameId)
      .neq("status", "Final");

    if (updateError) throw updateError;

    const finalMessage = buildFinalMessage(aaronPoints, juliePoints);
    const notification = await enqueueFinalNotification(
      gameId,
      finalMessage.title,
      finalMessage.body,
    );

    return json({
      ok: true,
      alreadyFinal: false,
      authorizedVia: auth.via,
      game_id: gameId,
      score: { Aaron: aaronPoints, Julie: juliePoints },
      winner: finalWinner,
      recap,
      notification,
    });
  } catch (err: any) {
    console.error("finalize-game failed:", err);

    return json(
      {
        ok: false,
        error: err?.message || String(err),
      },
      500,
    );
  }
});
