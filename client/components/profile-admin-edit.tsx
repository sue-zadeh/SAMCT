import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import {
  FaPen,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdBadge,
} from "react-icons/fa";

function ProfileAdminEdit() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";

  const [firstName, setFirstName] = useState(localStorage.getItem("firstname") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("lastname") || "");
  const [userName, setUserName] = useState(localStorage.getItem("username") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [village, setVillage] = useState(localStorage.getItem("village") || "Papakura");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setError("");
      setMessage("");

      const currentUsername = localStorage.getItem("username") || "";

      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, {
        currentUsername,
        userName,
        firstName,
        lastName,
        email,
        village,
      });

      const updatedUser = response.data;

      localStorage.setItem("username", updatedUser.userName || "");
      localStorage.setItem("firstname", updatedUser.firstName || "");
      localStorage.setItem("lastname", updatedUser.lastName || "");
      localStorage.setItem("fullname", updatedUser.fullName || "");
      localStorage.setItem("email", updatedUser.email || "");
      localStorage.setItem("role", updatedUser.role || "");
      localStorage.setItem("village", updatedUser.village || "");
      localStorage.setItem("profileImageUrl", updatedUser.profileImageUrl || "");

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate("/admin/profile");
      }, 600);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <div className="p-4 border rounded-4 shadow-sm bg-white">
          <h1 className="fw-bold mb-4 d-flex align-items-center gap-2">
  <FaIdBadge />Edit Admin Profile</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaUser />
    First Name
  </label>
              <input
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaUser />
    Last Name
  </label>

              <input
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaIdBadge />
    Username
  </label>

              <input
                className="form-control"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
             <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaEnvelope />
    Email
  </label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-md-6">
               <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaMapMarkerAlt />
    Village
  </label>
              <select
                className="form-select"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              >
                <option value="Papakura">Papakura</option>
                <option value="Ngatea">Ngatea</option>
                <option value="Whitianga">Whitianga</option>
              </select>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/profile")}
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProfileAdminEdit;