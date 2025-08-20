import Big from "big.js";
import type { AvsInput } from "../../types/user-inputs.types";
import type { AvsResult } from "../../types/calculation-results.types";
import rates from "../../config/rates-2025.json";

/**
 * AVS calculator:
 * - Lit les taux depuis la config (employeeContributionRate + employerContributionRate en décimal, ex: 0.053).
 * - Estime la rente mensuelle de façon simplifiée (5% indépendant, 6% salarié),
 *   puis applique un clamp entre min/max de la config.
 */
export class AvsCalculator
{
  static calculate(input: AvsInput): AvsResult
  {
    const { grossSalary, isSelfEmployed } = input;

    if (!(grossSalary instanceof Big) || grossSalary.lt(0)) {
      throw new Error("grossSalary must be a non-negative Big instance");
    }

    const avs = (rates as any).avs ?? {};
    const employee = new Big(avs.employeeContributionRate ?? 0); // ex: 0.053
    const employer = new Big(avs.employerContributionRate ?? 0); // ex: 0.053
    const totalContributionRate = employee.plus(employer);        // ex: 0.106

    const annualContribution = grossSalary.times(totalContributionRate);

    const monthlyPension = AvsCalculator.estimateMonthlyPension(
      grossSalary,
      isSelfEmployed,
      avs
    );

    return {
      annualContribution: annualContribution.round(2, Big.roundDown),
      monthlyPension: monthlyPension.round(2, Big.roundDown),
    };
  }

  private static estimateMonthlyPension(
    grossSalary: Big,
    isSelfEmployed: boolean,
    avs: any
  ): Big
  {
    const averageMonthlySalary = grossSalary.div(12);
    const pensionRate = isSelfEmployed ? 0.05 : 0.06; // heuristique simple
    const raw = averageMonthlySalary.times(pensionRate);

    const min = new Big(avs.minMonthlyPension ?? 1260);
    const max = new Big(avs.maxMonthlyPension ?? 2520);

    // Clamp manuel (évite Big.min/Big.max qui ne sont pas toujours typés)
    let clamped = raw;
    if (clamped.lt(min)) clamped = min;
    else if (clamped.gt(max)) clamped = max;

    return clamped;
  }
}
