import { AvsCalculator } from './AvsCalculator';
import Big from 'big.js';

describe('AvsCalculator', () =>
{
  it('calcule correctement la cotisation AVS pour un employé', () =>
  {
    const input = { grossSalary: new Big(60000), isSelfEmployed: false };
    const result = AvsCalculator.calculate(input);
    expect(result.annualContribution.toString()).toBe('6360.00');
    expect(result.monthlyPension.toString()).toBe('1260.00');
  });

  it('calcule correctement la cotisation AVS pour un indépendant', () =>
  {
    const input = { grossSalary: new Big(60000), isSelfEmployed: true };
    const result = AvsCalculator.calculate(input);
    expect(result.annualContribution.toString()).toBe('6360.00');
    expect(result.monthlyPension.toString()).toBe('1260.00');
  });
});
