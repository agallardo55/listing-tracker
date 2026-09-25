/**
 * Casa — persistent state API
 * GET  /api/state        → return stored state JSON
 * PUT  /api/state        → overwrite stored state JSON
 *
 * Cloudflare Pages Function; KV binding: CASA_STATE
 * Key: "state"
 */

const KEY = "state";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  const raw = await env.CASA_STATE.get(KEY);
  if (!raw) return new Response("null", { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  return new Response(raw, { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
}

export async function onRequestPut({ request, env }) {
  const body = await request.text();
  try { JSON.parse(body); } catch {
    return new Response("Bad JSON", { status: 400, headers: CORS });
  }
  await env.CASA_STATE.put(KEY, body);
  return new Response("ok", { status: 200, headers: CORS });
}
