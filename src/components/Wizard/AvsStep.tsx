import { useEffect, useState } from 'react';
import Big from 'big.js';
import { AvsCalculator } from '../../lib/calculators/AvsCalculator';
import { AvsInputSchema } from '../../validators/input-validator';
import type { AvsResult } from '../../types/calculation-results.types';
import { parseSwissNumberToBig, toString2 } from '../../lib/utils/number';

export const AvsStep = () =>
{
  const [grossSalary, setGrossSalary] = useState('60\'000');
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [result, setResult] = useState<AvsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recalc = () =>
  {
    try {
      setError(null);
      const input = {
        grossSalary: parseSwissNumberToBig(grossSalary),
        isSelfEmployed,
      };
      AvsInputSchema.parse(input);
      const res = AvsCalculator.calculate(input);
      setResult(res);
    } catch (e: any) {
      setResult(null);
      setError(e?.message ?? 'Erreur inconnue');
    }
  };

  // ⏱️ Recalcul auto avec petit debounce
  useEffect(() =>
  {
    const t = setTimeout(recalc, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossSalary, isSelfEmployed]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Salaire annuel brut (CHF)</label>
        <input
          type="text"
          className="w-full border rounded-lg p-2"
          value={grossSalary}
          onChange={(e) => setGrossSalary(e.target.value)}
          placeholder="60'000"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isSelfEmployed"
          type="checkbox"
          checked={isSelfEmployed}
          onChange={(e) => setIsSelfEmployed(e.target.checked)}
        />
        <label htmlFor="isSelfEmployed">Je suis indépendant</label>
      </div>

      <button onClick={recalc} className="mt-2 px-4 py-2 bg-black text-white rounded-lg">
        Calculer AVS
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="mt-4 p-3 bg-white rounded-lg border">
          <p><strong>Cotisation annuelle AVS</strong> : {toString2(result.annualContribution)} CHF</p>
          <p><strong>Rente mensuelle estimée</strong> : {toString2(result.monthlyPension)} CHF</p>
        </div>
      )}
    </div>
  );
};
