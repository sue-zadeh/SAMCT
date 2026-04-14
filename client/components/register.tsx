import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Resident",
    profileImageUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      return "All required fields must be filled.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Invalid email format.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setNotification(error);
      return;
    }

    try {
      setIsLoading(true);
      setNotification("");

      const response = await axios.post("http://localhost:5072/api/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileImageUrl: formData.profileImageUrl,
      });

      setNotification(response.data.message || "User registered successfully.");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error: any) {
      setNotification(
        error?.response?.data?.message || "Failed to register user."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center py-5"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: "550px", width: "100%" }}>
        <h2 className="text-center mb-4">Register User</h2>

        {notification && (
          <div className="alert alert-info text-center">{notification}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <FaUser className="me-2" />
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                <FaUser className="me-2" />
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              <FaEnvelope className="me-2" />
              Email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <FaUser className="me-2" />
              Role
            </label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Resident">Resident</option>
              <option value="Admin">Admin</option>
              <option value="CompanySecretary">Company Secretary</option>
              <option value="FinanceAdmin">Finance Admin</option>
              <option value="VillageManager">Village Manager</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">
              <FaImage className="me-2" />
              Profile Image URL
            </label>
            <input
              type="text"
              className="form-control"
              name="profileImageUrl"
              value={formData.profileImageUrl}
              onChange={handleChange}
              placeholder="Optional image URL"
            />
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">
              <FaLock className="me-2" />
              Password
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div className="mb-4">
            <label className="form-label">
              <FaLock className="me-2" />
              Confirm Password
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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

          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register User"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;