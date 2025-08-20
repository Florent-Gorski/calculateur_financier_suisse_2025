import Big from 'big.js';
import { AvsInput } from '../types/user-inputs.types';
import { AvsResult } from '../types/calculation-results.types';

export class AvsCalculator
{
  static calculate(input: AvsInput): AvsResult
  {
    const { grossSalary, isSelfEmployed } = input;
    const totalContributionRate = 0.106;
    const annualContribution = grossSalary.times(totalContributionRate);
    const monthlyPension = AvsCalculator.estimateMonthlyPension(grossSalary, isSelfEmployed);

    return {
      annualContribution: annualContribution.round(2, Big.roundDown),
      monthlyPension: monthlyPension.round(2, Big.roundDown),
    };
  }

  private static estimateMonthlyPension(grossSalary: Big, isSelfEmployed: boolean): Big
  {
    const averageSalary = grossSalary.div(12);
    const pensionRate = isSelfEmployed ? 0.05 : 0.06;
    return averageSalary.times(pensionRate).min(2520).max(1260);
  }
}
