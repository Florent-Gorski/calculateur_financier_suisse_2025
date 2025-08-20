// src/services/tax/drtax.ts
export type DrTaxNPBasicData = {
  "tax-year"?: number;
  "marital-status": number;           // index de /MaritalStatusList
  "canton"?: number;                  // index de /CantonList
  "municipality-of-taxation"?: string;
  "zip"?: number;
  "domicile"?: string;
  "religious-affiliation"?: number;   // index de /ReligiousAffiliationList
  "children"?: number;
  "concubinage"?: boolean;
  "tax-liability-from"?: string;      // YYYY-MM-DD
  "tax-liability-till"?: string;      // YYYY-MM-DD
};

export type DrTaxNPFiscal = {
  "taxable-amounts": {
    "cantonal-income": number;
    "cantonal-wealth": number;
    "confederation-income"?: number;
  };
};

export async function drtaxCalculateNP(input: {
  language?: "de" | "fr" | "it" | "en";
  "basic-data": DrTaxNPBasicData;
  "fiscal-factors": DrTaxNPFiscal;
})
{
  const res = await fetch("/.netlify/functions/drtax-np", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(`DrTax error ${res.status}`);
  return res.json();
}
