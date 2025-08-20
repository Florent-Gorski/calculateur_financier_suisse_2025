import Big from "big.js";
import rates from "../../config/rates-2025.json";

/**
 * 3a 2025:
 * - Avec LPP: plafond fixe.
 * - Sans LPP: 20% du revenu net, plafonné.
 * - Option: économie d'impôt = versement * taux marginal (%).
 */
export class Pillar3aCalculator
{
  static maxAllowed(input: { annualIncome: Big; hasPensionFund: boolean })
  {
    const { annualIncome, hasPensionFund } = input;
    if (!(annualIncome instanceof Big) || annualIncome.lt(0)) {
      throw new Error("annualIncome must be a non-negative Big");
    }

    const p3a = (rates as any).pillar3a;
    if (hasPensionFund) {
      return new Big(p3a.withPensionFundMax);
    } else {
      const raw = annualIncome.times(p3a.withoutPensionFundPercent).div(100);
      const cap = new Big(p3a.withoutPensionFundCap);
      // min(raw, cap) sans Big.min
      return raw.gt(cap) ? cap : raw;
    }
  }

  static estimateTaxSaving(input: { deposit: Big; marginalRatePct: number })
  {
    const { deposit, marginalRatePct } = input;
    if (!(deposit instanceof Big) || deposit.lt(0)) throw new Error("deposit must be >= 0");
    if (marginalRatePct < 0 || marginalRatePct > 50) throw new Error("marginalRatePct 0..50");
    return deposit.times(marginalRatePct).div(100);
  }
}
