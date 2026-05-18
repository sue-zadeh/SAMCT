import Navbar from "./navbar";

function ProfileResident() {
  const firstName = localStorage.getItem("firstname") || "John";
  const lastName = localStorage.getItem("lastname") || "Resident";
  const fullName = localStorage.getItem("fullname") || `${firstName} ${lastName}`;
  const profileImageUrl =
    localStorage.getItem("profileImageUrl") || "https://via.placeholder.com/120";
  const role = localStorage.getItem("role") || "Resident";

  // Temporary until village is stored from backend
  const village = localStorage.getItem("village") || "Papakura";
  const email = localStorage.getItem("email") || "resident@example.com";
  const username = localStorage.getItem("username") || "resident.user";

  return (
    <>
      <Navbar userType="resident" />

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
                  <label className="form-label fw-semibold">Village</label>
                  <input className="form-control" value={village} readOnly />
                </div>

                <div>
                  <label className="form-label fw-semibold">Role</label>
                  <input className="form-control" value={role} readOnly />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h2 className="h4 fw-bold mb-4">Profile Actions</h2>

                <div className="d-grid gap-3">
                  <button className="btn btn-primary">Edit Profile</button>
                  <button className="btn btn-outline-dark">Change Password</button>
                  <button className="btn btn-outline-secondary">
                    Update Profile Image
                  </button>
                </div>

                <hr className="my-4" />

                <p className="text-secondary mb-0">
                  Residents should be able to view their own profile details and,
                  later, update selected information such as password and profile image.
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