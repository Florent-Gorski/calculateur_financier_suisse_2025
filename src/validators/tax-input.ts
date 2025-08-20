import { z } from "zod";
export const TaxInputSchema = z.object({
  taxableIncome: z.any(), // Big
  canton: z.string().default("VD")
});
