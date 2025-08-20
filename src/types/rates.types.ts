// src/types/rates.types.ts
import { z } from "zod";

/** --- Forme A (celle que tu as) -----------------------------------------
 * avs: { employeeContributionRate, employerContributionRate, minMonthlyPension, maxMonthlyPension }
 * lpp, pillar3a, ... (autres sections possibles)
 */
export const AvsShapeA = z.object({
  employeeContributionRate: z.number(), // ex: 5.3
  employerContributionRate: z.number(), // ex: 5.3
  minMonthlyPension: z.number().optional(),
  maxMonthlyPension: z.number().optional()
});

/** --- Forme B (celle que j’avais proposée) -------------------------------
 * avs: { employeePct, employerPct, aiApgPct }
 */
export const AvsShapeB = z.object({
  employeePct: z.number(),
  employerPct: z.number(),
  aiApgPct: z.number().optional().default(0)
});

// Le bloc AVS peut être A ou B.
export const AvsUnion = z.union([AvsShapeA, AvsShapeB]);

// Schéma global très permissif pour laisser passer d’autres sections (lpp, 3a, mortgage, tax, ...)
export const Rates2025Schema = z.object({
  avs: AvsUnion,
}).passthrough();

export type Rates2025 = z.infer<typeof Rates2025Schema>;

/** Forme normalisée utilisée par nos calculateurs */
export type AvsNormalized = {
  employeePct: number;
  employerPct: number;
  aiApgPct: number; // default 0 si absent
};
