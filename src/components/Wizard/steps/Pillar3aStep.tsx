import React, { useEffect, useState } from "react";
import Big from "big.js";
import { Pillar3aCalculator } from "../../../lib/calculators/Pillar3aCalculator";
import { parseSwissNumberToBig, toString2 } from "../../../lib/utils/number";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function Pillar3aStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [annualIncome, setAnnualIncome] = useState<string>(defaultValue?.annualIncome ?? "80'000");
  const [hasPensionFund, setHasPensionFund] = useState<boolean>(defaultValue?.hasPensionFund ?? true);
  const [marginalRatePct, setMarginalRatePct] = useState<number>(defaultValue?.marginalRatePct ?? 18);

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ max: Big; saving: Big } | null>(null);

  const recalc = () =>
  {
    try {
      setError(null);
      const max = Pillar3aCalculator.maxAllowed({
        annualIncome: parseSwissNumberToBig(annualIncome),
        hasPensionFund
      });
      const saving = Pillar3aCalculator.estimateTaxSaving({
        deposit: max,
        marginalRatePct
      });
      setPreview({ max, saving });
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
  }, [annualIncome, hasPensionFund, marginalRatePct]);

  const submit = () =>
  {
    if (preview) {
      onSubmit({
        input: { annualIncome, hasPensionFund, marginalRatePct },
        result: { maxDeposit: preview.max, estimatedTaxSaving: preview.saving }
      });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape 3ᵉ pilier (3a)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Revenu annuel (CHF)</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            placeholder="80'000"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="hasPF"
            type="checkbox"
            checked={hasPensionFund}
            onChange={(e) => setHasPensionFund(e.target.checked)}
          />
          <label htmlFor="hasPF">Affilié à une caisse de pension (LPP)</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taux marginal (%)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={marginalRatePct}
            onChange={(e) => setMarginalRatePct(Number(e.target.value))}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {preview && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>Versement maximal 3a (2025)</strong><div>{toString2(preview.max)} CHF</div></div>
            <div><strong>Économie d’impôt (est.)</strong><div>{toString2(preview.saving)} CHF</div></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={onBack}>Retour</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={submit}>Continuer</button>
      </div>
    </div>
  );
}
