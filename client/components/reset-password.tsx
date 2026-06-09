import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

function ResetPassword() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    try {
      setMessage("");
      setError("");

      if (!newPassword || !confirmPassword) {
        setError("Please fill all fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/api/reset-password`, {
        token,
        newPassword,
      });

      setMessage(response.data.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <div className="mx-auto p-4 border rounded-4 shadow-sm bg-white" style={{ maxWidth: "450px" }}>
          <h1 className="text-center fw-bold mb-4">Reset Password</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              New Password
            </label>

            <div className="input-group">
              <input
                type={showNewPassword ? "text" : "password"}
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              Confirm Password
            </label>

            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary w-100" onClick={handleResetPassword}>
            Reset Password
          </button>
        </div>
      </main>
    </>
  );
}

export default ResetPassword;