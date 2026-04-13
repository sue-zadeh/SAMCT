import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login", { email, password });

      if (response.data.message === "Login successful") {
localStorage.setItem("firstname", response.data.FirstName || response.data.firstName || "");
localStorage.setItem("lastname", response.data.LastName || response.data.lastName || "");
localStorage.setItem("fullname", response.data.FullName || response.data.fullName || "");
localStorage.setItem("role", response.data.Role || response.data.role || "");
localStorage.setItem(
  "profileImageUrl",
  response.data.ProfileImageUrl || response.data.profileImageUrl || "https://via.placeholder.com/80"
);
        if (rememberMe) {
          localStorage.setItem("email", email);
        } else {
          localStorage.removeItem("email");
        }

        onLoginSuccess();

        if (response.data.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/resident");
        }
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      console.error("Error during login:", axiosError);

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/forgot-password", { email });

      if (response.data.message === "Password reset email sent successfully") {
        alert("Password reset email sent. Check your inbox.");
        setError("");
      } else {
        setError(response.data.message || "Failed to send reset email.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      console.error("Error during forgot password:", axiosError);

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="login-container d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      <div
        className="login-box p-4 shadow rounded bg-white"
        style={{ width: "400px" }}
      >
        <h2 className="text-center mb-4 text-primary">Welcome to SAMCT Portal</h2>
        <h3 className="text-center my-4">
          <i>{isForgotPassword ? "Forgot Password" : "Login"}</i>
        </h3>

        <div className="form-group mb-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {!isForgotPassword && (
          <div className="form-group mb-3 position-relative">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 pt-3"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {error && <div className="text-danger mb-2">{error}</div>}

        {!isForgotPassword && (
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember Me
            </label>
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          onClick={isForgotPassword ? handleForgotPassword : handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : isForgotPassword
            ? "Send Password Reset Email"
            : "Login"}
        </button>

        <button
          className="btn btn-link w-100 mt-3"
          onClick={() => setIsForgotPassword(!isForgotPassword)}
        >
          {isForgotPassword ? "Back to Login" : "Forgot Password?"}
        </button>
      </div>
    </div>
  );
};

export default Login;