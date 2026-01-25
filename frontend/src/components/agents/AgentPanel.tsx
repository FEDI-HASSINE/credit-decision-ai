import { AgentResult } from "../../api/types";
import { StructuredOutput } from "./StructuredOutput";

interface Props {
  title: string;
  agent: AgentResult;
}

const DOCUMENT_FLAG_LABELS: Record<string, string> = {
  INCOME_MISMATCH: "Revenus déclarés ≠ documents",
  CONTRACT_MISMATCH: "Contrat incohérent",
  SENIORITY_MISMATCH: "Ancienneté incohérente",
  MISSING_KEY_FIELDS: "Champs clés manquants",
  MISSING_DOCUMENTS: "Documents manquants",
  GENERIC_TEXT_TEMPLATE: "Document trop générique",
};

const BEHAVIOR_FLAG_LABELS: Record<string, string> = {
  LOW_ON_TIME_RATE: "Taux à l’heure faible",
  LATE_PAYMENTS_AVG: "Retards moyens élevés",
  MAX_LATE_HIGH: "Retard max élevé",
  MISSED_INSTALLMENTS: "Tranches manquées",
  REPEATED_MISSES: "Manquements répétés",
  PAYMENT_HISTORY_EXCELLENT: "Historique excellent",
  PAYMENT_HISTORY_GOOD: "Historique bon",
  PAYMENT_HISTORY_MIXED: "Historique mitigé",
  PAYMENT_HISTORY_POOR: "Historique mauvais",
  NO_PAYMENT_HISTORY: "Aucun historique de paiement",
  RAPID_SUBMISSION: "Soumission très rapide",
  LONG_HESITATION: "Hésitation longue",
  MULTIPLE_EDITS: "Nombreuses modifications",
  INCOME_REWRITES: "Réécritures des revenus",
  DOCUMENT_REUPLOADS: "Réuploads de documents",
  BACK_AND_FORTH: "Allers-retours",
  MISSING_TELEMETRY: "Télémetrie manquante",
};

const getFlagLabel = (flag: string, agentName?: string) => {
  const key = flag.toUpperCase();
  if (agentName === "document" && DOCUMENT_FLAG_LABELS[key]) return DOCUMENT_FLAG_LABELS[key];
  if (agentName === "behavior" && BEHAVIOR_FLAG_LABELS[key]) return BEHAVIOR_FLAG_LABELS[key];
  return flag;
};

export const AgentPanel = ({ title, agent }: Props) => {
  const rawExpl = agent.explanations;
  let explanations = rawExpl as Exclude<AgentResult["explanations"], undefined>;
  if (typeof rawExpl === "string") {
    const trimmed = rawExpl.replace(/```json|```/gi, "").trim();
    try {
      explanations = JSON.parse(trimmed);
    } catch {
      explanations = { global_summary: trimmed };
    }
  } else if (rawExpl && typeof rawExpl === "object" && "flags" in rawExpl && !("flag_explanations" in rawExpl)) {
    const flags = (rawExpl as { flags?: Record<string, string>; summary?: string }).flags || {};
    explanations = {
      flag_explanations: flags,
      global_summary: (rawExpl as { summary?: string }).summary,
    };
  }

  const customer = explanations?.customer_explanation as
    | { summary?: string; main_reasons?: string[]; next_steps?: string[] }
    | undefined;
  const internal = explanations?.internal_explanation as
    | { summary?: string; main_reasons?: string[]; next_steps?: string[] }
    | undefined;
  const customerSummary = typeof customer?.summary === "string" ? customer.summary : undefined;
  const internalSummary = typeof internal?.summary === "string" ? internal.summary : undefined;
  const flagMap = explanations?.flag_explanations || {};
  const flagEntries = Object.entries(flagMap);
  const agentName = agent.name || title.toLowerCase();
  const hasReadableSummary =
    Boolean(explanations?.global_summary) ||
    Boolean(customerSummary) ||
    Boolean(internalSummary) ||
    flagEntries.length > 0;

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {typeof agent.score === "number" && (
          <span className="badge">Score: {agent.score.toFixed(2)}</span>
        )}
        {typeof agent.confidence === "number" && (
          <span className="badge" style={{ background: "#dbeafe", color: "#1e3a8a" }}>
            Confiance: {(agent.confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
      {agent.flags && agent.flags.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Signaux:</strong>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {agent.flags.map((flag) => (
              <span key={flag} className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                {getFlagLabel(flag, agentName)}
              </span>
            ))}
          </div>
        </div>
      )}
      {explanations?.global_summary && (
        <p style={{ marginTop: 8, color: "#475569" }}>{explanations.global_summary}</p>
      )}
      {customerSummary && (
        <div style={{ marginTop: 8, color: "#475569" }}>
          <strong>Client:</strong> {customerSummary}
        </div>
      )}
      {customer?.main_reasons && customer.main_reasons.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <strong>Raisons client:</strong>
          <ul style={{ paddingLeft: 16 }}>
            {customer.main_reasons.map((reason, idx) => (
              <li key={`${reason}-${idx}`} style={{ color: "#475569" }}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {internalSummary && (
        <div style={{ marginTop: 8, color: "#475569" }}>
          <strong>Interne:</strong> {internalSummary}
        </div>
      )}
      {flagEntries.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Détails:</strong>
          <ul style={{ paddingLeft: 16 }}>
            {flagEntries.map(([flag, desc]) => (
              <li key={flag} style={{ color: "#475569" }}>
                <strong>{getFlagLabel(flag, agentName)}:</strong> {String(desc)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!hasReadableSummary && explanations && (
        <div style={{ marginTop: 8 }}>
          <strong>Données:</strong>
          <div style={{ marginTop: 6, fontSize: 12 }}>
            <StructuredOutput value={explanations as unknown as Record<string, unknown>} />
          </div>
        </div>
      )}
    </div>
  );
};
