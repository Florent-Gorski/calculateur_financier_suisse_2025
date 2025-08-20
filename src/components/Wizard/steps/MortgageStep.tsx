import React, { useEffect, useState } from "react";
import { MortgageCalculator } from "../../../lib/calculators/MortgageCalculator";
import { parseSwissNumberToBig, toString2 } from "../../../lib/utils/number";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function MortgageStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [price, setPrice] = useState<string>(defaultValue?.price ?? "900'000");
  const [equity, setEquity] = useState<string>(defaultValue?.equity ?? "200'000");
  const [ratePct, setRatePct] = useState<number>(defaultValue?.ratePct ?? 2.0);
  const [annualIncome, setAnnualIncome] = useState<string>(defaultValue?.annualIncome ?? "160'000");

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const recalc = () =>
  {
    try {
      setError(null);
      const res = MortgageCalculator.calculate({
        propertyPrice: parseSwissNumberToBig(price),
        equity: parseSwissNumberToBig(equity),
        ratePct,
        annualIncome: parseSwissNumberToBig(annualIncome),
      });
      setPreview(res);
    } catch (e: any) {
      setPreview(null);
      setError(e?.message ?? "Erreur");
    }
  };

  useEffect(() =>
  {
    const t = setTimeout(recalc, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, equity, ratePct, annualIncome]);

  const submit = () =>
  {
    if (preview) onSubmit({ input: { price, equity, ratePct, annualIncome }, result: preview });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape Hypothèque</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Prix du bien (CHF)</label>
          <input type="text" className="w-full border rounded-lg p-2" value={price}
            onChange={(e) => setPrice(e.target.value)} placeholder="900'000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fonds propres (CHF)</label>
          <input type="text" className="w-full border rounded-lg p-2" value={equity}
            onChange={(e) => setEquity(e.target.value)} placeholder="200'000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taux (%)</label>
          <input type="number" className="w-full border rounded-lg p-2" value={ratePct}
            onChange={(e) => setRatePct(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Revenu annuel brut (CHF)</label>
          <input type="text" className="w-full border rounded-lg p-2" value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)} placeholder="160'000" />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {preview && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div><strong>Prêt</strong><div>{toString2(preview.loanAmount)} CHF</div></div>
            <div><strong>LTV</strong><div>{preview.ltvPct}%</div></div>
            <div><strong>Fonds propres</strong><div>{preview.equityPct}% {preview.equityOK ? "✅" : "❌"}</div></div>
            <div><strong>Intérêt (théorique)</strong><div>{toString2(preview.annualInterest)} CHF</div></div>
            <div><strong>Charges</strong><div>{toString2(preview.annualCharges)} CHF</div></div>
            <div><strong>Amort.</strong><div>{toString2(preview.annualAmort)} CHF</div></div>
            <div className="md:col-span-2"><strong>Coût annuel</strong><div>{toString2(preview.annualCost)} CHF</div></div>
            <div><strong>Effort</strong><div>{preview.affordabilityPct}%</div></div>
          </div>
          <div className="mt-1"><strong>Solvable</strong> : {preview.affordable ? "✅ Oui" : "❌ Non"}</div>
        </div>
      )}

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={onBack}>Retour</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={submit}>Continuer</button>
      </div>
    </div>
  );
}
