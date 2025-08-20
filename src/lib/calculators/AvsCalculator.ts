import Big from "big.js";
import rates from "../../config/rates-2025.json";
import type { AvsInput, AvsOutput } from "../../types/avs.types";

/** Estimation simplifiée AVS/AI/APG sur revenu salarié annuel. */
export function computeAvsContribution(input: AvsInput): AvsOutput
{
  const { annualIncomeCHF } = input;
  if (!Number.isFinite(annualIncomeCHF) || annualIncomeCHF < 0) {
    throw new Error("annualIncomeCHF must be a non-negative finite number");
  }

  const { avs } = rates as {
    avs: { employeePct: number; employerPct: number; aiApgPct: number };
  };

  const employeePct = avs.employeePct; // p.ex. 5.3
  const employerPct = avs.employerPct; // p.ex. 5.3
  const aiApgPct = avs.aiApgPct;       // p.ex. 1.45

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
