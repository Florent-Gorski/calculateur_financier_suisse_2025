import rates from "../config/rates-2025.json";

export type Rates2025 = typeof rates;
let cached: Rates2025 | null = null;

export function getRates2025(): Rates2025
{
  if (cached) return cached;
  cached = rates;
  return cached;
}
