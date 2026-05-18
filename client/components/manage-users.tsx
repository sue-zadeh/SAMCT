import Navbar from "./navbar";

function ManageUsers() {
  const users = [
    {
      id: 1,
      fullName: "Joe J",
      username: "joe.j",
      email: "joe@gmail.com",
      role: "Resident",
      village: "Papakura",
      isActive: true,
    },
    {
      id: 2,
      fullName: "Dave F",
      username: "dave.f",
      email: "dave@gmail.com",
      role: "VillageManager",
      village: "Ngatea",
      isActive: true,
    },
    {
      id: 3,
      fullName: "Graeme Norton",
      username: "graeme.norton",
      email: "graeme@example.com",
      role: "CompanySecretary",
      village: "Papakura",
      isActive: true,
    },
    {
      id: 4,
      fullName: "Sam Dad",
      username: "sam.dad",
      email: "admin2@example.com",
      role: "Chairman",
      village: "Ngatea",
      isActive: false,
    },
  ];

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-5">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  User Management
                </p>
                <h1 className="fw-bold mb-1">Manage Users & Profiles</h1>
                <p className="text-secondary mb-0">
                  Admins can view all users, manage roles, assign villages, and
                  activate or deactivate accounts.
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary">Register New User</button>
                <button className="btn btn-outline-dark">Export List</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <input className="form-control" placeholder="Search by name or email" />
            </div>

            <div className="col-md-3">
              <select className="form-select">
                <option>All Roles</option>
                <option>Resident</option>
                <option>VillageManager</option>
                <option>CompanySecretary</option>
                <option>FinancialAdvisor</option>
                <option>Chairman</option>
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select">
                <option>All Villages</option>
                <option>Papakura</option>
                <option>Ngatea</option>
                <option>Whitianga</option>
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-4">All Profiles</h2>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Village</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.village}</td>
                      <td>
                        {user.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-sm btn-outline-primary">
                            View
                          </button>
                          <button className="btn btn-sm btn-outline-dark">
                            Edit
                          </button>
                          {user.isActive ? (
                            <button className="btn btn-sm btn-outline-danger">
                              Deactivate
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-outline-success">
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ManageUsers;