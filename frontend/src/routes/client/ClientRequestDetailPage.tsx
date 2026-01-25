import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../../api/http";
import { CreditRequest } from "../../api/types";
import { AgentPanel } from "../../components/agents/AgentPanel";
import { formatCurrency, formatDate, formatDateTime, formatPercent, statusBadgeStyle, statusLabel } from "../../utils/format";

export const ClientRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CreditRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await http.get<CreditRequest>(`/client/credit-requests/${id}`);
        setData(res);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    const onFocus = () => {
      if (id) load();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  if (loading) return <div className="card">Chargement...</div>;
  if (error) return <div className="card">Erreur: {error}</div>;
  if (!data) return <div className="card">Aucune donnée</div>;

  const verdict = data.auto_decision || "review";
  const verdictLabel =
    verdict === "approve" ? "Vert (faible risque)" : verdict === "reject" ? "Rouge (risque élevé)" : "Orange (revue)";
  const verdictColor =
    verdict === "approve" ? "#16a34a" : verdict === "reject" ? "#dc2626" : "#f59e0b";

  const refresh = () => {
    setLoading(true);
    if (id) {
      http
        .get<CreditRequest>(`/client/credit-requests/${id}`)
        .then((res) => {
          setData(res);
          setLastUpdated(new Date().toISOString());
        })
        .catch((err) => setError((err as Error).message))
        .finally(() => setLoading(false));
    }
  };

  const installments = data.installments || [];
  const payments = data.payments || [];
  const paymentSummary = data.payment_behavior_summary;

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div>
        <button className="button-ghost" type="button" onClick={() => navigate("/client/requests")}>
          Retour à mes demandes
        </button>
      </div>
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <strong>Synchronisation</strong>
        <span style={{ color: "#475569" }}>
          {lastUpdated ? `Dernière mise à jour: ${formatDateTime(lastUpdated)}` : "Dernière mise à jour: —"}
        </span>
        <button className="button-ghost" type="button" onClick={refresh} disabled={loading}>
          {loading ? "Mise à jour..." : "Rafraîchir"}
        </button>
      </div>
      <div className="card">
        <h3>Verdict automatique</h3>
        <div
          className="badge"
          style={{ background: verdictColor + "22", color: verdictColor, border: "1px solid " + verdictColor + "55" }}
        >
          {verdictLabel}
        </div>
        {typeof data.auto_decision_confidence === "number" && (
          <p style={{ color: "#475569", marginTop: 8 }}>
            Confiance: {(data.auto_decision_confidence * 100).toFixed(0)}%
          </p>
        )}
        {data.auto_review_required && (
          <p style={{ marginTop: 6, color: "#b45309" }}>Revue humaine requise.</p>
        )}
      </div>
      <div className="card">
        <h3>Statut</h3>
        <div className="badge" style={statusBadgeStyle(data.status)}>
          {statusLabel(data.status)}
        </div>
        {data.customer_explanation && (
          <p style={{ marginTop: 12 }}>{String(data.customer_explanation)}</p>
        )}
      </div>
      {data.decision && (
        <div className="card">
          <h3>Décision</h3>
          <div className="badge">{data.decision.decision}</div>
          {data.decision.note && <p style={{ marginTop: 8 }}>{data.decision.note}</p>}
          {data.decision.decided_at && (
            <p style={{ color: "#475569", marginTop: 8 }}>
              Décidé le {formatDateTime(data.decision.decided_at)}
            </p>
          )}
        </div>
      )}
      <div className="card">
        <h3>Résumé</h3>
        <p style={{ color: "#475569" }}>{data.summary || "Résumé non disponible"}</p>
      </div>

      {data.loan && (
        <div className="card">
          <h3>Prêt</h3>
          <div style={{ display: "grid", gap: 6, color: "#475569" }}>
            <div>Montant: {formatCurrency(data.loan.principal_amount)} €</div>
            <div>Taux: {(data.loan.interest_rate * 100).toFixed(2)}%</div>
            <div>Durée: {data.loan.term_months} mois</div>
            <div>Statut: {data.loan.status}</div>
            <div>Début: {formatDate(data.loan.start_date)}</div>
            <div>Fin: {formatDate(data.loan.end_date)}</div>
          </div>
        </div>
      )}

      {paymentSummary && (
        <div className="card">
          <h3>Historique de paiement</h3>
          <div style={{ display: "grid", gap: 6, color: "#475569" }}>
            <div>Taux à l'heure: {formatPercent(paymentSummary.on_time_rate)}</div>
            <div>Retard moyen: {paymentSummary.avg_days_late?.toFixed(1)} jours</div>
            <div>Retard max: {paymentSummary.max_days_late} jours</div>
            <div>Tranches manquées: {paymentSummary.missed_installments}</div>
            <div>Dernier paiement: {formatDate(paymentSummary.last_payment_date)}</div>
          </div>
        </div>
      )}

      {installments.length > 0 && (
        <div className="card">
          <h3>Tranches prévues</h3>
          <ul style={{ paddingLeft: 16, color: "#475569" }}>
            {installments.slice(0, 12).map((inst) => (
              <li key={inst.installment_id}>
                #{inst.installment_number} • {formatDate(inst.due_date)} • {formatCurrency(inst.amount_due)} € •{" "}
                {inst.status}
                {typeof inst.days_late === "number" && inst.days_late > 0
                  ? ` (retard ${inst.days_late}j)`
                  : ""}
                {inst.amount_paid ? ` • payé ${formatCurrency(inst.amount_paid)} €` : ""}
              </li>
            ))}
          </ul>
          {installments.length > 12 && (
            <p style={{ color: "#64748b", marginTop: 8 }}>
              {installments.length - 12} tranches supplémentaires…
            </p>
          )}
        </div>
      )}

      {payments.length > 0 && (
        <div className="card">
          <h3>Paiements réalisés</h3>
          <ul style={{ paddingLeft: 16, color: "#475569" }}>
            {payments.slice(0, 12).map((pay) => (
              <li key={pay.payment_id}>
                {formatDate(pay.payment_date)} • {formatCurrency(pay.amount)} € • {pay.channel} • {pay.status}
                {pay.is_reversal ? " (reversal)" : ""}
              </li>
            ))}
          </ul>
          {payments.length > 12 && (
            <p style={{ color: "#64748b", marginTop: 8 }}>
              {payments.length - 12} paiements supplémentaires…
            </p>
          )}
        </div>
      )}
      {data.comments && data.comments.length > 0 && (
        <div className="card">
          <h3>Commentaires du banquier</h3>
          <ul style={{ paddingLeft: 16 }}>
            {data.comments.map((comment, idx) => (
              <li key={`${comment.created_at}-${idx}`} style={{ marginBottom: 8, color: "#475569" }}>
                <strong>{comment.author_id}</strong>: {comment.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.agents?.explanation && (
        <AgentPanel title="Explication" agent={data.agents.explanation} />
      )}
    </div>
  );
};
