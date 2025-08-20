import React, { useState } from "react";
import Big from "big.js";
import { TaxCalculator } from "../../../lib/calculators/TaxCalculator";
import { drtaxCalculateNP } from "../../../services/tax/drtax";
import { parseSwissNumberToBig, toString2 } from "../../../lib/utils/number";

export default function TaxStep({ defaultValue, onBack, onSubmit }: any)
{
  const [taxableIncome, setTaxableIncome] = useState<string>(defaultValue?.taxableIncome ?? "80'000");
  const [canton, setCanton] = useState<string>(defaultValue?.canton ?? "VD");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [drtaxRes, setDrtaxRes] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const doLocalEstimate = () =>
  {
    try {
      setError(null);
      const res = TaxCalculator.calculate({
        taxableIncome: parseSwissNumberToBig(taxableIncome),
        canton
      });
      setPreview(res);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  const doDrTax = async () =>
  {
    try {
      setError(null);
      setLoading(true);
      const payload = {
        language: "fr",
        "basic-data": {
          "tax-year": new Date().getFullYear(),
          "marital-status": 1,     // ex: Célibataire (à mapper via picklists)
          "canton": VD_INDEX,     // ⚠️ à obtenir via picklist Canton
          "municipality-of-taxation": "LAUSANNE", // via picklist
          "children": 0
        },
        "fiscal-factors": {
          "taxable-amounts": {
            "cantonal-income": Number(parseSwissNumberToBig(taxableIncome).toString())
          }
        }
      };
      const data = await drtaxCalculateNP(payload);
      setDrtaxRes(data);
    } catch (e: any) {
      setError(e?.message ?? "Erreur DrTax");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape Fiscalité</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Revenu imposable (CHF)</label>
          <input type="text" className="w-full border rounded-lg p-2"
            value={taxableIncome} onChange={(e) => setTaxableIncome(e.target.value)} />
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

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={doLocalEstimate}>Estimation locale</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={doDrTax} disabled={loading}>
          {loading ? "Calcul DrTax..." : "Calcul cantonal précis (DrTax)"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {preview && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div><strong>Fédéral</strong> : {toString2(preview.federal)} CHF</div>
          <div><strong>Cantonal</strong> : {toString2(preview.cantonal)} CHF</div>
          <div><strong>Total</strong> : {toString2(preview.total)} CHF</div>
          <div><strong>Taux marginal (est.)</strong> : {preview.marginalRatePct}%</div>
        </div>
      )}

      {drtaxRes && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div className="font-semibold">Résultat DrTax</div>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(drtaxRes, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={onBack}>Retour</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={() => onSubmit({ preview, drtaxRes })}>
          Continuer
        </button>
      </div>
    </div>
  );
}
