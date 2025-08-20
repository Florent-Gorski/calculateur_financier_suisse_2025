import React, { useEffect, useState } from "react";
import Big from "big.js";
import { LppCalculator } from "../../../lib/calculators/LppCalculator";
import { parseSwissNumberToBig, toString2 } from "../../../lib/utils/number";

type Props = {
  defaultValue?: any;
  onBack: () => void;
  onSubmit: (result: any) => void;
};

export default function LppStep({ defaultValue, onBack, onSubmit }: Props)
{
  const [annualSalary, setAnnualSalary] = useState<string>(defaultValue?.annualSalary ?? "80'000");
  const [age, setAge] = useState<number>(defaultValue?.age ?? 35);

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const recalc = () =>
  {
    try {
      setError(null);
      const res = LppCalculator.calculate({
        annualSalary: parseSwissNumberToBig(annualSalary),
        age
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
  }, [annualSalary, age]);

  const submit = () =>
  {
    if (preview) onSubmit({ input: { annualSalary, age }, result: preview });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape LPP</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Salaire annuel (CHF)</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
            placeholder="80'000"
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

      {preview && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>Salaire coordonné</strong><div>{toString2(preview.coordinatedSalary)} CHF</div></div>
            <div><strong>Taux crédit âge</strong><div>{preview.creditRatePct}%</div></div>
            <div><strong>Avoir vieillesse annuel</strong><div>{toString2(preview.annualCreditTotal)} CHF</div></div>
            <div><strong>Part employé</strong><div>{toString2(preview.employeeCredit)} CHF</div></div>
            <div><strong>Part employeur</strong><div>{toString2(preview.employerCredit)} CHF</div></div>
            <div><strong>Taux minimal</strong><div>{preview.minInterestRatePct}%</div></div>
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
