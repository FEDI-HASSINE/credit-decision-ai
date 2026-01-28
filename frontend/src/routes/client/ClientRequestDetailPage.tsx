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
  const [showEdit, setShowEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [income, setIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [charges, setCharges] = useState(0);
  const [employment, setEmployment] = useState("employee");
  const [contract, setContract] = useState("permanent");
  const [seniority, setSeniority] = useState(0);
  const [family, setFamily] = useState("single");
  const [childrenCount, setChildrenCount] = useState(0);
  const [spouseEmployed, setSpouseEmployed] = useState<"unknown" | "yes" | "no">("unknown");
  const [housingStatus, setHousingStatus] = useState("owner");
  const [isPrimaryHolder, setIsPrimaryHolder] = useState(true);
  const [documentNames, setDocumentNames] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await http.get<CreditRequest>(`/client/credit-requests/${id}`);
        setData(res);
        setLastUpdated(new Date().toISOString());
        setAmount(res.amount ?? 0);
        setDuration(res.duration_months ?? 0);
        setIncome(res.monthly_income ?? 0);
        setOtherIncome(res.other_income ?? 0);
        setCharges(res.monthly_charges ?? 0);
        setEmployment(res.employment_type ?? "employee");
        setContract(res.contract_type ?? "permanent");
        setSeniority(res.seniority_years ?? 0);
        setFamily(res.marital_status ?? "single");
        setChildrenCount(res.number_of_children ?? 0);
        setSpouseEmployed(res.spouse_employed === undefined ? "unknown" : res.spouse_employed ? "yes" : "no");
        setHousingStatus(res.housing_status ?? "owner");
        setIsPrimaryHolder(res.is_primary_holder ?? true);
        setDocumentNames((res.documents || []).map((d) => d.file_path.split("/").pop() || d.file_path).join(", "));
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
          setAmount(res.amount ?? 0);
          setDuration(res.duration_months ?? 0);
          setIncome(res.monthly_income ?? 0);
          setOtherIncome(res.other_income ?? 0);
          setCharges(res.monthly_charges ?? 0);
          setEmployment(res.employment_type ?? "employee");
          setContract(res.contract_type ?? "permanent");
          setSeniority(res.seniority_years ?? 0);
          setFamily(res.marital_status ?? "single");
          setChildrenCount(res.number_of_children ?? 0);
          setSpouseEmployed(res.spouse_employed === undefined ? "unknown" : res.spouse_employed ? "yes" : "no");
          setHousingStatus(res.housing_status ?? "owner");
          setIsPrimaryHolder(res.is_primary_holder ?? true);
          setDocumentNames((res.documents || []).map((d) => d.file_path.split("/").pop() || d.file_path).join(", "));
        })
        .catch((err) => setError((err as Error).message))
        .finally(() => setLoading(false));
    }
  };

  const submitResubmission = async () => {
    if (!id) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        amount,
        duration_months: duration,
        monthly_income: income,
        other_income: otherIncome,
        monthly_charges: charges,
        employment_type: employment,
        contract_type: contract,
        seniority_years: seniority,
        family_status: family,
        number_of_children: childrenCount,
        spouse_employed: spouseEmployed === "unknown" ? undefined : spouseEmployed === "yes",
        housing_status: housingStatus,
        is_primary_holder: isPrimaryHolder,
        documents: documentNames.split(",").map((d) => d.trim()).filter(Boolean),
      };
      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      documents.forEach((file) => form.append("files", file));
      const res = await http.postForm<CreditRequest>(`/client/credit-requests/${id}/resubmit`, form);
      setData(res);
      setShowEdit(false);
      setDocuments([]);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
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

      {data.decision && (
        <div className="card">
          <h3>Notification</h3>
          <p style={{ color: "#475569" }}>
            Décision: <strong>{data.decision.decision}</strong> — {data.decision.note || "Aucune note fournie."}
          </p>
          <div style={{ marginTop: 8 }}>
            <button className="button-primary" type="button" onClick={() => setShowEdit((v) => !v)}>
              {showEdit ? "Fermer" : "Modifier ma demande"}
            </button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="card">
          <h3>Mettre à jour ma demande</h3>
          <div className="grid" style={{ gap: 12 }}>
            <div className="grid two">
              <div className="form-group">
                <label>Montant (€)</label>
                <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Durée (mois)</label>
                <input className="input" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Revenus mensuels</label>
                <input className="input" type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Charges mensuelles</label>
                <input className="input" type="number" value={charges} onChange={(e) => setCharges(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Autres revenus</label>
                <input className="input" type="number" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Nombre d'enfants</label>
                <input className="input" type="number" value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Emploi</label>
                <select className="input" value={employment} onChange={(e) => setEmployment(e.target.value)}>
                  <option value="employee">Salarié</option>
                  <option value="freelancer">Freelance</option>
                  <option value="self_employed">Indépendant</option>
                  <option value="unemployed">Sans emploi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contrat</label>
                <select className="input" value={contract} onChange={(e) => setContract(e.target.value)}>
                  <option value="permanent">CDI</option>
                  <option value="temporary">CDD</option>
                  <option value="none">Aucun</option>
                </select>
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Ancienneté (années)</label>
                <input className="input" type="number" value={seniority} onChange={(e) => setSeniority(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Situation familiale</label>
                <select className="input" value={family} onChange={(e) => setFamily(e.target.value)}>
                  <option value="single">Célibataire</option>
                  <option value="married">Marié</option>
                  <option value="divorced">Divorcé</option>
                  <option value="widowed">Veuf/veuve</option>
                </select>
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Conjoint employé</label>
                <select className="input" value={spouseEmployed} onChange={(e) => setSpouseEmployed(e.target.value as "unknown" | "yes" | "no")}>
                  <option value="unknown">Non renseigné</option>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
              <div className="form-group">
                <label>Statut logement</label>
                <select className="input" value={housingStatus} onChange={(e) => setHousingStatus(e.target.value)}>
                  <option value="owner">Propriétaire</option>
                  <option value="tenant">Locataire</option>
                  <option value="family">Chez la famille</option>
                </select>
              </div>
            </div>
            <div className="grid two">
              <div className="form-group">
                <label>Titulaire principal</label>
                <select className="input" value={isPrimaryHolder ? "yes" : "no"} onChange={(e) => setIsPrimaryHolder(e.target.value === "yes")}>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
              <div className="form-group">
                <label>Documents attendus</label>
                <input className="input" value={documentNames} onChange={(e) => setDocumentNames(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Ajouter des documents</label>
              <input className="input" type="file" multiple onChange={(e) => setDocuments(Array.from(e.target.files || []))} />
            </div>
            {formError && <div style={{ color: "#b91c1c", fontSize: 14 }}>{formError}</div>}
            <button className="button-primary" type="button" onClick={submitResubmission} disabled={saving}>
              {saving ? "Envoi..." : "Renvoyer pour analyse"}
            </button>
          </div>
        </div>
      )}

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
