import { useState } from "react";
import { computeAvsContribution } from "./lib/calculators/AvsCalculator"; // ✅ chemin corrigé
import type { AvsInput } from "./types/avs.types"; // ✅ types présents

export default function App()
{
  const [income, setIncome] = useState<number>(80000);
  const [result, setResult] = useState<string>("");

  const onCompute = () =>
  {
    const input: AvsInput = { annualIncomeCHF: income };
    const out = computeAvsContribution(input);
    setResult(
      `Cotisations AVS/AI/APG (part salarié+employeur) estimées: CHF ${out.totalContributionCHF.toFixed(
        2
      )} (taux ${out.appliedRatePct.toFixed(2)}%)`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Calculateur Financier Suisse 2025 — Démo AVS</h1>
        <div className="bg-white rounded-xl shadow p-4 space-y-2">
          <label className="block text-sm font-medium">Revenu annuel (CHF)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
          <button onClick={onCompute} className="px-4 py-2 rounded-lg bg-black text-white">
            Calculer
          </button>
          {result && <p className="text-sm">{result}</p>}
        </div>
      </div>
    </div>
  );
}
