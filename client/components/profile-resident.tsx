import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { FaPen } from "react-icons/fa";
import Navbar from "./navbar";

function ProfileResident() {
  const API_BASE_URL = "http://localhost:5072";

  const firstName = localStorage.getItem("firstname") || "Joe";
  const lastName = localStorage.getItem("lastname") || "J";
  const fullName = localStorage.getItem("fullname") || `${firstName} ${lastName}`;
  const userName = localStorage.getItem("username") || "joe1";
  const email = localStorage.getItem("email") || "joe@example.com";
  const village = localStorage.getItem("village") || "Papakura";
  const role = localStorage.getItem("role") || "Resident";

  const [profileImageUrl, setProfileImageUrl] = useState(
    localStorage.getItem("profileImageUrl") || "https://via.placeholder.com/120"
  );
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profileImageSrc = profileImageUrl.startsWith("blob:")
    ? profileImageUrl
    : profileImageUrl.startsWith("http")
    ? profileImageUrl
    : `${API_BASE_URL}${profileImageUrl}`;

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);

    setProfileImageUrl(previewUrl);
    localStorage.setItem("profileImageUrl", previewUrl);
    setMessage("Profile image updated locally. Save to keep using it in this session.");
  };

  const handleSaveImage = () => {
    localStorage.setItem("profileImageUrl", profileImageUrl);
    setMessage("Profile image updated successfully.");
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
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Resident Profile
                </p>
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
                <h2 className="fw-bold mb-4">My Details</h2>

                <div className="mb-3">
                  <label className="form-label fw-semibold">First Name</label>
                  <input className="form-control" value={firstName} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input className="form-control" value={lastName} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <input className="form-control" value={userName} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input className="form-control" value={email} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <input className="form-control" value={role} readOnly />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold">Village</label>
                  <input className="form-control" value={village} readOnly />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h2 className="fw-bold mb-4">Profile Actions</h2>

                {message && <div className="alert alert-success">{message}</div>}

                <div className="d-grid gap-3">
                  <Link to="/resident/profile/edit" className="btn btn-primary">
                    Edit My Profile
                  </Link>

                  <Link to="/resident/profile/password" className="btn btn-outline-dark">
                    Change Password
                  </Link>

                  <button className="btn btn-outline-secondary" onClick={handleSaveImage}>
                    Save Profile Image
                  </button>
                </div>

                <hr className="my-4" />

                <p className="text-secondary mb-0">
                  Click the pen icon on your picture to choose a new image, then click
                  “Save Profile Image”.
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