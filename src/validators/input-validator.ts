import { z } from 'zod';
import Big from 'big.js';

export const AvsInputSchema = z.object({
  grossSalary: z.custom<Big>((val) => val instanceof Big && val.gte(0), {
    message: "Le salaire brut doit être un nombre positif.",
  }),
  isSelfEmployed: z.boolean(),
});
