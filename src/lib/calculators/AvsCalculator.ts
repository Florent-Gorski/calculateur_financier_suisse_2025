// src/lib/calculators/AvsCalculator.ts
import Big from "big.js";
import type { AvsInput, AvsOutput } from "../../types/avs.types";
import { getRates2025Normalized } from "../../utils/loadRates";

/**
 * Estimation simplifiée AVS/AI/APG sur revenu salarié annuel.
 * - On lit les taux depuis rates-2025.json, quelle que soit sa forme (A ou B).
 * - aiApgPct est par défaut à 0 si non fourni.
 */
export function computeAvsContribution(input: AvsInput): AvsOutput
{
  const { annualIncomeCHF } = input;
  if (!Number.isFinite(annualIncomeCHF) || annualIncomeCHF < 0) {
    throw new Error("annualIncomeCHF must be a non-negative finite number");
  }

  const { avs } = getRates2025Normalized();
  const employeePct = avs.employeePct;
  const employerPct = avs.employerPct;
  const aiApgPct = avs.aiApgPct ?? 0;

  const totalPct = new Big(employeePct).plus(employerPct).plus(aiApgPct);
  const base = new Big(annualIncomeCHF);

  const employeeCHF = base.times(employeePct).div(100);
  const employerCHF = base.times(employerPct).div(100);
  const aiApgCHF = base.times(aiApgPct).div(100);
  const totalCHF = employeeCHF.plus(employerCHF).plus(aiApgCHF);

  return {
    appliedRatePct: Number(totalPct.toString()),
    totalContributionCHF: Number(totalCHF.round(2, 1).toString()),
    breakdown: {
      employeePct,
      employerPct,
      aiApgPct,
      employeeCHF: Number(employeeCHF.round(2, 1).toString()),
      employerCHF: Number(employerCHF.round(2, 1).toString()),
      aiApgCHF: Number(aiApgCHF.round(2, 1).toString())
    }
  };
}
