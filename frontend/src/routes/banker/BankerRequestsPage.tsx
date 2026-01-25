import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { http } from "../../api/http";
import { BankerRequest } from "../../api/types";
import { formatDateTime, statusBadgeStyle, statusLabel } from "../../utils/format";

const RequestsSection = ({ title, items }: { title: string; items: BankerRequest[] }) => (
  <div className="card">
    <h2>
      {title} <span style={{ color: "#64748b", fontSize: 14 }}>({items.length})</span>
    </h2>
    {items.length === 0 ? (
      <p style={{ color: "#475569" }}>Aucune demande.</p>
    ) : (
      <div className="grid" style={{ gap: 12 }}>
        {items.map((req) => (
          <div key={req.id} className="card" style={{ border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Demande #{req.id}</strong>
                <div style={{ color: "#475569", fontSize: 14 }}>
                  Client {req.client_id} • {req.amount ?? "-"} € • {req.duration_months ?? "-"} mois
                </div>
              </div>
              <span className="badge" style={statusBadgeStyle(req.status)}>
                {statusLabel(req.status)}
              </span>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#475569" }}>
                Créée le {formatDateTime(req.created_at)}
              </span>
              <Link className="button-ghost" to={`/banker/requests/${req.id}`}>
                Voir détail
              </Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const BankerRequestsPage = () => {
  const [items, setItems] = useState<BankerRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();
  const [since, setSince] = useState<string | null>(() => localStorage.getItem("bankerRequestsSince"));
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const all = await http.get<BankerRequest[]>("/banker/credit-requests");
        if (!active) return;
        setItems(all);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        if (!active) return;
        setError((err as Error).message);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      setToast(state.toast);
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (error) return <div className="card">Erreur: {error}</div>;

  const { pending, decided } = useMemo(() => {
    const fromTs = since ? new Date(since).getTime() : null;
    const filtered = fromTs
      ? items.filter((req) => new Date(req.created_at).getTime() >= fromTs)
      : items;
    const nonTreated = filtered.filter((req) => req.status === "pending" || req.status === "in_review");
    const treated = filtered.filter((req) => req.status === "approved" || req.status === "rejected");
    const sortByDate = (a: BankerRequest, b: BankerRequest) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return {
      pending: nonTreated.sort(sortByDate),
      decided: treated.sort(sortByDate),
    };
  }, [items, since]);

  const resetToNow = () => {
    const now = new Date().toISOString();
    localStorage.setItem("bankerRequestsSince", now);
    setSince(now);
  };

  const clearFilter = () => {
    localStorage.removeItem("bankerRequestsSince");
    setSince(null);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      {toast && (
        <div className="card" style={{ background: "#ecfeff", borderColor: "#99f6e4", color: "#0f766e" }}>
          {toast}
        </div>
      )}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <strong>Filtre des dossiers</strong>
        <span style={{ color: "#475569" }}>
          {since ? `Depuis le ${new Date(since).toLocaleString()}` : "Tous les dossiers"}
        </span>
        <span style={{ color: "#94a3b8" }}>
          {lastUpdated ? `Sync: ${formatDateTime(lastUpdated)}` : "Sync: —"}
        </span>
        <button className="button-ghost" type="button" onClick={resetToNow}>
          Réinitialiser à maintenant
        </button>
        {since && (
          <button className="button-ghost" type="button" onClick={clearFilter}>
            Afficher tous
          </button>
        )}
      </div>
      <RequestsSection title="Demandes non traitées" items={pending} />
      <RequestsSection title="Demandes traitées" items={decided} />
    </div>
  );
};
