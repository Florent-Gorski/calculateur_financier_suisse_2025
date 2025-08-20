export type AvsInput = {
  /** Revenu annuel brut en CHF (salarié). */
  annualIncomeCHF: number;
};

export type AvsOutput = {
  /** Taux total appliqué (salarié+employeur+AI/APG) en pourcentage. */
  appliedRatePct: number;
  /** Cotisation totale estimée en CHF (part globale, informational). */
  totalContributionCHF: number;
  /** Détail par part : salarié vs employeur (informational). */
  breakdown: {
    employeePct: number;
    employerPct: number;
    aiApgPct: number;
    employeeCHF: number;
    employerCHF: number;
    aiApgCHF: number;
  };
};
