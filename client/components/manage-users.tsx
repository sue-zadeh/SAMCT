import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./navbar";

type UserItem = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  village: string;
  isActive: boolean;
  profileImageUrl: string;
};

function ManageUsers() {
  const API_BASE_URL = "http://localhost:5072";
  const [users, setUsers] = useState<UserItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getImageSrc = (url: string) => {
    if (!url) return "https://via.placeholder.com/56";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const loadUsers = async () => {
    try {
      setError("");
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(response.data);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFieldChange = (
    id: number,
    field: keyof UserItem,
    value: string | boolean
  ) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: value } : user))
    );
  };

  const toggleActive = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setMessage("");
      setError("");

      for (const user of users) {
        await axios.put(`${API_BASE_URL}/api/users/${user.id}`, user);
      }

      setMessage("All user changes saved successfully.");
      loadUsers();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to save user changes.");
    }
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

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

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
                  <th style={{ minWidth: "130px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <img
                        src={getImageSrc(user.profileImageUrl)}
                        alt={user.firstName}
                        width="48"
                        height="48"
                        className="rounded-circle border"
                        style={{ objectFit: "cover" }}
                      />
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
            <button className="btn btn-primary" onClick={handleSaveAll}>
              Save All Changes
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ManageUsers;