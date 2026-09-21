import { useSession, homeForRole } from '../security/session'
import { API_BASE_URL } from '../security/api'
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../security/api";
import { AxiosError } from "axios";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "./navbar";

type LoginProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [loading, setLoading] = useState(false);

  const savedUserName = localStorage.getItem("rememberedUsername") || "";

  const [userName, setUserName] = useState(savedUserName);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!savedUserName);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        localStorage.setItem("username", response.data.userName || "");
        localStorage.setItem("firstname", response.data.firstName || "");
        localStorage.setItem("lastname", response.data.lastName || "");
        localStorage.setItem("fullname", response.data.fullName || "");
        localStorage.setItem("email", response.data.email || "");
        localStorage.setItem("role", response.data.role || "");
        localStorage.setItem("village", response.data.village || "");
        localStorage.setItem("profileImageUrl", response.data.profileImageUrl || "");

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", userName);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        await refresh();
        onLoginSuccess();

        navigate(homeForRole(response.data.role));
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
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="fw-semi-bold text-center text-primary mb-4">
                Welcome to SAMCT Portal
              </h3>

              <h2 className="h3 text-center fst-italic mb-4">Login</h2>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="username">
                    <FaUser className="me-2" />
                    Username
                  </label>
                  <input
                    id="username"
                    name="username" required maxLength={50}
                    type="text"
                    className="form-control"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoComplete="username"
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
                    name="password" required maxLength={72}
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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

                {error && <div role="alert" className="alert alert-danger">{error}</div>}

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember my username
                  </label>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                  Login
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