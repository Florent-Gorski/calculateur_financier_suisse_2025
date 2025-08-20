import type { Handler } from "@netlify/functions";
import crypto from "crypto";

const API_BASE = "https://api.drtax.ch";

// Endpoints (d’après la doc de ton screenshot). Ajuste si la doc précise autre chose.
const ALLOWLIST = new Set<string>([
  "/CantonList",
  "/TaxCommunityList",
  "/MaritalStatusList",
  "/ReligiousAffiliationList",
  "/ResidenceList",
  "/LegalFormList",
  "/ChurchCommunityList",
  "/ResidentialCommunityList"
]);

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
  if (event.httpMethod === "OPTIONS") return cors(204, "", "text/plain", origin);

  try {
    const apiKey = process.env.DRTAX_API_KEY;
    const apiSecret = process.env.DRTAX_API_SECRET;
    if (!apiKey || !apiSecret) return cors(500, JSON.stringify({ error: "Missing DrTax credentials" }), "application/json", origin);

    const urlObj = new URL(event.rawUrl);
    const path = urlObj.searchParams.get("path") || "";
    if (!ALLOWLIST.has(path)) return cors(400, JSON.stringify({ error: "Path not allowed", path }), "application/json", origin);

    const client = event.httpMethod === "POST" && event.body ? JSON.parse(event.body) : {};
    const payload = client?.payload || {}; // ex: { canton: 22, language: "fr" }

    const drtaxBody = { key: apiKey, ...payload };
    const bodyStr = JSON.stringify(drtaxBody);
    const signature = crypto.createHmac("sha256", apiSecret).update(bodyStr).digest("hex");

    const resp = await fetch(`${API_BASE}${path}`, {
      method: "POST", // la doc montre POST; adapte si nécessaire
      headers: { "Content-Type": "application/json", "X-Signature": signature },
      body: bodyStr
    });

    const text = await resp.text();
    return cors(resp.status, text, "application/json", origin);
  } catch (err: any) {
    return cors(500, JSON.stringify({ error: err?.message || "Internal error" }), "application/json", origin);
  }
};
