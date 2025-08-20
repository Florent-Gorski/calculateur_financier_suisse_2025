import Big from "big.js";
import federal from "../../config/tax-2025/federal.json";
import vd from "../../config/tax-2025/cantons/VD.json";

/**
 * Fiscalité (très simplifiée, démo) :
 * - Barème fédéral + barème cantonal VD (exemple).
 * - On calcule séparément, puis on additionne (approximatif).
 */
export class TaxCalculator
{
  static calculate(input: { taxableIncome: Big; canton: string })
  {
    const { taxableIncome, canton } = input;
    if (!(taxableIncome instanceof Big) || taxableIncome.lt(0)) {
      throw new Error("taxableIncome must be a non-negative Big");
    }

    const fedTax = TaxCalculator.progressiveTax(taxableIncome, federal.brackets);
    const cantTax = TaxCalculator.progressiveTax(
      taxableIncome,
      (canton === "VD" ? vd.brackets : (vd.brackets)) // fallback VD pour la démo
    );

    const total = fedTax.plus(cantTax);

    // marge approximative = dernière tranche applicable
    const marginalRate =
      TaxCalculator.marginalRateFor(taxableIncome, federal.brackets) +
      TaxCalculator.marginalRateFor(taxableIncome, (canton === "VD" ? vd.brackets : vd.brackets));

    return {
      federal: fedTax.round(2, Big.roundHalfUp),
      cantonal: cantTax.round(2, Big.roundHalfUp),
      total: total.round(2, Big.roundHalfUp),
      marginalRatePct: marginalRate
    };
  }

  private static progressiveTax(income: Big, brackets: { upTo: number; ratePct: number }[])
  {
    let remaining = new Big(income);
    let acc = new Big(0);
    let lastCap = new Big(0);

    for (const b of brackets) {
      const cap = new Big(b.upTo);
      const chunk = Big.min(remaining, cap.minus(lastCap).max(0));
      if (chunk.lte(0)) continue;
      acc = acc.plus(chunk.times(b.ratePct).div(100));
      remaining = remaining.minus(chunk);
      lastCap = cap;
      if (remaining.lte(0)) break;
    }
    if (remaining.gt(0)) {
      const lastRate = brackets[brackets.length - 1]?.ratePct ?? 0;
      acc = acc.plus(remaining.times(lastRate).div(100));
    }
    return acc;
  }

  private static marginalRateFor(income: Big, brackets: { upTo: number; ratePct: number }[])
  {
    for (const b of brackets) {
      if (income.lte(b.upTo)) return b.ratePct;
    }
    return brackets[brackets.length - 1]?.ratePct ?? 0;
  }
}
