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

const SIMILARITY_FLAG_LABELS: Record<string, string> = {
  NO_SIMILAR_CASES: "Aucun dossier similaire trouvé",
  LOW_SIMILARITY_SAMPLE: "Peu de cas similaires disponibles",
  LOW_AVG_SIMILARITY: "Similarité moyenne faible",
  PEER_DEFAULT_RATE_HIGH: "Taux de défaut élevé chez les pairs",
  PEER_FRAUD_RATE_HIGH: "Taux de fraude élevé chez les pairs",
};

const DECISION_FLAG_LABELS: Record<string, string> = {
  HIGH_DTI: "Ratio d'endettement élevé",
  DOC_INCONSISTENCY: "Incohérences documentaires",
  INCOME_INSTABILITY: "Revenus instables ou incohérents",
  PEER_RISK_HIGH: "Profil similaire à des cas risqués",
  PAYMENT_HISTORY_GOOD: "Historique de paiement solide",
  PAYMENT_HISTORY_POOR: "Historique de paiement dégradé",
};

const getFlagLabel = (flag: string, agentName?: string) => {
  const key = flag.toUpperCase();
  if (agentName === "document" && DOCUMENT_FLAG_LABELS[key]) return DOCUMENT_FLAG_LABELS[key];
  if (agentName === "behavior" && BEHAVIOR_FLAG_LABELS[key]) return BEHAVIOR_FLAG_LABELS[key];
  if (agentName === "similarity" && SIMILARITY_FLAG_LABELS[key]) return SIMILARITY_FLAG_LABELS[key];
  if (agentName === "decision" && DECISION_FLAG_LABELS[key]) return DECISION_FLAG_LABELS[key];
  return flag;
};

const formatSimilarityStatus = (status?: string) => {
  const key = (status || "").toUpperCase();
  if (key === "FRAUD") return "Fraude";
  if (key === "DEFAULT") return "Défaut";
  if (key === "OK") return "OK";
  return status || "—";
};

const formatPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
};

const formatScore = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toFixed(2);
};

const formatDecisionLabel = (decision?: string) => {
  const key = (decision || "").toLowerCase();
  if (key === "approve") return "Approuver";
  if (key === "reject") return "Refuser";
  if (key === "review") return "Revoir";
  return decision || "—";
};

const decisionBadgeStyle = (decision?: string) => {
  const key = (decision || "").toLowerCase();
  if (key === "approve") return { background: "#dcfce7", color: "#166534" };
  if (key === "reject") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef3c7", color: "#92400e" };
};

