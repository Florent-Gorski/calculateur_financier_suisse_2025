import { z } from "zod";
export const MortgageInputSchema = z.object({
  propertyPrice: z.any(),     // Big
  equity: z.any(),            // Big
  ratePct: z.number().min(0).max(15).default(2.0),
  annualIncome: z.any().optional() // Big
});
