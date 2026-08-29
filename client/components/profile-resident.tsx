import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "./navbar";
import {
  FaPen,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaIdBadge,
} from "react-icons/fa";

function ProfileResident() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [village, setVillage] = useState("");
  const [role, setRole] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadProfile = async () => {
    try {
      const username = sessionStorage.getItem("username") || "";
      if (!username) return;

      const response = await axios.get(`${API_BASE_URL}/api/users/profile/${username}`);
      const user = response.data;

      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setFullName(user.fullName || "");
      setUserName(user.userName || "");
      setEmail(user.email || "");
      setVillage(user.village || "");
      setRole(user.role || "");
      setProfileImageUrl(user.profileImageUrl || "");

      sessionStorage.setItem("username", user.userName || "");
      sessionStorage.setItem("firstname", user.firstName || "");
      sessionStorage.setItem("lastname", user.lastName || "");
      sessionStorage.setItem("fullname", user.fullName || "");
      sessionStorage.setItem("email", user.email || "");
      sessionStorage.setItem("role", user.role || "");
      sessionStorage.setItem("village", user.village || "");
      sessionStorage.setItem("profileImageUrl", user.profileImageUrl || "");
    } catch {
      setMessage("Failed to load profile.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const profileImageSrc =
    !profileImageUrl
      ? "https://via.placeholder.com/120"
      : profileImageUrl.startsWith("http")
      ? profileImageUrl
      : `${API_BASE_URL}${profileImageUrl}`;

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const username = sessionStorage.getItem("username") || userName || "";

      const response = await axios.post(
        `${API_BASE_URL}/api/users/profile-image`,
        formData,
        {
          params: { username },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data;

      setProfileImageUrl(updatedUser.profileImageUrl || "");
      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setFullName(updatedUser.fullName || "");
      setUserName(updatedUser.userName || "");
      setEmail(updatedUser.email || "");
      setVillage(updatedUser.village || "");
      setRole(updatedUser.role || "");

      sessionStorage.setItem("username", updatedUser.userName || "");
      sessionStorage.setItem("firstname", updatedUser.firstName || "");
      sessionStorage.setItem("lastname", updatedUser.lastName || "");
      sessionStorage.setItem("fullname", updatedUser.fullName || "");
      sessionStorage.setItem("email", updatedUser.email || "");
      sessionStorage.setItem("role", updatedUser.role || "");
      sessionStorage.setItem("village", updatedUser.village || "");
      sessionStorage.setItem("profileImageUrl", updatedUser.profileImageUrl || "");

      setMessage("Profile image updated successfully.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to update profile image.");
    }
  };

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex flex-column flex-lg-row gap-4 align-items-lg-center">
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <img
                  src={profileImageSrc}
                  alt={fullName}
                  width="120"
                  height="120"
                  className="rounded-circle border"
                  style={{ objectFit: "cover" }}
                />

                <button
                  type="button"
                  onClick={handleSelectImage}
                  title="Change profile image"
                  style={{
                    position: "absolute",
                    right: "2px",
                    bottom: "2px",
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#facc15",
                    color: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  }}
                >
                  <FaPen size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">Resident Profile</p>
                <h1 className="fw-bold mb-1">{fullName}</h1>
                <p className="text-secondary mb-0">
                  {role} | Village: {village}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
<h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
  <FaIdBadge />
  My Details
</h2>
                <div className="mb-3">
 <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaUser />
    First Name
  </label>                  <input className="form-control" value={firstName} readOnly />
                </div>

                <div className="mb-3">
<label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaUser />
    Last Name
  </label>                  <input className="form-control" value={lastName} readOnly />
                </div>

                <div className="mb-3">
  <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaIdBadge />
    Username
  </label>
                  <input className="form-control" value={userName} readOnly />
                </div>

                <div className="mb-3">
  <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaEnvelope />
    Email
  </label>
                  <input className="form-control" value={email} readOnly />
                </div>

                <div className="mb-3">
  <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaBuilding />
    Role
  </label>
                  <input className="form-control" value={role} readOnly />
                </div>

                <div className="mb-0">
  <label className="form-label fw-semibold d-flex align-items-center gap-2">
    <FaMapMarkerAlt />
    Village
  </label>
                  <input className="form-control" value={village} readOnly />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
  <FaBuilding />Profile Actions</h2>

                {message && <div className="alert alert-info">{message}</div>}

                <div className="d-grid gap-3">
                  <Link to="/resident/profile/edit" className="btn btn-primary">
                    Edit My Profile
                  </Link>

                  <Link to="/resident/profile/password" className="btn btn-outline-dark">
                    Change Password
                  </Link>
                </div>

                <hr className="my-4" />

                <p className="text-secondary mb-0">
                  Click the pen icon on your picture to change it. It saves immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ProfileResident;