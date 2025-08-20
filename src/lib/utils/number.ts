import Big from "big.js";

/** "60'000,50" | "60 000,50" | "60000.50" -> Big("60000.50") */
export function parseSwissNumberToBig(value: string | number): Big {
  const s = String(value ?? "")
    .replace(/\s|’|'/g, "")   // espaces + apostrophes
    .replace(",", ".");       // virgule -> point
  if (!s || s === "." || s === "-") return new Big(0);
  return new Big(s);
}

/** Format simple (pas d’internationalisation lourde ici) */
export function toString2(b: Big): string {
  return b.round(2, Big.roundHalfUp).toString();
}
