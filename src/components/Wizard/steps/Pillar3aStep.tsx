import React, { useState } from "react";
import Big from "big.js";
import { LppCalculator } from "../../../lib/calculators/LppCalculator";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function LppStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [annualSalary, setAnnualSalary] = useState<string>(defaultValue?.annualSalary ?? "80000");
  const [age, setAge] = useState<number>(defaultValue?.age ?? 35);
  const [error, setError] = useState<string | null>(null);

  const handle = () =>
  {
    try {
      const res = LppCalculator.calculate({
        annualSalary: new Big(annualSalary || "0"),
        age
      });
      onSubmit({ input: { annualSalary, age }, result: res });
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape LPP</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Salaire annuel (CHF)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Âge</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={onBack}>Retour</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={handle}>Continuer</button>
      </div>
    </div>
  );
}
