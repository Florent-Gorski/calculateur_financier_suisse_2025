import Big from "big.js";
import cfg from "../../config/mortgage-params-2025.json";

/**
 * Hypothèque (règles usuelles Suisse, 2025):
 * - LTV max 80% (minEquityPct=20).
 * - Intérêt théorique (stress) 5% + charges 1% du prix.
 * - Amortir à 65% en ≤15 ans si LTV>65%.
 * - Solvable si coût annuel total <= 33% du revenu brut.
 */
export class MortgageCalculator
{
  static calculate(input: {
    propertyPrice: Big;
    equity: Big;
    ratePct?: number;         // optionnel: si tu veux remplacer le stress
    annualIncome: Big;
  })
  {
    const { propertyPrice, equity, ratePct, annualIncome } = input;
    if (!(propertyPrice instanceof Big) || propertyPrice.lte(0)) throw new Error("propertyPrice must be > 0");
    if (!(equity instanceof Big) || equity.lt(0)) throw new Error("equity must be >= 0");
    if (!(annualIncome instanceof Big) || annualIncome.lte(0)) throw new Error("annualIncome must be > 0");

    const STRESS = new Big(cfg.stressRatePct);
    const CHARGES = new Big(cfg.fixedChargesPct);
    const MIN_EQ_PCT = new Big(cfg.minEquityPct);
    const TARGET_LTV = new Big(cfg.targetLtvPct);
    const AMORT_YEARS = new Big(cfg.amortMaxYears);
    const AFF_THRESH = new Big(cfg.affordabilityThresholdPct);

    const price = propertyPrice;

    // loan = max(price - equity, 0)
    const loanRaw = price.minus(equity);
    const loan = loanRaw.lt(0) ? new Big(0) : loanRaw;

    const ltvPct = loan.div(price).times(100);
    const equityPct = equity.div(price).times(100);
    const equityOK = equityPct.gte(MIN_EQ_PCT);

    // Intérêt théorique: max(stress, inputRate)
    const inputRate = new Big(ratePct ?? 0);
    const effRate = inputRate.gt(STRESS) ? inputRate : STRESS;
    const annualInterest = loan.times(effRate).div(100);

    // Charges d'entretien
    const annualCharges = price.times(CHARGES).div(100);

    // Amortissement obligatoire (si LTV > 65%) jusqu'à 65% en ≤ 15 ans
    const targetLoan = price.times(TARGET_LTV).div(100); // 65% du prix
    const amortBaseRaw = loan.minus(targetLoan);
    const amortBase = amortBaseRaw.lt(0) ? new Big(0) : amortBaseRaw;
    const annualAmort = amortBase.div(AMORT_YEARS);

    // Coût annuel total & ratio d'effort
    const annualCost = annualInterest.plus(annualCharges).plus(annualAmort);
    const affordabilityPct = annualCost.div(annualIncome).times(100);

    const affordable = affordabilityPct.lte(AFF_THRESH) && equityOK;

    return {
      loanAmount: loan.round(2, Big.roundHalfUp),
      ltvPct: Number(ltvPct.round(2, Big.roundHalfUp).toString()),
      equityPct: Number(equityPct.round(2, Big.roundHalfUp).toString()),
      equityOK,
      annualInterest: annualInterest.round(2, Big.roundHalfUp),
      annualCharges: annualCharges.round(2, Big.roundHalfUp),
      annualAmort: annualAmort.round(2, Big.roundHalfUp),
      annualCost: annualCost.round(2, Big.roundHalfUp),
      affordabilityPct: Number(affordabilityPct.round(2, Big.roundHalfUp).toString()),
      affordable,
      params: {
        stressRatePct: Number(STRESS.toString()),
        fixedChargesPct: Number(CHARGES.toString()),
        targetLtvPct: Number(TARGET_LTV.toString()),
        amortMaxYears: Number(AMORT_YEARS.toString()),
        thresholdPct: Number(AFF_THRESH.toString())
      }
    };
  }
}
