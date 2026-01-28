import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { CreditRequestCreate, CreditRequest } from "../../api/types";

export const ClientNewRequestPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("5000");
  const [duration, setDuration] = useState("24");
  const [income, setIncome] = useState("3000");
  const [otherIncome, setOtherIncome] = useState("0");
  const [charges, setCharges] = useState("800");
  const [employment, setEmployment] = useState("employee");
  const [contract, setContract] = useState("permanent");
  const [seniority, setSeniority] = useState("5");
  const [family, setFamily] = useState("single");
  const [childrenCount, setChildrenCount] = useState("0");
  const [spouseEmployed, setSpouseEmployed] = useState<"unknown" | "yes" | "no">("unknown");
  const [housingStatus, setHousingStatus] = useState("owner");
  const [isPrimaryHolder, setIsPrimaryHolder] = useState(true);
  const [employmentDocs, setEmploymentDocs] = useState<File[]>([]);
  const [financeDocs, setFinanceDocs] = useState<File[]>([]);
  const [otherDocs, setOtherDocs] = useState<File[]>([]);
  const [employmentDocNames, setEmploymentDocNames] = useState("contract.pdf");
  const [financeDocNames, setFinanceDocNames] = useState("salary.pdf");
  const [otherDocNames, setOtherDocNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const editCountRef = useRef(0);
  const incomeEditRef = useRef(0);
  const docReuploadRef = useRef(0);

  const markEdit = (type?: "income") => {
    editCountRef.current += 1;
    if (type === "income") incomeEditRef.current += 1;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const submissionSeconds = Math.max(0, Math.round((Date.now() - startRef.current) / 1000));
      const telemetry = {
        submission_duration_seconds: submissionSeconds,
        number_of_edits: editCountRef.current,
        income_field_edits: incomeEditRef.current,
        document_reuploads: docReuploadRef.current,
        back_navigation_count: 0,
        form_abandon_attempts: 0,
      };
      const payload: CreditRequestCreate = {
        amount: Number(amount) || 0,
        duration_months: Number(duration) || 0,
        monthly_income: Number(income) || 0,
        other_income: Number(otherIncome) || 0,
        monthly_charges: Number(charges) || 0,
        employment_type: employment,
        contract_type: contract,
        seniority_years: Number(seniority) || 0,
        family_status: family,
        number_of_children: family === "married" ? Number(childrenCount) || 0 : 0,
        spouse_employed: family === "married" ? (spouseEmployed === "unknown" ? undefined : spouseEmployed === "yes") : undefined,
        housing_status: housingStatus,
        is_primary_holder: isPrimaryHolder,
        documents: [
          ...employmentDocNames.split(",").map((d) => d.trim()).filter(Boolean),
          ...financeDocNames.split(",").map((d) => d.trim()).filter(Boolean),
          ...otherDocNames.split(",").map((d) => d.trim()).filter(Boolean),
        ],
        telemetry,
      };
      let res: CreditRequest;
      const allDocs = [...employmentDocs, ...financeDocs, ...otherDocs];
      if (allDocs.length > 0) {
        const form = new FormData();
        form.append("payload", JSON.stringify(payload));
        allDocs.forEach((file) => form.append("files", file));
        res = await http.postForm<CreditRequest>("/client/credit-requests/upload", form);
      } else {
        res = await http.post<CreditRequest>("/client/credit-requests", payload);
      }
      navigate(`/client/requests/${res.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-form-page">
      <div className="client-form-header">
        <h1>Demander un crédit</h1>
        <p>Complétez les informations pour lancer l’analyse de votre dossier.</p>
      </div>
      <div className="client-form-steps">
        {[
          "Informations financières",
          "Profil professionnel",
          "Documents",
          "Validation",
        ].map((label, index) => {
          const current = index + 1;
          return (
            <div key={label} className={`client-form-step ${step >= current ? "active" : ""}`}>
              <span>{current}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
      <form className="client-form-card" onSubmit={onSubmit}>
        {step === 1 && (
          <div className="client-form-section">
            <h2>Informations financières</h2>
            <div className="client-form-grid">
              <div className="client-form-field">
                <label>Montant (€)</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    markEdit();
                    setAmount(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="client-form-field">
                <label>Durée (mois)</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={duration}
                  onChange={(e) => {
                    markEdit();
                    setDuration(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="client-form-field">
                <label>Revenus mensuels</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={income}
                  onChange={(e) => {
                    markEdit("income");
                    setIncome(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="client-form-field">
                <label>Charges mensuelles</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={charges}
                  onChange={(e) => {
                    markEdit();
                    setCharges(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="client-form-field">
                <label>Autres revenus</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={otherIncome}
                  onChange={(e) => {
                    markEdit("income");
                    setOtherIncome(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="client-form-section">
            <h2>Profil professionnel</h2>
            <div className="client-form-grid">
              <div className="client-form-field">
                <label>Emploi</label>
                <select
                  className="client-form-input"
                  value={employment}
                  onChange={(e) => {
                    markEdit();
                    setEmployment(e.target.value);
                  }}
                >
                  <option value="employee">Salarié</option>
                  <option value="freelancer">Freelance</option>
                  <option value="self_employed">Indépendant</option>
                  <option value="unemployed">Sans emploi</option>
                </select>
              </div>
              <div className="client-form-field">
                <label>Contrat</label>
                <select
                  className="client-form-input"
                  value={contract}
                  onChange={(e) => {
                    markEdit();
                    setContract(e.target.value);
                  }}
                >
                  <option value="permanent">CDI</option>
                  <option value="temporary">CDD</option>
                  <option value="none">Aucun</option>
                </select>
              </div>
              <div className="client-form-field">
                <label>Ancienneté (années)</label>
                <input
                  className="client-form-input"
                  type="number"
                  value={seniority}
                  onChange={(e) => {
                    markEdit();
                    setSeniority(e.target.value);
                  }}
                />
              </div>
              <div className="client-form-field">
                <label>Situation familiale</label>
                <select
                  className="client-form-input"
                  value={family}
                  onChange={(e) => {
                    markEdit();
                    setFamily(e.target.value);
                  }}
                >
                  <option value="single">Célibataire</option>
                  <option value="married">Marié</option>
                  <option value="divorced">Divorcé</option>
                  <option value="widowed">Veuf/veuve</option>
                </select>
              </div>
              {family === "married" && (
                <>
                  <div className="client-form-field">
                    <label>Conjoint employé</label>
                    <select
                      className="client-form-input"
                      value={spouseEmployed}
                      onChange={(e) => {
                        markEdit();
                        setSpouseEmployed(e.target.value as "unknown" | "yes" | "no");
                      }}
                    >
                      <option value="unknown">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </div>
                  <div className="client-form-field">
                    <label>Nombre d'enfants</label>
                    <input
                      className="client-form-input"
                      type="number"
                      value={childrenCount}
                      onChange={(e) => {
                        markEdit();
                        setChildrenCount(e.target.value);
                      }}
                    />
                  </div>
                </>
              )}
              <div className="client-form-field">
                <label>Logement</label>
                <select
                  className="client-form-input"
                  value={housingStatus}
                  onChange={(e) => {
                    markEdit();
                    setHousingStatus(e.target.value);
                  }}
                >
                  <option value="owner">Propriétaire</option>
                  <option value="tenant">Locataire</option>
                  <option value="family">Chez la famille</option>
                </select>
              </div>
              <div className="client-form-field">
                <label>Titulaire principal</label>
                <select
                  className="client-form-input"
                  value={isPrimaryHolder ? "yes" : "no"}
                  onChange={(e) => {
                    markEdit();
                    setIsPrimaryHolder(e.target.value === "yes");
                  }}
                >
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="client-form-section">
            <h2>Documents</h2>
            <div className="client-form-grid">
              <div className="client-form-field">
                <label>Justificatifs situation professionnelle</label>
                <input
                  className="client-form-input"
                  type="file"
                  multiple
                  onChange={(e) => {
                    docReuploadRef.current += 1;
                    setEmploymentDocs(Array.from(e.target.files || []));
                  }}
                />
              </div>
              <div className="client-form-field">
                <label>Noms (professionnels)</label>
                <input
                  className="client-form-input"
                  value={employmentDocNames}
                  onChange={(e) => setEmploymentDocNames(e.target.value)}
                />
              </div>
              <div className="client-form-field">
                <label>Justificatifs situation financière</label>
                <input
                  className="client-form-input"
                  type="file"
                  multiple
                  onChange={(e) => {
                    docReuploadRef.current += 1;
                    setFinanceDocs(Array.from(e.target.files || []));
                  }}
                />
              </div>
              <div className="client-form-field">
                <label>Noms (financiers)</label>
                <input
                  className="client-form-input"
                  value={financeDocNames}
                  onChange={(e) => setFinanceDocNames(e.target.value)}
                />
              </div>
              <div className="client-form-field">
                <label>Autres documents</label>
                <input
                  className="client-form-input"
                  type="file"
                  multiple
                  onChange={(e) => {
                    docReuploadRef.current += 1;
                    setOtherDocs(Array.from(e.target.files || []));
                  }}
                />
              </div>
              <div className="client-form-field">
                <label>Noms (autres)</label>
                <input
                  className="client-form-input"
                  value={otherDocNames}
                  onChange={(e) => setOtherDocNames(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="client-form-section">
            <h2>Validation</h2>
            <div className="client-form-grid">
              <div className="client-form-field">
                <label>Résumé</label>
                <div className="client-form-summary">
                  Montant: {amount || "—"} € • Durée: {duration || "—"} mois • Revenus: {income || "—"} € • Charges: {charges || "—"} €
                </div>
                <div className="client-form-summary">
                  Emploi: {employment} • Contrat: {contract} • Ancienneté: {seniority || "—"} ans
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="client-form-error">{error}</div>}
        <div className="client-form-actions">
          {step > 1 && (
            <button className="button-ghost" type="button" onClick={() => setStep(step - 1)}>
              Précédent
            </button>
          )}
          {step < 4 && (
            <button className="button-primary" type="button" onClick={() => setStep(step + 1)}>
              Suivant
            </button>
          )}
          {step === 4 && (
            <button className="client-form-submit" type="submit" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer la demande"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
