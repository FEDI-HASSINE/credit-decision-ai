import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/http";
import { CreditRequest } from "../../api/types";
import { formatDateTime, statusBadgeStyle, statusLabel } from "../../utils/format";

export const ClientRequestsPage = () => {
  const [items, setItems] = useState<CreditRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState<string | null>(() => localStorage.getItem("clientRequestsSince"));
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await http.get<CreditRequest[]>("/client/credit-requests");
        setItems(res);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        setError((err as Error).message);
      }
    };
    load();
    const interval = setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (error) return <div className="card">Erreur: {error}</div>;

  const filtered = useMemo(() => {
    if (!since) return items;
    const fromTs = new Date(since).getTime();
    return items.filter((req) => new Date(req.created_at).getTime() >= fromTs);
  }, [items, since]);

  const resetToNow = () => {
    const now = new Date().toISOString();
    localStorage.setItem("clientRequestsSince", now);
    setSince(now);
  };

  const clearFilter = () => {
    localStorage.removeItem("clientRequestsSince");
    setSince(null);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
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
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Mes demandes</h2>
          <p style={{ color: "#475569" }}>Suivez l'état de vos demandes de crédit.</p>
        </div>
        <Link className="button-primary" to="/client/requests/new">
          Nouvelle demande
        </Link>
      </div>
      {filtered.length === 0 ? (
        <div className="card">
          <p style={{ color: "#475569" }}>Aucune demande pour le moment.</p>
        </div>
      ) : (
        filtered.map((req) => (
          <div key={req.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Demande #{req.id}</strong>
                <div style={{ color: "#475569", fontSize: 14 }}>
                  Créée le {formatDateTime(req.created_at)}
                </div>
              </div>
              <span className="badge" style={statusBadgeStyle(req.status)}>
                {statusLabel(req.status)}
              </span>
            </div>
            {req.summary && <p style={{ marginTop: 8, color: "#475569" }}>{req.summary}</p>}
            <div style={{ marginTop: 8 }}>
              <Link className="button-ghost" to={`/client/requests/${req.id}`}>
                Voir détail
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
