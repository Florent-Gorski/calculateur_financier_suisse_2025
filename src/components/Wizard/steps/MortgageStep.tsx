import React, { useState } from "react";
import Big from "big.js";
import { MortgageCalculator } from "../../../lib/calculators/MortgageCalculator";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function MortgageStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [price, setPrice] = useState<string>(defaultValue?.price ?? "900000");
  const [equity, setEquity] = useState<string>(defaultValue?.equity ?? "200000");
  const [ratePct, setRatePct] = useState<number>(defaultValue?.ratePct ?? 2.0);
  const [error, setError] = useState<string | null>(null);

  const handle = () =>
  {
    try {
      const res = MortgageCalculator.calculate({
        propertyPrice: new Big(price || "0"),
        equity: new Big(equity || "0"),
        ratePct
      });
      onSubmit({ input: { price, equity, ratePct }, result: res });
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape Hypothèque</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Prix du bien (CHF)</label>
          <input type="number" className="w-full border rounded-lg p-2" value={price}
            onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fonds propres (CHF)</label>
          <input type="number" className="w-full border rounded-lg p-2" value={equity}
            onChange={(e) => setEquity(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taux (%)</label>
          <input type="number" className="w-full border rounded-lg p-2" value={ratePct}
            onChange={(e) => setRatePct(Number(e.target.value))} />
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
