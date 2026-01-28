import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { CreditRequest } from "../../api/types";
import { formatDateTime, statusBadgeStyle, statusLabel } from "../../utils/format";
import { useAuthStore } from "../../features/auth/authStore";

export const ClientRequestsPage = () => {
  const [items, setItems] = useState<CreditRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState<string | null>(() => localStorage.getItem("clientRequestsSince"));
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { logout } = useAuthStore();

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

  const normalizeStatus = (value?: string | null) => {
    const raw = (value || "").toLowerCase();
    if (raw === "under_review") return "in_review";
    if (raw === "en_attente") return "pending";
    if (raw === "en_revue") return "in_review";
    if (raw === "approuve" || raw === "approuvée" || raw === "approved") return "approved";
    if (raw === "refuse" || raw === "refusée" || raw === "rejected") return "rejected";
    return raw;
  };

  const filtered = useMemo(() => {
    const fromTs = since ? new Date(since).getTime() : null;
    const base = fromTs
      ? items.filter((req) => new Date(req.created_at).getTime() >= fromTs)
      : items;
    const search = searchTerm.trim().toLowerCase();
    const statusOk = (req: CreditRequest) =>
      statusFilter === "all" || normalizeStatus(req.status) === normalizeStatus(statusFilter);
    const searchOk = (req: CreditRequest) =>
      search.length === 0 || req.id.toLowerCase().includes(search);
    return base.filter((req) => statusOk(req) && searchOk(req));
  }, [items, since, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const pending = items.filter((req) => {
      const s = normalizeStatus(req.status);
      return s === "pending" || s === "in_review";
    });
    const decided = items.filter((req) => {
      const s = normalizeStatus(req.status);
      return s === "approved" || s === "rejected";
    });
    return { pendingCount: pending.length, decidedCount: decided.length };
  }, [items]);

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
    <div className="client-dashboard">
      <div className="client-topbar">
        <div className="client-topbar-title">
          <h1>Mes demandes</h1>
          <p>Suivez l'état de vos demandes et les actions à effectuer.</p>
        </div>
        <div className="client-topbar-actions">
          <button
            className="button-ghost"
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Déconnexion
          </button>
          <Link className="button-primary" to="/client/requests/new">
            Créer une demande
          </Link>
        </div>
      </div>

      <div className="client-notification">
        <div>
          <strong>Notifications</strong>
          <p>Dernière mise à jour : {lastUpdated ? formatDateTime(lastUpdated) : "—"}</p>
        </div>
        <div className="client-notification-actions">
          <button className="button-ghost" type="button" onClick={resetToNow}>
            Réinitialiser à maintenant
          </button>
          {since && (
            <button className="button-ghost" type="button" onClick={clearFilter}>
              Afficher tous
            </button>
          )}
        </div>
      </div>

      <div className="banker-kpis">
        <div className="banker-kpi-card">
          <div className="banker-kpi-title">Demandes en attente</div>
          <div className="banker-kpi-value">{stats.pendingCount}</div>
          <div className="banker-kpi-sub">À traiter</div>
        </div>
        <div className="banker-kpi-card">
          <div className="banker-kpi-title">Demandes traitées</div>
          <div className="banker-kpi-value">{stats.decidedCount}</div>
          <div className="banker-kpi-sub">Approuvées ou refusées</div>
        </div>
      </div>

      <div className="banker-filters">
        <div className="banker-filter-group">
          <label>Recherche</label>
          <input
            className="banker-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par ID"
          />
        </div>
        <div className="banker-filter-group">
          <label>Statut</label>
          <select className="banker-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_review">En revue</option>
            <option value="approved">Approuvée</option>
            <option value="rejected">Refusée</option>
          </select>
        </div>
        <div className="banker-filter-group">
          <label>Fenêtre</label>
          <div className="banker-filter-actions">
            <button className="button-ghost" type="button" onClick={resetToNow}>
              Réinitialiser à maintenant
            </button>
            {since && (
              <button className="button-ghost" type="button" onClick={clearFilter}>
                Afficher tous
              </button>
            )}
          </div>
          <span className="banker-filter-hint">
            {since ? `Depuis le ${new Date(since).toLocaleString()}` : "Tous les dossiers"}
          </span>
          <span className="banker-filter-hint">
            {lastUpdated ? `Sync: ${formatDateTime(lastUpdated)}` : "Sync: —"}
          </span>
        </div>
      </div>

      <div className="banker-table-card">
        <div className="banker-table-scroll">
          <table className="banker-table">
            <thead>
              <tr>
                <th>Demande</th>
                <th>Créée le</th>
                <th>Statut</th>
                <th>Résumé</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span className="banker-link">#{req.id}</span>
                  </td>
                  <td>{formatDateTime(req.created_at)}</td>
                  <td>
                    <span className="badge" style={statusBadgeStyle(req.status)}>
                      {statusLabel(req.status)}
                    </span>
                  </td>
                  <td>{req.summary || "—"}</td>
                  <td>
                    <Link className="banker-action" to={`/client/requests/${req.id}`}>
                      Voir détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="banker-empty">Aucune demande ne correspond aux filtres.</div>}
        <div className="banker-results">
          Affichage {filtered.length} sur {items.length} demandes
        </div>
      </div>
    </div>
  );
};
