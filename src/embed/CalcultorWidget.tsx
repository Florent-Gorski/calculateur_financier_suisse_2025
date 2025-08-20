import React from "react";
import { AvsStep } from "../components/Wizard/AvsStep";

/**
 * Widget embarquable dans ProméThémis.
 * Wrappe les steps (pour l’instant: AVS) dans un conteneur neutre .sls-widget
 * pour minimiser les effets de bords CSS.
 */
export type CalculatorWidgetProps = {
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
};

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({
  className = "",
  style,
  onReady
}) =>
{
  React.useEffect(() => { onReady?.(); }, [onReady]);

  return (
    <div className={`sls-widget min-h-[1px] ${className}`} style={style}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="sls-card rounded-xl border border-black/5 p-4">
          <h2 className="text-xl font-bold mb-3">
            Calculateur financier — Démo AVS
          </h2>
          <AvsStep />
        </div>
      </div>
    </div>
  );
};
