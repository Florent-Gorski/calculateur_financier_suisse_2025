import React from "react";
import { AvsStep } from "../components/Wizard/AvsStep";

/**
 * CalculatorWidget
 * ----------------
 * Widget embarquable et autonome (styles neutres).
 * - Aucune dépendance au routeur.
 * - Tailwind preflight désactivé dans le projet => pas d'effet de bord sur l'hôte.
 * - Hérite des polices/couleurs globales du site hôte.
 */
export type CalculatorWidgetProps = {
  /** Classes utilitaires additionnelles (ex: largeur max, marges) */
  className?: string;
  /** Styles inline optionnels */
  style?: React.CSSProperties;
  /** Callback quand le widget est prêt (monté) */
  onReady?: () => void;
  /** Titre à afficher (par défaut fourni) */
  title?: string;
};

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({
  className = "",
  style,
  onReady,
  title = "Calculateur financier — Démo AVS"
}) =>
{
  React.useEffect(() =>
  {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`sls-widget ${className}`} style={style}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="sls-card rounded-xl border border-black/5 p-4 bg-white">
          <h2 className="text-xl font-bold mb-3">{title}</h2>
          {/* Ici, on embarque pour l’instant la démo AVS simple.
             Tu pourras remplacer par <Wizard /> si tu veux tout le flow. */}
          <AvsStep />
        </div>
      </div>
    </div>
  );
};

export default CalculatorWidget;
