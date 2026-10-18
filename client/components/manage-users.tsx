import { adminRoles } from '../security/session'
import { API_BASE_URL } from '../security/api'
import { useEffect, useState } from "react";
import axios from "../security/api";
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
  const [users, setUsers] = useState<UserItem[]>([]);
  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getImageSrc = (url: string) => {
    if (!url) return "/profile-placeholder.svg";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const loadUsers = async () => {
    try {
      setError("");
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(response.data);
      setChangedIds(new Set());
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
    setChangedIds(previous => new Set(previous).add(id));
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: value } : user))
    );
  };

  const toggleActive = (id: number) => {
    setChangedIds(previous => new Set(previous).add(id));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      setMessage("");
      setError("");

      for (const user of users.filter(user => changedIds.has(user.id))) {
        await axios.put(`${API_BASE_URL}/api/users/${user.id}`, user);
      }

      setMessage("All user changes saved successfully.");
      await loadUsers();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to save user changes.");
    } finally { setSaving(false); }
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

          {message && <div role="status" className="alert alert-success">{message}</div>}
          {error && <div role="alert" className="alert alert-danger">{error}</div>}

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
                        aria-label={`Username for ${user.userName}`} disabled={saving} value={user.userName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "userName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        aria-label={`First Name for ${user.userName}`} disabled={saving} value={user.firstName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "firstName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        aria-label={`Last Name for ${user.userName}`} disabled={saving} value={user.lastName}
                        onChange={(e) =>
                          handleFieldChange(user.id, "lastName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="form-control"
                        aria-label={`Email for ${user.userName}`} disabled={saving} value={user.email}
                        onChange={(e) =>
                          handleFieldChange(user.id, "email", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <select
                        className="form-select"
                        aria-label={`Role for ${user.userName}`} disabled={saving} value={user.role}
                        onChange={(e) =>
                          handleFieldChange(user.id, "role", e.target.value)
                        }
                      >
                        {['Resident', 'VillageManager', ...adminRoles].map(role => (
                          <option key={role} value={role}>{role.replace(/([a-z])([A-Z])/g, '$1 $2')}</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        aria-label={`Village for ${user.userName}`} disabled={saving} value={user.village}
                        onChange={(e) =>
                          handleFieldChange(user.id, "village", e.target.value)
                        }
                      >
                        {/* <option value="Papakura">Papakura</option> */}
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
                        disabled={saving} onClick={() => toggleActive(user.id)}
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
            <button className="btn btn-primary" disabled={saving || changedIds.size === 0} onClick={handleSaveAll}>
              {saving ? "Saving…" : "Save All Changes"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ManageUsers;