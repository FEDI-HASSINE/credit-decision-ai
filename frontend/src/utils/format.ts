export const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
};

export const formatPercent = (value?: number | null) => {
  if (typeof value !== "number") return "—";
  return `${(value * 100).toFixed(0)}%`;
};

export const statusLabel = (status?: string | null) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "in_review":
      return "En revue";
    case "approved":
      return "Approuvée";
    case "rejected":
      return "Refusée";
    default:
      return status || "—";
  }
};

export const statusBadgeStyle = (status?: string | null) => {
  switch (status) {
    case "approved":
      return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" };
    case "rejected":
      return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    case "in_review":
      return { background: "#dbeafe", color: "#1e3a8a", border: "1px solid #bfdbfe" };
    case "pending":
      return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
    default:
      return undefined;
  }
};
