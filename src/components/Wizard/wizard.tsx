import React from "react";
import AvsWizardStep from "./steps/AvsWizardStep";
import LppStep from "./steps/LppStep";
import Pillar3aStep from "./steps/Pillar3aStep";
import MortgageStep from "./steps/MortgageStep";
import TaxStep from "./steps/TaxStep";
import SummaryStep from "./SummaryStep";

type StepKey = "AVS" | "LPP" | "P3A" | "MORTGAGE" | "TAX" | "SUMMARY";

const steps: { key: StepKey; label: string }[] = [
  { key: "AVS", label: "AVS" },
  { key: "LPP", label: "LPP" },
  { key: "P3A", label: "3ᵉ pilier" },
  { key: "MORTGAGE", label: "Hypothèque" },
  { key: "TAX", label: "Fiscalité" },
  { key: "SUMMARY", label: "Récapitulatif" },
];

export type WizardData = {
  AVS?: any;
  LPP?: any;
  P3A?: any;
  MORTGAGE?: any;
  TAX?: any;
};

export default function Wizard()
{
  const [active, setActive] = React.useState<number>(0);
  const [data, setData] = React.useState<WizardData>({});

  const goto = (i: number) => setActive(Math.max(0, Math.min(steps.length - 1, i)));
  const next = () => goto(active + 1);
  const prev = () => goto(active - 1);

  return (
    <div className="sls-card rounded-xl border border-black/5 p-4">
      <ol className="flex flex-wrap items-center gap-2 mb-4">
        {steps.map((s, i) => (
          <li
            key={s.key}
            className={`px-3 py-1 rounded-full text-sm border ${i === active ? "bg-black text-white border-black" : "bg-white border-black/10"
              }`}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      <div className="min-h-[220px]">
        {steps[active].key === "AVS" && (
          <AvsWizardStep
            defaultValue={data.AVS}
            onSubmit={(res: any) =>
            {
              setData((d) => ({ ...d, AVS: res }));
              next();
            }}
          />
        )}
        {steps[active].key === "LPP" && (
          <LppStep
            defaultValue={data.LPP}
            onBack={prev}
            onSubmit={(res: any) =>
            {
              setData((d) => ({ ...d, LPP: res }));
              next();
            }}
          />
        )}
        {steps[active].key === "P3A" && (
          <Pillar3aStep
            defaultValue={data.P3A}
            onBack={prev}
            onSubmit={(res: any) =>
            {
              setData((d) => ({ ...d, P3A: res }));
              next();
            }}
          />
        )}
        {steps[active].key === "MORTGAGE" && (
          <MortgageStep
            defaultValue={data.MORTGAGE}
            onBack={prev}
            onSubmit={(res: any) =>
            {
              setData((d) => ({ ...d, MORTGAGE: res }));
              next();
            }}
          />
        )}
        {steps[active].key === "TAX" && (
          <TaxStep
            defaultValue={data.TAX}
            onBack={prev}
            onSubmit={(res: any) =>
            {
              setData((d) => ({ ...d, TAX: res }));
              next();
            }}
          />
        )}
        {steps[active].key === "SUMMARY" && (
          <SummaryStep data={data} onBack={prev} />
        )}
      </div>
    </div>
  );
}