const formatConsistency = (value?: string) => {
  const key = (value || "").toLowerCase();
  if (key === "high") return "Élevée";
  if (key === "medium") return "Moyenne";
  if (key === "low") return "Faible";
  return value || "—";
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
  const similarityDetails = explanations?.similarity_details;
  const similarityReport = similarityDetails?.report;
  const similarityBreakdown = similarityDetails?.breakdown;
  const similarityCases = similarityDetails?.cases || [];
  const similarityStats = similarityDetails?.stats;
  const similarityBuckets = similarityDetails?.buckets || [];
  const similarityAnalysis = similarityDetails?.analysis;
  const decisionDetails = explanations?.decision_details;
  const documentDetails = explanations?.document_details;
  const breakdownTotal =
    similarityBreakdown
      ? (similarityBreakdown.ok || 0) +
        (similarityBreakdown.default || 0) +
        (similarityBreakdown.fraud || 0)
      : 0;
  const okPct = breakdownTotal ? ((similarityBreakdown?.ok || 0) / breakdownTotal) * 100 : 0;
  const defaultPct = breakdownTotal ? ((similarityBreakdown?.default || 0) / breakdownTotal) * 100 : 0;
  const fraudPct = breakdownTotal ? ((similarityBreakdown?.fraud || 0) / breakdownTotal) * 100 : 0;
  const similarityTotal =
    similarityStats?.total_similar_cases ??
    (similarityBreakdown
      ? (similarityBreakdown.ok || 0) + (similarityBreakdown.default || 0) + (similarityBreakdown.fraud || 0)
      : undefined);
  const showReport = Boolean(similarityReport && similarityReport !== explanations?.global_summary);
  const showSimilarityDetails =
    agentName === "similarity" &&
    (Boolean(similarityReport) ||
      Boolean(similarityTotal !== undefined) ||
      similarityCases.length > 0 ||
      similarityBuckets.length > 0 ||
      Boolean(similarityStats) ||
      Boolean(similarityAnalysis));
  const showDecisionDetails = agentName === "decision" && Boolean(decisionDetails);
  const showDocumentDetails = agentName === "document" && Boolean(documentDetails);
  const hasReadableSummary =
    Boolean(explanations?.global_summary) ||
    Boolean(customerSummary) ||
    Boolean(internalSummary) ||
    flagEntries.length > 0 ||
    showSimilarityDetails ||
    showDecisionDetails ||
    showDocumentDetails;

  const showGlobalSummary =
    Boolean(explanations?.global_summary) &&
    !(agentName === "decision" && decisionDetails?.summary) &&
    !(agentName === "document" && showDocumentDetails);

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
      {showGlobalSummary && (
        <p style={{ marginTop: 8, color: "#475569" }}>{explanations?.global_summary}</p>
      )}
      {showSimilarityDetails && (
        <div style={{ marginTop: 12 }}>
          <strong>Analyse de similarité:</strong>
          {typeof similarityTotal === "number" && (
            <>
              <div style={{ color: "#475569", marginTop: 6 }}>
                {similarityTotal} dossier(s) proches{" "}
                {similarityBreakdown && (
                  <span>
                    • {similarityBreakdown.ok ?? 0} OK • {similarityBreakdown.default ?? 0} défaut •{" "}
                    {similarityBreakdown.fraud ?? 0} fraude
                  </span>
                )}
              </div>
              {similarityBreakdown && breakdownTotal > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#475569" }}>
                    <span>Répartition:</span>
                    <span>OK {Math.round(okPct)}%</span>
                    <span>Défaut {Math.round(defaultPct)}%</span>
                    <span>Fraude {Math.round(fraudPct)}%</span>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      height: 10,
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "#e2e8f0",
                    }}
                  >
                    <span style={{ width: `${okPct}%`, background: "#22c55e" }} />
                    <span style={{ width: `${defaultPct}%`, background: "#ef4444" }} />
                    <span style={{ width: `${fraudPct}%`, background: "#f59e0b" }} />
                  </div>
                </div>
              )}
            </>
          )}
          {similarityStats && (
            <div style={{ marginTop: 10, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Similarité moyenne</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.average_similarity)}</div>
              </div>
              <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Taux de succès</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.repayment_success_rate)}</div>
              </div>
              <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Taux de défaut</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.default_rate)}</div>
              </div>
              <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Taux de fraude</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.fraud_ratio)}</div>
              </div>
              {typeof similarityStats.min_similarity === "number" && (
                <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Similarité min</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.min_similarity)}</div>
                </div>
              )}
              {typeof similarityStats.median_similarity === "number" && (
                <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Similarité médiane</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.median_similarity)}</div>
                </div>
              )}
              {typeof similarityStats.max_similarity === "number" && (
                <div className="card" style={{ padding: "10px 12px", background: "#f8fafc", boxShadow: "none" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b" }}>Similarité max</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPercent(similarityStats.max_similarity)}</div>
                </div>
              )}
            </div>
          )}
          {similarityBuckets.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Ratios par tranche de similarité:</strong>
              <table className="table" style={{ marginTop: 6, fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Tranche</th>
                    <th>Volume</th>
                    <th>Taux défaut</th>
                    <th>Taux fraude</th>
                    <th>Sim. moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {similarityBuckets.map((bucket, idx) => (
                    <tr key={`${bucket.label ?? "bucket"}-${idx}`}>
                      <td>{bucket.label ?? "—"}</td>
                      <td>{bucket.count ?? 0}</td>
                      <td>{formatPercent(bucket.default_rate)}</td>
                      <td>{formatPercent(bucket.fraud_rate)}</td>
                      <td>{formatPercent(bucket.avg_similarity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showReport && (
            <p style={{ color: "#475569", marginTop: 10 }}>
              <strong>Compte rendu:</strong> {similarityReport}
            </p>
          )}
          {similarityAnalysis && (
            <div style={{ marginTop: 10, color: "#475569" }}>
              <strong>Analyse détaillée:</strong>
              <div style={{ marginTop: 6 }}>
                {similarityAnalysis.recommendation && (
                  <span className="badge" style={{ background: "#e2e8f0", color: "#0f172a", marginRight: 6 }}>
                    {similarityAnalysis.recommendation}
                  </span>
                )}
                {similarityAnalysis.risk_level && (
                  <span className="badge" style={{ background: "#dbeafe", color: "#1e3a8a", marginRight: 6 }}>
                    Risque: {similarityAnalysis.risk_level}
                  </span>
                )}
                {typeof similarityAnalysis.risk_score === "number" && (
                  <span className="badge" style={{ background: "#f1f5f9", color: "#0f172a" }}>
                    Score: {similarityAnalysis.risk_score.toFixed(2)}
                  </span>
                )}
              </div>
              {similarityAnalysis.payment_history_assessment?.note && (
                <p style={{ marginTop: 6 }}>
                  <strong>Historique paiement:</strong> {similarityAnalysis.payment_history_assessment.note}
                </p>
              )}
              {similarityAnalysis.points_forts && similarityAnalysis.points_forts.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <strong>Points forts:</strong>
                  <ul style={{ paddingLeft: 16 }}>
                    {similarityAnalysis.points_forts.map((item, idx) => (
                      <li key={`${item}-${idx}`} style={{ color: "#475569" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {similarityAnalysis.points_faibles && similarityAnalysis.points_faibles.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <strong>Points faibles:</strong>
                  <ul style={{ paddingLeft: 16 }}>
                    {similarityAnalysis.points_faibles.map((item, idx) => (
                      <li key={`${item}-${idx}`} style={{ color: "#475569" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {similarityAnalysis.conditions && similarityAnalysis.conditions.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <strong>Conditions:</strong>
                  <ul style={{ paddingLeft: 16 }}>
                    {similarityAnalysis.conditions.map((item, idx) => (
                      <li key={`${item}-${idx}`} style={{ color: "#475569" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {similarityCases.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>Dossiers proches (top):</strong>
              <table className="table" style={{ marginTop: 6, fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Similarité</th>
                    <th>Statut</th>
                    <th>Montant</th>
                    <th>Durée</th>
                    <th>Profil</th>
                  </tr>
                </thead>
                <tbody>
                  {similarityCases.map((c, idx) => (
                    <tr key={`${c.case_id ?? "case"}-${idx}`}>
                      <td>{typeof c.similarity_pct === "number" ? `${c.similarity_pct}%` : formatScore(c.similarity_score)}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              c.status === "FRAUD" ? "#fef3c7" : c.status === "DEFAULT" ? "#fee2e2" : "#dcfce7",
                            color:
                              c.status === "FRAUD" ? "#92400e" : c.status === "DEFAULT" ? "#991b1b" : "#166534",
                          }}
                        >
                          {formatSimilarityStatus(c.status)}
                        </span>
                      </td>
                      <td>{c.loan_amount ?? "—"} €</td>
                      <td>{c.loan_duration ?? "—"} mois</td>
                      <td>
                        {c.employment_type ?? "—"} ({c.contract_type ?? "—"})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {showDecisionDetails && (
        <div style={{ marginTop: 12 }}>
          <strong>Recommandation de décision:</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            <span className="badge" style={decisionBadgeStyle(decisionDetails?.recommendation)}>
              {formatDecisionLabel(decisionDetails?.recommendation)}
            </span>
            {typeof decisionDetails?.confidence === "number" && (
              <span className="badge" style={{ background: "#dbeafe", color: "#1e3a8a" }}>
                Confiance: {(decisionDetails.confidence * 100).toFixed(0)}%
              </span>
            )}
            {decisionDetails?.human_review_required && (
              <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                Revue humaine requise
              </span>
            )}
          </div>
          {decisionDetails?.summary && (
            <p style={{ color: "#475569", marginTop: 8 }}>
              <strong>Pourquoi:</strong> {decisionDetails.summary}
            </p>
          )}
          {decisionDetails?.reasons && decisionDetails.reasons.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Raisons clés:</strong>
              <ul style={{ paddingLeft: 16 }}>
                {decisionDetails.reasons.map((reason, idx) => (
                  <li key={`${reason.code ?? "reason"}-${idx}`} style={{ color: "#475569" }}>
                    {reason.label || getFlagLabel(reason.code || "", "decision")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {decisionDetails?.review_triggers && decisionDetails.review_triggers.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Déclencheurs de revue:</strong>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {decisionDetails.review_triggers.map((trigger) => (
                  <span key={trigger} className="badge" style={{ background: "#e2e8f0", color: "#0f172a" }}>
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
          {decisionDetails?.conflicts && decisionDetails.conflicts.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Conflits détectés:</strong>
              <ul style={{ paddingLeft: 16 }}>
                {decisionDetails.conflicts.map((conflict, idx) => (
                  <li key={`${conflict.type ?? "conflict"}-${idx}`} style={{ color: "#475569" }}>
                    {conflict.description || conflict.type || "Conflit"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {decisionDetails?.risk_indicators && decisionDetails.risk_indicators.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Indicateurs de risque:</strong>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {decisionDetails.risk_indicators.map((indicator) => (
                  <span key={indicator} className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {showDocumentDetails && (
        <div style={{ marginTop: 12 }}>
          <strong>Synthèse documentaire:</strong>
          <p style={{ color: "#475569", marginTop: 6 }}>
            {explanations?.global_summary ||
              `Cohérence ${formatConsistency(documentDetails?.consistency_level)}. Analyse des documents réalisée.`}
          </p>
          <div style={{ display: "grid", gap: 6, marginTop: 8, color: "#475569" }}>
            {typeof documentDetails?.dds_score === "number" && (
              <div>Score de cohérence: {documentDetails.dds_score.toFixed(2)}</div>
            )}
            {documentDetails?.consistency_level && (
              <div>Niveau de cohérence: {formatConsistency(documentDetails.consistency_level)}</div>
            )}
            {documentDetails?.extracted_fields && (
              <div>
                Champs extraits: revenu {documentDetails.extracted_fields.income_documented ?? "—"} € • contrat{" "}
                {documentDetails.extracted_fields.contract_type_detected ?? "—"} • ancienneté{" "}
                {documentDetails.extracted_fields.seniority_detected_years ?? "—"} ans
              </div>
            )}
          </div>
          {documentDetails?.missing_documents && documentDetails.missing_documents.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Documents manquants:</strong>
              <ul style={{ paddingLeft: 16 }}>
                {documentDetails.missing_documents.map((doc, idx) => (
                  <li key={`${doc}-${idx}`} style={{ color: "#475569" }}>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {documentDetails?.suspicious_patterns && documentDetails.suspicious_patterns.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Motifs suspects:</strong>
              <ul style={{ paddingLeft: 16 }}>
                {documentDetails.suspicious_patterns.map((pattern, idx) => (
                  <li key={`${pattern}-${idx}`} style={{ color: "#475569" }}>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
