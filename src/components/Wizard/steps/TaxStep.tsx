import React, { useState } from "react";
import Big from "big.js";
import { TaxCalculator } from "../../../lib/calculators/TaxCalculator";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function TaxStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [taxableIncome, setTaxableIncome] = useState<string>(defaultValue?.taxableIncome ?? "80000");
  const [canton, setCanton] = useState<string>(defaultValue?.canton ?? "VD");
  const [error, setError] = useState<string | null>(null);

  const handle = () =>
  {
    try {
      const res = TaxCalculator.calculate({
        taxableIncome: new Big(taxableIncome || "0"),
        canton
      });
      onSubmit({ input: { taxableIncome, canton }, result: res });
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape Fiscalité</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Revenu imposable (CHF)</label>
          <input type="number" className="w-full border rounded-lg p-2" value={taxableIncome}
            onChange={(e) => setTaxableIncome(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Canton</label>
          <select className="w-full border rounded-lg p-2" value={canton} onChange={(e) => setCanton(e.target.value)}>
            <option value="VD">VD</option>
            <option value="GE">GE</option>
            <option value="VS">VS</option>
          </select>
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
