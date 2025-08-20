import React, { useState } from "react";
import Big from "big.js";
import { AvsCalculator } from "../../../lib/calculators/AvsCalculator";

type Props = {
  defaultValue?: any;
  onSubmit: (result: any) => void;
};

export default function AvsWizardStep({ defaultValue, onSubmit }: Props)
{
  const [grossSalary, setGrossSalary] = useState<string>(defaultValue?.grossSalary ?? "60000");
  const [isSelfEmployed, setIsSelfEmployed] = useState<boolean>(defaultValue?.isSelfEmployed ?? false);
  const [error, setError] = useState<string | null>(null);

  const handle = () =>
  {
    try {
      const res = AvsCalculator.calculate({
        grossSalary: new Big(grossSalary || "0"),
        isSelfEmployed
      });
      onSubmit({ input: { grossSalary, isSelfEmployed }, result: res });
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape AVS</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Salaire annuel brut (CHF)</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-full border rounded-lg p-2"
          value={grossSalary}
          onChange={(e) => setGrossSalary(e.target.value)}
        />
      </div>
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelfEmployed}
          onChange={(e) => setIsSelfEmployed(e.target.checked)}
        />
        <span>Je suis indépendant</span>
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={handle}>
          Continuer
        </button>
      </div>
    </div>
  );
}
