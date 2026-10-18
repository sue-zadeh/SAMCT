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

type LoginErrors = { UserName?: string; Password?: string }
type LoginErrorResponse = { message?: string; errors?: Record<string, string[]> }

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [loading, setLoading] = useState(false);

  const savedUserName = localStorage.getItem("rememberedUsername") || "";

  const [userName, setUserName] = useState(savedUserName);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!savedUserName);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        userName: userName.trim(),
        password,
      });

      if (response.status === 200) {
        setPassword("");
        localStorage.setItem("username", response.data.userName || "");
        localStorage.setItem("firstname", response.data.firstName || "");
        localStorage.setItem("lastname", response.data.lastName || "");
        localStorage.setItem("fullname", response.data.fullName || "");
        localStorage.setItem("email", response.data.email || "");
        localStorage.setItem("role", response.data.role || "");
        localStorage.setItem("village", response.data.village || "");
        localStorage.setItem("profileImageUrl", response.data.profileImageUrl || "");

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", userName.trim());
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        await refresh();
        onLoginSuccess();

        navigate(homeForRole(response.data.role));
      }
    } catch (err) {
      const axiosError = err as AxiosError<LoginErrorResponse>;
      const validation = axiosError.response?.data?.errors;
      const fields = { UserName: validation?.UserName?.[0], Password: validation?.Password?.[0] };

      if (fields.UserName || fields.Password) {
        setFieldErrors(fields);
        setError('Please correct the highlighted fields.');
      } else if (axiosError.response?.data?.message) {
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
              {new URLSearchParams(window.location.search).get("emailUpdated") === "true" && <p role="status" className="alert alert-success">Email updated. Please sign in again. Previous reset links no longer work.</p>}

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
                    className={`form-control${fieldErrors.UserName ? ' is-invalid' : ''}`}
                    aria-invalid={!!fieldErrors.UserName}
                    aria-describedby={fieldErrors.UserName ? 'username-error username-help' : 'username-help'}
                    value={userName}
                    onChange={(e) => { setUserName(e.target.value); setFieldErrors(previous => ({ ...previous, UserName: undefined })) }}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <p id="username-help" className="form-text">Use your account username, including any spaces. This is not your email address.</p>
                  {fieldErrors.UserName && <p id="username-error" className="invalid-feedback">{fieldErrors.UserName}</p>}
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
                      className={`form-control${fieldErrors.Password ? ' is-invalid' : ''}`}
                      aria-invalid={!!fieldErrors.Password}
                      aria-describedby={fieldErrors.Password ? 'password-error' : undefined}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors(previous => ({ ...previous, Password: undefined })) }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.Password && <p id="password-error" className="text-danger small">{fieldErrors.Password}</p>}
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
