import type { Handler } from "@netlify/functions";
import crypto from "crypto";

const API_BASE = "https://api.drtax.ch";

const ALLOWLIST = new Set<string>([
  // ⚠️ à ajuster selon la doc officielle DrTax :
  "/PickLists/Canton",                 // ex: liste cantons
  "/PickLists/TaxCommunity",           // ex: communes/paroisses fiscales
  "/PickLists/ReligiousAffiliation",   // ex: confessions
  "/PickLists/MaritalStatus"           // ex: statuts familiaux
]);

export const handler: Handler = async (event: { httpMethod: string; rawUrl: string | URL; }) =>
{
  const cors = (statusCode: number, body: string, contentType = "application/json") => ({
    statusCode,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body
  });

  if (event.httpMethod === "OPTIONS") return cors(204, "");

  try {
    const apiKey = process.env.DRTAX_API_KEY;
    const apiSecret = process.env.DRTAX_API_SECRET;
    if (!apiKey || !apiSecret) {
      return cors(500, JSON.stringify({ error: "Missing DrTax credentials" }));
    }

    // Le front envoie ?path=/PickLists/Canton
    const path = new URL(event.rawUrl).searchParams.get("path") || "";
    if (!ALLOWLIST.has(path)) {
      return cors(400, JSON.stringify({ error: "Path not allowed" }));
    }

    const body = { key: apiKey }; // si DrTax exige la clé dans le body
    const bodyStr = JSON.stringify(body);
    const signature = crypto.createHmac("sha256", apiSecret).update(bodyStr).digest("hex");

    const url = `${API_BASE}${path}`;
    const resp = await fetch(url, {
      method: "POST", // si GET n'est pas prévu ; adapte selon doc
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature
      },
      body: bodyStr
    });

    const text = await resp.text();
    return cors(resp.status, text);
  } catch (err: any) {
    return cors(500, JSON.stringify({ error: err?.message || "Internal error" }));
  }
};
