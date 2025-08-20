import { useState } from 'react';
import Big from 'big.js';
import { AvsCalculator } from '../../lib/calculators/AvsCalculator';
import { AvsInputSchema } from '../../validators/input-validator';
import type { AvsResult } from '../../types/calculation-results.types';

export const AvsStep = () =>
{
  const [grossSalary, setGrossSalary] = useState('60000');
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [result, setResult] = useState<AvsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () =>
  {
    try {
      setError(null);
      const input = {
        grossSalary: new Big(grossSalary || '0'),
        isSelfEmployed,
      };
      // Validate input with Zod schema
      AvsInputSchema.parse(input);
      const res = AvsCalculator.calculate(input);
      setResult(res);
    } catch (e: any) {
      setResult(null);
      setError(e?.message ?? 'Erreur inconnue');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Salaire annuel brut (CHF)</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-full border rounded-lg p-2"
          value={grossSalary}
          onChange={(e) => setGrossSalary(e.target.value)}
          placeholder="60000"
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

      <button
        onClick={handleCalculate}
        className="mt-2 px-4 py-2 bg-black text-white rounded-lg"
      >
        Calculer AVS
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="mt-4 p-3 bg-white rounded-lg border">
          <p>
            <strong>Cotisation annuelle AVS</strong> : {result.annualContribution.toString()} CHF
          </p>
          <p>
            <strong>Rente mensuelle estimée</strong> : {result.monthlyPension.toString()} CHF
          </p>
        </div>
      )}
    </div>
  );
};
