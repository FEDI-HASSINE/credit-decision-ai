import { AgentResult } from "../../api/types";

interface Props {
  title: string;
  agent: AgentResult;
}

export const AgentPanel = ({ title, agent }: Props) => {
  const customer = agent.explanations?.customer_explanation as
    | { summary?: string; main_reasons?: string[]; next_steps?: string[] }
    | undefined;
  const internal = agent.explanations?.internal_explanation as
    | { summary?: string; main_reasons?: string[]; next_steps?: string[] }
    | undefined;
  const customerSummary = typeof customer?.summary === "string" ? customer.summary : undefined;
  const internalSummary = typeof internal?.summary === "string" ? internal.summary : undefined;

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
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}
      {agent.explanations?.global_summary && (
        <p style={{ marginTop: 8, color: "#475569" }}>{agent.explanations.global_summary}</p>
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
      {agent.explanations?.flag_explanations && (
        <div style={{ marginTop: 8 }}>
          <strong>Détails:</strong>
          <ul style={{ paddingLeft: 16 }}>
            {Object.entries(agent.explanations.flag_explanations).map(([flag, desc]) => (
              <li key={flag} style={{ color: "#475569" }}>
                <strong>{flag}:</strong> {desc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
