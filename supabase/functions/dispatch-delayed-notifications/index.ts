import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const serviceDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const ACTIVE_DEVICE_SKIP_SECONDS = 75;
const BATCH_LIMIT = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
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

function isRecentlyActive(lastSeenAt: unknown) {
  if (!lastSeenAt) return false;

  const lastSeenMs = new Date(String(lastSeenAt)).getTime();
  if (!Number.isFinite(lastSeenMs)) return false;

  const ageSeconds = (Date.now() - lastSeenMs) / 1000;
  return ageSeconds >= 0 && ageSeconds <= ACTIVE_DEVICE_SKIP_SECONDS;
}

async function logVisibleEvent(
  gameId: number,
  eventKey: string,
  payload: Record<string, unknown>,
) {
  const { error } = await serviceDb.from("rivalry_events").insert({
    game_id: gameId,
    event_type: "push_notification",
    event_key: eventKey,
    payload,
  });

  if (!error) return true;
  if ((error as any).code === "23505") return false;

  console.error("rivalry_events insert failed:", error);
  throw error;
}

async function sendPush(
  title: string,
  body: string,
  tag: string,
  gameId: number,
  triggeredBy: string,
  suppressSelf: boolean,
  payload: Record<string, unknown> = {},
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
          ...payload,
          title,
          body,
          tag,
          url: String(payload.url || "/"),
          game_id: gameId,
          triggered_by: triggeredBy,
          triggered_by_name: String(payload.triggered_by_name || "App"),
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

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const suppliedSecret = req.headers.get("x-cron-secret") || "";
  if (!CRON_SECRET || suppliedSecret !== CRON_SECRET) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const nowIso = new Date().toISOString();

    const { data: rows, error } = await serviceDb
      .from("delayed_notifications")
      .select("id, game_id, event_key, title, message, payload, triggered_by, suppress_self, visible_after, sent_at, created_at")
      .is("sent_at", null)
      .lte("visible_after", nowIso)
      .order("visible_after", { ascending: true })
      .limit(BATCH_LIMIT);

    if (error) {
      console.error("delayed_notifications lookup failed:", error);
      return json({ ok: false, error: "Failed to load delayed notifications" }, 500);
    }

    if (!rows || rows.length === 0) {
      return json({ ok: true, processed: 0, skipped: 0, deduped: 0, failed: 0, push_attempted: 0, push_sent: 0 });
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;
    let deduped = 0;
    let pushAttempted = 0;
    let pushSent = 0;

    for (const row of rows) {
      const claimTime = new Date().toISOString();

      const { data: claimedRow, error: claimError } = await serviceDb
        .from("delayed_notifications")
        .update({ sent_at: claimTime })
        .eq("id", row.id)
        .is("sent_at", null)
        .select("id")
        .maybeSingle();

      if (claimError) {
        console.error(`failed to claim delayed notification ${row.id}:`, claimError);
        failed += 1;
        continue;
      }

      if (!claimedRow) {
        skipped += 1;
        continue;
      }

      try {
        const title = String(row.title || "").trim();
        const message = String(row.message || "").trim();
        const eventKey = String(row.event_key || "").trim();
        const gameId = Number(row.game_id || 0);
        const triggeredBy = String(row.triggered_by || "").trim();
        const suppressSelf = row.suppress_self === true;
        const storedPayload = (row.payload && typeof row.payload === "object")
          ? row.payload as Record<string, unknown>
          : {};

        const visiblePayload = {
          ...storedPayload,
          title,
          message,
          tag: eventKey,
          url: String(storedPayload.url || "/"),
          game_id: gameId,
          triggered_by: triggeredBy,
          triggered_by_name: String(storedPayload.triggered_by_name || "App"),
          suppress_self: suppressSelf,
        };

        const insertedVisibleEvent = await logVisibleEvent(gameId, eventKey, visiblePayload);

        if (!insertedVisibleEvent) {
          deduped += 1;
          processed += 1;
          continue;
        }

        const push = await sendPush(
          title,
          message,
          eventKey,
          gameId,
          triggeredBy,
          suppressSelf,
          visiblePayload,
        );

        processed += 1;
        pushAttempted += Number(push.attempted || 0);
        pushSent += Number(push.sent || 0);
      } catch (err) {
        console.error(`failed to dispatch delayed notification ${row.id}:`, err);

        await serviceDb
          .from("delayed_notifications")
          .update({ sent_at: null })
          .eq("id", row.id);

        failed += 1;
      }
    }

    return json({
      ok: true,
      processed,
      skipped,
      deduped,
      failed,
      push_attempted: pushAttempted,
      push_sent: pushSent,
    });
  } catch (err: any) {
    console.error("dispatch-delayed-notifications failed:", err);
    return json({ ok: false, error: err?.message || String(err) }, 500);
  }
});
