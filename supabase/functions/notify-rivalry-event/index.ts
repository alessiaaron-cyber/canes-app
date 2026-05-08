import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

const serviceDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const authDb = createClient(SUPABASE_URL, ANON_KEY);

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const ACTIVE_DEVICE_SKIP_SECONDS = 75;
const SPOILER_DELAY_MS = 90_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

async function logOnce(gameId: number, eventKey: string, payload: Record<string, unknown>) {
  const { error } = await serviceDb.from("rivalry_events").insert({
    game_id: gameId,
    event_type: "push_notification",
    event_key: eventKey,
    payload,
  });

  if (!error) return true;
  if ((error as any).code === "23505") return false;

  console.error("rivalry_events insert failed:", error);
  return false;
}

async function enqueueDelayedNotification(
  gameId: number,
  eventKey: string,
  title: string,
  message: string,
  payload: Record<string, unknown>,
  triggeredBy: string,
  suppressSelf: boolean,
) {
  const visibleAfter = new Date(Date.now() + SPOILER_DELAY_MS).toISOString();

  const { error } = await serviceDb.from("delayed_notifications").insert({
    game_id: gameId,
    event_key: eventKey,
    title,
    message,
    payload,
    triggered_by: triggeredBy,
    suppress_self: suppressSelf,
    visible_after: visibleAfter,
  });

  if (!error) return { inserted: true, visible_after: visibleAfter };
  if ((error as any).code === "23505") return { inserted: false, visible_after: visibleAfter };

  console.error("delayed_notifications insert failed:", error);
  throw error;
}

function isRecentlyActive(lastSeenAt: unknown) {
  if (!lastSeenAt) return false;

  const lastSeenMs = new Date(String(lastSeenAt)).getTime();
  if (!Number.isFinite(lastSeenMs)) return false;

  const ageSeconds = (Date.now() - lastSeenMs) / 1000;
  return ageSeconds >= 0 && ageSeconds <= ACTIVE_DEVICE_SKIP_SECONDS;
}

async function sendPush(
  title: string,
  body: string,
  tag: string,
  gameId: number,
  triggeredBy: string,
  suppressSelf: boolean,
) {
  const { data: subs, error } = await serviceDb.from("push_subscriptions").select("*");

  if (error) {
    console.error("push_subscriptions lookup failed:", error);
    return { attempted: 0, sent: 0, skipped_self: 0, skipped_active: 0, removed: 0 };
  }

  const triggerEmail = String(triggeredBy || "").toLowerCase().trim();

  let attempted = 0;
  let sent = 0;
  let skippedSelf = 0;
  let skippedActive = 0;
  let removed = 0;

  for (const sub of subs || []) {
    const subEmail = String(sub.user_email || "").toLowerCase().trim();

    if (suppressSelf && triggerEmail && subEmail && subEmail === triggerEmail) {
      skippedSelf += 1;
      continue;
    }

    if (isRecentlyActive(sub.last_seen_at)) {
      skippedActive += 1;
      continue;
    }

    attempted += 1;

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({
          title,
          body,
          tag,
          url: "/",
          game_id: gameId,
          triggered_by: triggeredBy,
          triggered_by_name: "App",
        }),
      );

      sent += 1;
    } catch (err: any) {
      console.error("push send failed:", err?.statusCode || err?.message || err);

      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await serviceDb.from("push_subscriptions").delete().eq("id", sub.id);
        removed += 1;
      }
    }
  }

  return { attempted, sent, skipped_self: skippedSelf, skipped_active: skippedActive, removed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
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
    const body = await req.json().catch(() => ({}));

    const gameId = Number(body?.game_id);
    const title = String(body?.title || "").trim();
    const message = String(body?.message || "").trim();
    const eventKey = String(body?.event_key || "").trim();
    const suppressSelf = body?.suppress_self === true;
    const delayVisible = body?.delay_visible === true;

    if (!gameId) return json({ ok: false, error: "Missing game_id" }, 400);
    if (!title) return json({ ok: false, error: "Missing title" }, 400);
    if (!message) return json({ ok: false, error: "Missing message" }, 400);
    if (!eventKey) return json({ ok: false, error: "Missing event_key" }, 400);

    const payload = {
      title,
      message,
      tag: eventKey,
      url: "/",
      game_id: gameId,
      triggered_by: allowed.email,
      triggered_by_name: "App",
      suppress_self: suppressSelf,
      delay_visible: delayVisible,
    };

    if (delayVisible) {
      const queued = await enqueueDelayedNotification(
        gameId,
        eventKey,
        title,
        message,
        payload,
        allowed.email as string,
        suppressSelf,
      );

      return json({
        ok: true,
        delayed: true,
        deduped: !queued.inserted,
        notification: {
          title,
          message,
          event_key: eventKey,
          visible_after: queued.visible_after,
          push: { attempted: 0, sent: 0, skipped_self: 0, skipped_active: 0, removed: 0 },
        },
      });
    }

    const inserted = await logOnce(gameId, eventKey, payload);

    if (!inserted) {
      return json({
        ok: true,
        delayed: false,
        deduped: true,
        notification: {
          title,
          message,
          event_key: eventKey,
          push: { attempted: 0, sent: 0, skipped_self: 0, skipped_active: 0, removed: 0 },
        },
      });
    }

    const push = await sendPush(
      title,
      message,
      eventKey,
      gameId,
      allowed.email as string,
      suppressSelf,
    );

    return json({
      ok: true,
      delayed: false,
      deduped: false,
      notification: {
        title,
        message,
        event_key: eventKey,
        push,
      },
    });
  } catch (err: any) {
    console.error("notify-rivalry-event failed:", err);

    return json(
      {
        ok: false,
        error: err?.message || String(err),
      },
      500,
    );
  }
});
