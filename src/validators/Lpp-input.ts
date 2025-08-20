import { z } from "zod";
export const LppInputSchema = z.object({
  annualSalary: z.any(), // Big instance
  age: z.number().min(18).max(70)
});
