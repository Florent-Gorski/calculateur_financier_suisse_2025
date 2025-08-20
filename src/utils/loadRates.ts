// src/utils/loadRates.ts
import raw from "../config/rates-2025.json";
import { Rates2025Schema, AvsNormalized } from "../types/rates.types";

let cached: {
  avs: AvsNormalized;
  // On laisse passer le reste si besoin plus tard, via "any"
  [k: string]: any;
} | null = null;

export function getRates2025Normalized()
{
  if (cached) return cached;

  const parsed = Rates2025Schema.parse(raw);

  // Normalisation de la section AVS pour obtenir toujours { employeePct, employerPct, aiApgPct }
  let avs: AvsNormalized;

  if ("employeeContributionRate" in parsed.avs) {
    // === Forme A (ta forme) ===
    avs = {
      employeePct: parsed.avs.employeeContributionRate,
      employerPct: parsed.avs.employerContributionRate,
      aiApgPct: 0 // si non fourni dans la forme A, on met 0 par défaut
    };
  } else {
    // === Forme B (ma forme initiale) ===
    avs = {
      employeePct: parsed.avs.employeePct,
      employerPct: parsed.avs.employerPct,
      aiApgPct: parsed.avs.aiApgPct ?? 0
    };
  }

  cached = { ...parsed, avs };
  return cached!;
}
