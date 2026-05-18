import Navbar from "./navbar";

function ProfileAdmin() {
  const firstName = localStorage.getItem("firstname") || "Graeme";
  const lastName = localStorage.getItem("lastname") || "Norton";
  const fullName = localStorage.getItem("fullname") || `${firstName} ${lastName}`;
  const profileImageUrl =
    localStorage.getItem("profileImageUrl") || "https://via.placeholder.com/120";
  const role = localStorage.getItem("role") || "CompanySecretary";

  const village = localStorage.getItem("village") || "Papakura";
  const email = localStorage.getItem("email") || "admin@example.com";
  const username = localStorage.getItem("username") || "graeme.norton";

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-5">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-4">
              <img
                src={profileImageUrl}
                alt={fullName}
                width="120"
                height="120"
                className="rounded-circle border"
                style={{ objectFit: "cover" }}
              />

              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Admin Profile
                </p>
                <h1 className="fw-bold mb-1">{fullName}</h1>
                <p className="text-secondary mb-0">
                  {role} | Base Village: {village}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h2 className="h4 fw-bold mb-4">My Details</h2>

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
                  <input className="form-control" value={username} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input className="form-control" value={email} readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <input className="form-control" value={role} readOnly />
                </div>

                <div>
                  <label className="form-label fw-semibold">Village</label>
                  <input className="form-control" value={village} readOnly />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h2 className="h4 fw-bold mb-4">Admin Actions</h2>

                <div className="d-grid gap-3">
                  <button className="btn btn-primary">Edit My Profile</button>
                  <button className="btn btn-outline-dark">Change Password</button>
                  <button className="btn btn-outline-secondary">
                    Update Profile Image
                  </button>
                </div>

                <hr className="my-4" />

                <p className="text-secondary mb-0">
                  Admin users should be able to update their own profile and also
                  access the user management area to manage other users.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ProfileAdmin;