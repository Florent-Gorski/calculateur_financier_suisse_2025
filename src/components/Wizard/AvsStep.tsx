import { useState } from 'react';
import { AvsCalculator } from '../../engies/AvsCalculator';
import { AvsInputSchema } from '../../validators/input-validator';
import Big from 'big.js';
import { AvsResult } from '../../types/calculation-results.types';

export const AvsStep = () =>
{
  const [grossSalary, setGrossSalary] = useState('');
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [result, setResult] = useState<AvsResult | null>(null);

  const handleCalculate = () =>
  {
    try {
      const input = {
        grossSalary: new Big(grossSalary),
        isSelfEmployed,
      };
      AvsInputSchema.parse(input);
      setResult(AvsCalculator.calculate(input));
    } catch (error) {
      alert("Entrée invalide : " + error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <input
        type="number"
        value={grossSalary}
        onChange={(e: { target: { value: any; }; }) => setGrossSalary(e.target.value)}
        placeholder="Salaire brut annuel (CHF)"
        className="w-full p-2 border rounded"
      />
      <label className="block mt-2">
        <input
          type="checkbox"
          checked={isSelfEmployed}
          onChange={(e) => setIsSelfEmployed(e.target.checked)}
          className="mr-2"
        />
        Indépendant
      </label>
      <button
        onClick={handleCalculate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Calculer AVS
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>Cotisation annuelle AVS : {result.annualContribution.toString()} CHF</p>
          <p>Rente mensuelle estimée : {result.monthlyPension.toString()} CHF</p>
        </div>
      )}
    </div>
  );
};
