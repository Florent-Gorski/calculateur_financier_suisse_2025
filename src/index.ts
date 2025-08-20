// Expose public API pour intégration dans ProméThémis
export { CalculatorWidget } from "./embed/CalcultorWidget";
export { AvsStep } from "./components/Wizard/AvsStep";
export { AvsCalculator } from "./lib/calculators/AvsCalculator";

// Types internes utiles si tu veux typer finement côté hôte
export type { AvsResult } from "./types/calculation-results.types";
export type { AvsInput } from "./types/user-inputs.types";
