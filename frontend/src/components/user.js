import React, { useState, useEffect } from "react";

function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    country_code: "",
    mobile: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const API_URL =
    "http://127.0.0.1:8000/api/users/";

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success && data.action === "get_all_users") {
        setUsers(data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const maskEmail = (email = "") => {
    if (!email) return "-";
    const value = String(email).trim();
    if (value === "-") return "-";
    const [localPart, domainPart] = value.split("@");
    if (!domainPart) {
      if (value.length <= 6) {
        return `${value.slice(0, 2)}***${value.slice(-1)}`;
      }

      const visibleStart = value.slice(0, 4);
      const visibleEnd = value.slice(-2);
      const maskedLength = Math.max(value.length - visibleStart.length - visibleEnd.length, 3);
      return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
    }

    if (localPart.length <= 6) {
      return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domainPart}`;
    }

    const visibleStart = localPart.slice(0, 4);
    const visibleEnd = localPart.slice(-2);
    const maskedLength = Math.max(localPart.length - visibleStart.length - visibleEnd.length, 3);
    return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}@${domainPart}`;
  };

  const maskPhone = (phone = "") => {
    if (!phone || phone === "-") return "-";
    const value = String(phone).trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) {
      return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
    }

    const visibleStart = digits.slice(0, 3);
    const visibleEnd = digits.slice(-2);
    const maskedLength = Math.max(digits.length - visibleStart.length - visibleEnd.length, 3);
    return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      country_code: user.country_code || "",
      mobile: user.mobile === "-" ? "" : user.mobile || "",
    });
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditingUser(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_user",
          user_id: editingUser.id,
          username: editForm.username.trim(),
          email: editForm.email.trim(),
          country_code: editForm.country_code.trim(),
          mobile: editForm.mobile.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to update user");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? data.user : user
        )
      );
      setEditingUser(null);
    } catch (error) {
      alert(error.message || "Unable to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.username}? This will mark the user as deleted.`
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete user");
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      alert(error.message || "Unable to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      String(user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.mobile || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      maxWidth: "1400px",
      margin: "20px auto",
      background: "white",
      borderRadius: "15px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      overflow: "hidden",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "30px",
      textAlign: "center",
    },
    headerH1: {
      fontSize: "28px",
      marginBottom: "8px",
    },
    headerP: {
      opacity: 0.9,
      fontSize: "14px",
    },
    searchBar: {
      padding: "20px 30px",
      background: "white",
      borderBottom: "1px solid #e0e0e0",
    },
    searchInput: {
      width: "100%",
      padding: "12px 20px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "16px",
      outline: "none",
    },
    tableContainer: {
      overflowX: "auto",
      padding: "0 30px 30px 30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      background: "#f8f9fa",
      padding: "15px 12px",
      textAlign: "left",
      fontWeight: 600,
      color: "#333",
      borderBottom: "2px solid #e0e0e0",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #f0f0f0",
      color: "#555",
    },
    code: {
      background: "#f0f0f0",
      padding: "2px 6px",
      borderRadius: "4px",
      fontSize: "12px",
    },
    badgeActive: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: "#e8f5e9",
      color: "#2e7d32",
    },
    badgeFrozen: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: "#ffebee",
      color: "#c62828",
    },
    loading: {
      textAlign: "center",
      padding: "50px",
      color: "#667eea",
      fontSize: "18px",
    },
    actionsCell: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    actionButton: {
      border: "none",
      borderRadius: "999px",
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 0.15s ease, opacity 0.15s ease",
    },
    editButton: {
      background: "#e8f0fe",
      color: "#1a56db",
    },
    deleteButton: {
      background: "#fee2e2",
      color: "#b91c1c",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      width: "100%",
      maxWidth: "560px",
      background: "#fff",
      borderRadius: "18px",
      boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px 24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalBody: {
      padding: "24px",
      display: "grid",
      gap: "14px",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
    },
    field: {
      display: "grid",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#334155",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    modalActions: {
      padding: "0 24px 24px 24px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },
    secondaryBtn: {
      border: "1px solid #cbd5e1",
      background: "#fff",
      color: "#334155",
      padding: "10px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
    },
    primaryBtn: {
      border: "none",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>User Management</h1>
        <p style={styles.headerP}>
          User Code | Username | Email | Country Code | Registered Date | Last
          Login
        </p>
      </div>

      <div style={styles.searchBar}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search by username, email, or mobile..."
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
        />
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Loading user data...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User Code</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Country Code</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Registered At</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={index % 2 === 0 ? {} : { background: "#fafafa" }}
                >
                  <td style={styles.td}>
                    <code style={styles.code}>{user.user_code}</code>
                  </td>
                  <td style={styles.td}>
                    <strong>{user.username}</strong>
                  </td>
                  <td style={styles.td}>{maskEmail(user.email)}</td>
                  <td style={styles.td}>{user.country_code}</td>
                  <td style={styles.td}>{maskPhone(user.mobile)}</td>
                  <td style={styles.td}>{user.registered_at}</td>
                  <td style={styles.td}>{user.last_login}</td>
                  <td style={styles.td}>
                    <span style={user.is_frozen ? styles.badgeFrozen : styles.badgeActive}>
                      {user.is_frozen ? "Frozen" : "Active"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button
                        type="button"
                        style={{ ...styles.actionButton, ...styles.editButton }}
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{
                          ...styles.actionButton,
                          ...styles.deleteButton,
                          opacity: deletingId === user.id ? 0.6 : 1,
                          cursor: deletingId === user.id ? "wait" : "pointer",
                        }}
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredUsers.length === 0 && (
          <div style={styles.loading}>No users found</div>
        )}
      </div>

      {editingUser && (
        <div style={styles.modalOverlay} onClick={closeEditModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>Edit User</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  Update profile details for {editingUser.username}
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div style={styles.modalBody}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                      style={styles.input}
                      value={editForm.username}
                      onChange={(e) => handleEditChange("username", e.target.value)}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Country Code</label>
                    <input
                      style={styles.input}
                      value={editForm.country_code}
                      onChange={(e) => handleEditChange("country_code", e.target.value)}
                      placeholder="+91"
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Mobile</label>
                  <input
                    style={styles.input}
                    value={editForm.mobile}
                    onChange={(e) => handleEditChange("mobile", e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
{}
{}
export default User;
