import { describe, it, expect } from "vitest";
import { computeAvsContribution } from "./AvsCalculator";

describe("computeAvsContribution", () =>
{
  it("computes AVS/AI/APG on a simple annual income", () =>
  {
    const out = computeAvsContribution({ annualIncomeCHF: 100000 });
    expect(out.appliedRatePct).toBeGreaterThan(0);
    expect(out.totalContributionCHF).toBeGreaterThan(0);
    // Coherence of breakdown sum:
    const sum =
      out.breakdown.employeeCHF +
      out.breakdown.employerCHF +
      out.breakdown.aiApgCHF;
    expect(Number(sum.toFixed(2))).toEqual(
      Number(out.totalContributionCHF.toFixed(2))
    );
  });

  it("throws on invalid income", () =>
  {
    expect(() => computeAvsContribution({ annualIncomeCHF: -1 })).toThrow();
  });
});
