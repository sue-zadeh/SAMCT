import { useState } from "react";
import Navbar from "./navbar";

type UserItem = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  village: string;
  isActive: boolean;
  profileImageUrl: string;
};

function ManageUsers() {
  const [users, setUsers] = useState<UserItem[]>([
    {
      id: 1,
      userName: "joe1",
      firstName: "Joe",
      lastName: "J",
      email: "joe@example.com",
      role: "Resident",
      village: "Ngatea",
      isActive: true,
      profileImageUrl: "https://via.placeholder.com/56",
    },
    {
      id: 2,
      userName: "graeme1",
      firstName: "Graeme",
      lastName: "Norton",
      email: "graeme@example.com",
      role: "CompanySecretary",
      village: "Whitianga",
      isActive: true,
      profileImageUrl: "https://via.placeholder.com/56",
    },
    {
      id: 3,
      userName: "vmngatea1",
      firstName: "David",
      lastName: "Dindin",
      email: "david@example.com",
      role: "VillageManager",
      village: "Ngatea",
      isActive: false,
      profileImageUrl: "https://via.placeholder.com/56",
    },
  ]);

  const handleFieldChange = (
    id: number,
    field: keyof UserItem,
    value: string | boolean
  ) => {
    const updated = users.map((user) =>
      user.id === id ? { ...user, [field]: value } : user
    );
    setUsers(updated);
  };

  const toggleActive = (id: number) => {
    const updated = users.map((user) =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updated);
  };

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <div className="p-4 border rounded-4 shadow-sm bg-white">
          <p className="text-uppercase text-primary fw-semibold mb-1">Admin Control</p>
          <h1 className="fw-bold mb-2">Manage Users</h1>
          <p className="text-secondary mb-4">
            Admins can edit profiles, control usernames, and activate or deactivate users.
          </p>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Village</th>
                  <th>Status</th>
                  <th style={{ minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={user.profileImageUrl}
                          alt={user.firstName}
                          width="48"
                          height="48"
                          className="rounded-circle border"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={user.userName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "userName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={user.firstName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "firstName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={user.lastName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "lastName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        value={user.email}
                        onChange={(e) =>
                          handleFieldChange(user.id, "email", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={user.role}
                        onChange={(e) =>
                          handleFieldChange(user.id, "role", e.target.value)
                        }
                      >
                        <option value="Resident">Resident</option>
                        <option value="VillageManager">Village Manager</option>
                        <option value="CompanySecretary">Company Secretary</option>
                        <option value="FinancialAdvisor">Financial Advisor</option>
                        <option value="Chairman">Chairman</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={user.village}
                        onChange={(e) =>
                          handleFieldChange(user.id, "village", e.target.value)
                        }
                      >
                        <option value="Papakura">Papakura</option>
                        <option value="Ngatea">Ngatea</option>
                        <option value="Whitianga">Whitianga</option>
                      </select>
                    </td>

                    <td>
                      {user.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>

                    <td>
                      <button
                        className={`btn btn-sm w-100 ${
                          user.isActive ? "btn-outline-danger" : "btn-outline-success"
                        }`}
                        onClick={() => toggleActive(user.id)}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button className="btn btn-primary">Save All Changes</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ManageUsers;