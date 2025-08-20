export interface AvsRates
{
  employeeContributionRate: number;
  employerContributionRate: number;
  minMonthlyPension: number;
  maxMonthlyPension: number;
}

export interface LppRates
{
  entryThreshold: number;
  coordinationDeduction: number;
  minCoordinatedSalary: number;
  maxCoordinatedSalary: number;
  minInterestRate: number;
  ageCreditRates: Record<string, number>;
}

export interface Pillar3aRates
{
  maxEmployeeContribution: number;
  maxSelfEmployedContribution: number;
  returnRates: {
    prudent: number;
    realistic: number;
    optimistic: number;
  };
}
