import Big from "big.js";
import rates from "../../config/rates-2025.json";

/**
 * LPP 2025 (BVG) – calculs obligatoires:
 * - Salaire assuré si >= seuil d'entrée.
 * - Déduction de coordination, puis clamp entre min/max coordonné.
 * - Crédits vieillesse selon l'âge (7/10/15/18 % du salaire coordonné).
 * - Par défaut, on expose la contribution totale et une répartition 50/50.
 *   (Loi: l'employeur paie au moins la moitié, art. 66 LPP.)
 */
export class LppCalculator
{
  static calculate(input: { annualSalary: Big; age: number })
  {
    const { annualSalary, age } = input;
    if (!(annualSalary instanceof Big) || annualSalary.lte(0)) {
      throw new Error("annualSalary must be > 0 (Big)");
    }
    if (!Number.isFinite(age) || age < 18 || age > 70) {
      throw new Error("age must be between 18 and 70");
    }

    const lpp = (rates as any).lpp;
    const entry = new Big(lpp.entryThreshold);
    const coordDed = new Big(lpp.coordinationDeduction);
    const minCoord = new Big(lpp.minCoordinatedSalary);
    const maxCoord = new Big(lpp.maxCoordinatedSalary);
    const upper = new Big(lpp.upperAnnualSalaryLimit);

    // 1) Salaire pris en compte côté obligatoire (capped = min(annualSalary, upper))
    const capped = annualSalary.gt(upper) ? upper : annualSalary;

    // 2) Salaire coordonné
    let coordinated = new Big(0);
    if (capped.gte(entry)) {
      const base = capped.minus(coordDed); // insuredBase
      if (base.lte(0)) {
        coordinated = new Big(0);
      } else {
        // clamp(base, minCoord, maxCoord)
        const lowerApplied = base.lt(minCoord) ? minCoord : base;
        coordinated = lowerApplied.gt(maxCoord) ? maxCoord : lowerApplied;
      }
    }

    // 3) Taux crédit vieillesse par âge
    const rate = LppCalculator.rateForAge(age, lpp.ageCreditRates); // %
    const annualCredit = coordinated.times(rate).div(100);

    // 4) Répartition 50/50 par défaut
    const employee = annualCredit.div(2);
    const employer = annualCredit.minus(employee);

    return {
      entryThreshold: entry,
      coordinationDeduction: coordDed,
      minCoordinatedSalary: minCoord,
      maxCoordinatedSalary: maxCoord,
      upperAnnualSalaryLimit: upper,
      coordinatedSalary: coordinated.round(2, Big.roundHalfUp),
      creditRatePct: rate,
      annualCreditTotal: annualCredit.round(2, Big.roundHalfUp),
      employeeCredit: employee.round(2, Big.roundHalfUp),
      employerCredit: employer.round(2, Big.roundHalfUp),
      minInterestRatePct: lpp.minInterestRatePct
    };
  }

  private static rateForAge(age: number, table: Record<string, number>)
  {
    for (const k of Object.keys(table)) {
      const [a, b] = k.split("-").map(Number);
      if (age >= a && age <= b) return table[k];
    }
    // Défauts de garde
    if (age < 25) return 0;
    if (age > 65) return table["55-65"] ?? 18;
    return 10;
  }
}
