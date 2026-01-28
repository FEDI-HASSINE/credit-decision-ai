import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { BankerRequest } from "../../api/types";
import { formatCurrency, formatDateTime, statusBadgeStyle, statusLabel } from "../../utils/format";
import { useAuthStore } from "../../features/auth/authStore";

export const BankerRequestsPage = () => {
  const [items, setItems] = useState<BankerRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const normalizeStatus = (value?: string | null) => {
    const raw = (value || "").toLowerCase();
    if (raw === "under_review") return "in_review";
    if (raw === "en_attente") return "pending";
    if (raw === "en_revue") return "in_review";
    if (raw === "approuve" || raw === "approuvée" || raw === "approved") return "approved";
    if (raw === "refuse" || raw === "refusée" || raw === "rejected") return "rejected";
    return raw;
  };

  const filteredItems = useMemo(() => {
    const fromTs = since ? new Date(since).getTime() : null;
    const base = fromTs
      ? items.filter((req) => new Date(req.created_at).getTime() >= fromTs)
      : items;
    const search = searchTerm.trim().toLowerCase();
    const statusOk = (req: BankerRequest) =>
      statusFilter === "all" || normalizeStatus(req.status) === normalizeStatus(statusFilter);
    const searchOk = (req: BankerRequest) =>
      search.length === 0 ||
      req.id.toLowerCase().includes(search) ||
      req.client_id.toLowerCase().includes(search);
    const sortByDate = (a: BankerRequest, b: BankerRequest) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return base.filter((req) => statusOk(req) && searchOk(req)).sort(sortByDate);
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
    const totalVolume = items.reduce((sum, req) => sum + (req.amount ?? 0), 0);
    const avgConfidence =
      items.length > 0
        ? items.reduce((sum, req) => sum + (req.auto_decision_confidence ?? 0), 0) / items.length
        : 0;
    return {
      pendingCount: pending.length,
      decidedCount: decided.length,
      totalVolume,
      avgConfidence,
    };
  }, [items]);

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
    <div className="banker-dashboard">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
      </div>
      {toast && (
        <div className="card" style={{ background: "#ecfeff", borderColor: "#99f6e4", color: "#0f766e" }}>
          {toast}
        </div>
      )}
      <div className="banker-header">
        <h1>Tableau des demandes</h1>
        <p>Suivi des demandes clients et décisions en cours.</p>
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
        <div className="banker-kpi-card">
          <div className="banker-kpi-title">Volume total</div>
          <div className="banker-kpi-value">{formatCurrency(stats.totalVolume)} €</div>
          <div className="banker-kpi-sub">Montants demandés</div>
        </div>
        <div className="banker-kpi-card">
          <div className="banker-kpi-title">Confiance moyenne</div>
          <div className="banker-kpi-value">{Math.round(stats.avgConfidence * 100)}%</div>
          <div className="banker-kpi-sub">Auto-décisions</div>
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
            placeholder="Rechercher par ID ou client"
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
                <th>Client</th>
                <th>Montant</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Mise à jour</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span className="banker-link">#{req.id}</span>
                  </td>
                  <td>Client {req.client_id}</td>
                  <td>{formatCurrency(req.amount)} €</td>
                  <td>{req.duration_months ?? "—"} mois</td>
                  <td>
                    <span className="badge" style={statusBadgeStyle(req.status)}>
                      {statusLabel(req.status)}
                    </span>
                  </td>
                  <td>{formatDateTime(req.updated_at)}</td>
                  <td>
                    <Link className="banker-action" to={`/banker/requests/${req.id}`}>
                      Voir détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <div className="banker-empty">Aucune demande ne correspond aux filtres.</div>}
        <div className="banker-results">
          Affichage {filteredItems.length} sur {items.length} demandes
        </div>
      </div>
    </div>
  );
};
