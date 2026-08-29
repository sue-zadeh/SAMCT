import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "./navbar";
import { homeForRole, saveSession } from "../lib/auth";
import { API_BASE_URL } from "../lib/api";
import Seo from "./seo";

type LoginProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const savedUserName = localStorage.getItem("rememberedUsername") || "";

  const [userName, setUserName] = useState(savedUserName);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!savedUserName);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        userName,
        password,
      });

      if (response.status === 200) {
        saveSession(response.data);

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", userName);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        onLoginSuccess();

        navigate(homeForRole(response.data.role), { replace: true });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else if (axiosError.message) {
        setError(axiosError.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Secure portal login | SAMCT Villages"
        description="Authorised login for SAMCT residents and staff."
        path="/login"
        noIndex
      />
      <Navbar userType="public" />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="fw-semi-bold text-center text-primary mb-4">
                Welcome to SAMCT Portal
              </h3>

              <h2 className="h3 text-center fst-italic mb-4">Login</h2>

              {searchParams.get('session') === 'expired' && !error && (
                <div className="alert alert-info" role="status">
                  Your secure session expired. Please log in again.
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="username">
                    <FaUser className="me-2" />
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="form-control"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="password">
                    <FaLock className="me-2" />
                    Password
                  </label>

                  <div className="input-group">
                    <input
                    id="password"
                    name="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Signing in…' : 'Login'}
                </button>

                <div className="text-center mt-3">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none small"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
