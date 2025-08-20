import type { Handler } from "@netlify/functions";
import crypto from "crypto";

const API_URL = "https://api.drtax.ch/NP"; // ou /TaxCalculator/NP selon ton doc; adapte si besoin

function cors(statusCode: number, body: string, contentType = "application/json", origin?: string)
{
  const wl = (process.env.ORIGIN_WHITELIST || "*").split(",").map(s => s.trim()).filter(Boolean);
  const allowOrigin = origin && wl.some(o => o === origin) ? origin : (wl.includes("*") ? "*" : (wl[0] || "*"));
  return {
    statusCode,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body
  };
}

export const handler: Handler = async (event) =>
{
  const origin = event.headers?.origin || event.headers?.Origin;

  // Health check: GET /.netlify/functions/drtax-np?health=1
  if (event.httpMethod === "GET" && new URL(event.rawUrl).searchParams.get("health") === "1") {
    const ok = Boolean(process.env.DRTAX_API_KEY && process.env.DRTAX_API_SECRET);
    return cors(200, JSON.stringify({ ready: ok }), "application/json", origin);
  }

  if (event.httpMethod === "OPTIONS") return cors(204, "", "text/plain", origin);
  if (event.httpMethod !== "POST") return cors(405, JSON.stringify({ error: "Method Not Allowed" }), "application/json", origin);

  try {
    const apiKey = process.env.DRTAX_API_KEY;
    const apiSecret = process.env.DRTAX_API_SECRET;
    if (!apiKey || !apiSecret) return cors(500, JSON.stringify({ error: "Missing DrTax credentials" }), "application/json", origin);

    const clientPayload = JSON.parse(event.body || "{}");
    const drtaxBody = { ...clientPayload, key: apiKey };
    const bodyStr = JSON.stringify(drtaxBody);

    const signature = crypto.createHmac("sha256", apiSecret).update(bodyStr).digest("hex");

    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Signature": signature },
      body: bodyStr
    });

    const text = await resp.text();
    return cors(resp.status, text, "application/json", origin);
  } catch (err: any) {
    return cors(500, JSON.stringify({ error: err?.message || "Internal error" }), "application/json", origin);
  }
};
