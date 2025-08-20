import React, { useEffect, useState } from "react";
import Big from "big.js";
import { TaxCalculator } from "../../../lib/calculators/TaxCalculator";
import { drtaxCalculateNP, getCantons, getTaxCommunities, type Option } from "../../../services/tax/drtax";
import { parseSwissNumberToBig, toString2 } from "../../../lib/utils/number";

export default function TaxStep({ defaultValue, onBack, onSubmit }: any)
{
  const [taxableIncome, setTaxableIncome] = useState<string>(defaultValue?.taxableIncome ?? "80'000");

  // DrTax picklists
  const [cantons, setCantons] = useState<Option[]>([]);
  const [selectedCanton, setSelectedCanton] = useState<string | number>("");
  const [communities, setCommunities] = useState<Option[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | number>("");

  // États UI
  const [error, setError] = useState<string | null>(null);
  const [loadingDrTax, setLoadingDrTax] = useState(false);

  // Estimation locale (fallback)
  const [preview, setPreview] = useState<any | null>(null);
  // Résultat DrTax (précis)
  const [drtaxRes, setDrtaxRes] = useState<any | null>(null);

  // Charge cantons au montage
  useEffect(() =>
  {
    (async () =>
    {
      try {
        const c = await getCantons();
        setCantons(c);
        // auto-sélection VD si présent
        const vd = c.find((o: { label: any; }) => String(o.label).toUpperCase().includes("VD"));
        const id = vd?.id ?? c[0]?.id ?? "";
        setSelectedCanton(id);
      } catch (e: any) {
        setError(e?.message ?? "Erreur chargement cantons");
      }
    })();
  }, []);

  // Charge communes quand le canton change
  useEffect(() =>
  {
    (async () =>
    {
      if (!selectedCanton) return;
      try {
        const list = await getTaxCommunities(selectedCanton);
        setCommunities(list);
        setSelectedCommunity(list[0]?.id ?? "");
      } catch (e: any) {
        setError(e?.message ?? "Erreur chargement communes");
      }
    })();
  }, [selectedCanton]);

  const doLocalEstimate = () =>
  {
    try {
      setError(null);
      // Estimation maison (fédéral + VD fallback) — déjà dans ton projet
      const res = TaxCalculator.calculate({
        taxableIncome: parseSwissNumberToBig(taxableIncome),
        canton: "VD"
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
      setLoadingDrTax(true);
      if (!selectedCanton || !selectedCommunity) {
        throw new Error("Sélectionne un canton et une commune/paroisse fiscale.");
      }
      const incomeNumber = Number(parseSwissNumberToBig(taxableIncome).toString());

      // ⚠️ Le schéma exact dépend de la doc DrTax.
      // Les picklists nous ont donné des IDs; on les passe tels quels.
      const payload = {
        language: "fr",
        "basic-data": {
          "tax-year": new Date().getFullYear(),
          "marital-status": 1,                  // Célibataire (exemple) -> mapper via /MaritalStatusList
          "canton": selectedCanton,
          "tax-community": selectedCommunity,    // selon doc: "tax-community" ou champ équivalent
          "children": 0
        },
        "fiscal-factors": {
          "taxable-amounts": {
            "cantonal-income": incomeNumber
          }
        }
      };

      const data = await drtaxCalculateNP(payload);
      setDrtaxRes(data);
    } catch (e: any) {
      setError(e?.message ?? "Erreur DrTax");
    } finally {
      setLoadingDrTax(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Étape Fiscalité</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Revenu imposable (CHF)</label>
          <input type="text" className="w-full border rounded-lg p-2"
            value={taxableIncome} onChange={(e) => setTaxableIncome(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Canton (DrTax)</label>
          <select className="w-full border rounded-lg p-2"
            value={selectedCanton}
            onChange={(e) => setSelectedCanton(e.target.value)}>
            {cantons.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Commune/paroisse fiscale (DrTax)</label>
          <select className="w-full border rounded-lg p-2"
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}>
            {communities.map(cm => <option key={cm.id} value={cm.id}>{cm.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={doLocalEstimate}>Estimation locale</button>
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={doDrTax} disabled={loadingDrTax}>
          {loadingDrTax ? "Calcul DrTax..." : "Calcul cantonal précis (DrTax)"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {preview && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div><strong>Fédéral</strong> : {toString2(preview.federal)} CHF</div>
          <div><strong>Cantonal (est.)</strong> : {toString2(preview.cantonal)} CHF</div>
          <div><strong>Total</strong> : {toString2(preview.total)} CHF</div>
          <div><strong>Taux marginal</strong> : {preview.marginalRatePct}%</div>
        </div>
      )}

      {drtaxRes && (
        <div className="mt-2 p-3 bg-white rounded-lg border text-sm">
          <div className="font-semibold">Résultat DrTax</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(drtaxRes, null, 2)}</pre>
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
