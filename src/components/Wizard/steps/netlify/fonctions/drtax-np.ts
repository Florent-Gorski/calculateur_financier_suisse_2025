// netlify/functions/drtax-np.ts
import type { Handler } from "@netlify/functions";
import crypto from "crypto";

const API_URL = "https://api.drtax.ch/TaxCalculator/NP";

export const handler: Handler = async (event: { httpMethod: string; body: any; }) =>
{
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.DRTAX_API_KEY!;
    const apiSecret = process.env.DRTAX_API_SECRET!;
    if (!apiKey || !apiSecret) {
      return { statusCode: 500, body: "Missing DrTax credentials" };
    }

    // payload provenant du front (basic-data, fiscal-factors, language)
    const clientPayload = JSON.parse(event.body || "{}");

    // injecte la clé dans le body
    const body = { ...clientPayload, key: apiKey };

    const bodyStr = JSON.stringify(body);
    const signature = crypto.createHmac("sha256", apiSecret).update(bodyStr).digest("hex");

    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature
      },
      body: bodyStr
    });

    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers: { "Content-Type": "application/json" },
      body: text
    };
  } catch (e: any) {
    return { statusCode: 500, body: e?.message ?? "Internal error" };
  }
};
