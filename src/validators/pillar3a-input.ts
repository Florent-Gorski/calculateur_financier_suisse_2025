import { z } from "zod";
export const Pillar3aInputSchema = z.object({
  annualIncome: z.any(),      // Big
  marginalRatePct: z.number().min(0).max(50)
});
