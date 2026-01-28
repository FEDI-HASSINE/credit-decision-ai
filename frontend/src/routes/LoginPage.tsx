import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { http } from "../api/http";
import { LoginRequest, LoginResponse } from "../api/types";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: LoginRequest = { email, password };
      const res = await http.post<LoginResponse>("/auth/login", payload, { auth: false });
      setAuth({ token: res.token, role: res.role, userId: res.user_id });
      if (res.role === "banker") navigate("/banker/requests", { replace: true });
      else navigate("/client/requests", { replace: true, state: location.state });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">
            <span>CD</span>
          </div>
          <h1>Credit Decision AI</h1>
          <p>Décision de crédit assistée par IA</p>
        </div>

        <div className="login-card">
          <h2>Connexion</h2>
          <p className="login-subtitle">Identifiez-vous pour accéder à votre espace.</p>
          <form className="login-form" onSubmit={onSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrapper">
                <span className="login-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    <path d="m4 8 8 5 8-5" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="banker1@test.com"
                  required
                />
              </div>
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="login-input-wrapper">
                <span className="login-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M16 10V7a4 4 0 0 0-8 0v3" />
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="hashed-password"
                  required
                />
              </div>
            </div>
            {error && <div className="login-error">{error}</div>}
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="login-footer">Propulsé par l'analyse multi-agent</p>
      </div>
    </div>
  );
};
