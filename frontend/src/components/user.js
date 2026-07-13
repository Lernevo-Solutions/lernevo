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
    const API_URL = "https://lernevo-backend-staging-771297649928.us-central1.run.app/api/users/";

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

  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user_role",
          user_id: userId,
          role: newRole,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Role update failed");
      alert(data.message);
      fetchUsers(); 
    } catch (error) {
      alert(error.message);
    }
  };

  const maskEmail = (email = "") => {
    if (!email) return "-";
    const value = String(email).trim();
    if (value === "-") return "-";
    const [localPart, domainPart] = value.split("@");
    if (!domainPart) {
      if (value.length <= 6) return `${value.slice(0, 2)}***${value.slice(-1)}`;
      const visibleStart = value.slice(0, 4);
      const visibleEnd = value.slice(-2);
      const maskedLength = Math.max(value.length - visibleStart.length - visibleEnd.length, 3);
      return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
    }
    if (localPart.length <= 7) return `${localPart.slice(0, 4)}***${localPart.slice(-3)}@${domainPart}`;
    const visibleStart = localPart.slice(0, 4);
    const visibleEnd = localPart.slice(-3);
    const maskedLength = Math.max(localPart.length - visibleStart.length - visibleEnd.length, 3);
    return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}@${domainPart}`;
  };

  const maskPhone = (phone = "") => {
    if (!phone || phone === "-") return "-";
    const value = String(phone).trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
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
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok || !data.success) throw new Error(data.error || "Update failed");
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHardResetPassword = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to hard reset password for ${user.username}?\nPassword will be set to default "Temp@123" and they must change it on next login.`
    );
    if (!confirmed) return;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_hard_reset_password",
          user_id: user.id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Reset failed");
      alert(data.message);
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete ${user.username}?`);
    if (!confirmed) return;
    setDeletingId(user.id);
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!response.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      String(user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: { maxWidth: "1400px", margin: "20px auto", background: "white", borderRadius: "15px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", overflow: "hidden", fontFamily: "sans-serif" },
    header: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "30px", textAlign: "center" },
    headerH1: { fontSize: "28px", marginBottom: "8px" },
    headerP: { opacity: 0.9, fontSize: "14px" },
    searchBar: { padding: "20px 30px", background: "white", borderBottom: "1px solid #e0e0e0" },
    searchInput: { width: "100%", padding: "12px 20px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "16px" },
    tableContainer: { overflowX: "auto", padding: "0 30px 30px 30px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#f8f9fa", padding: "15px 12px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e0e0e0" },
    td: { padding: "12px", borderBottom: "1px solid #f0f0f0", color: "#555" },
    code: { background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" },
    badgeActive: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", background: "#e8f5e9", color: "#2e7d32" },
    badgeFrozen: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", background: "#ffebee", color: "#c62828" },
    loading: { textAlign: "center", padding: "50px", color: "#667eea", fontSize: "18px" },
    actionsCell: { display: "flex", gap: "8px", flexWrap: "wrap" },
    actionButton: { border: "none", borderRadius: "999px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
    editButton: { background: "#e8f0fe", color: "#1a56db" },
    hardResetBtn: { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" },
    deleteButton: { background: "#fee2e2", color: "#b91c1c" },
    roleSelect: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "600", backgroundColor: "#fff", cursor: "pointer" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "18px", overflow: "hidden" },
    modalHeader: { padding: "20px 24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" },
    modalBody: { padding: "24px", display: "grid", gap: "14px" },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    field: { display: "grid", gap: "6px" },
    label: { fontSize: "13px", fontWeight: 700, color: "#334155" },
    input: { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #d1d5db", boxSizing: "border-box" },
    modalActions: { padding: "0 24px 24px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" },
    secondaryBtn: { border: "1px solid #cbd5e1", background: "#fff", padding: "10px 16px", borderRadius: "10px", cursor: "pointer" },
    primaryBtn: { border: "none", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", padding: "10px 16px", borderRadius: "10px", cursor: "pointer" },
    container: {
  maxWidth: "1400px",
  margin: "100px auto 20px auto",
  background: "white",
  borderRadius: "15px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  overflow: "hidden",
  fontFamily: "sans-serif"
},
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>User Management</h1>
        <p style={styles.headerP}>Manage codes, privileges and structural roles</p>
      </div>

      <div style={styles.searchBar}>
        <input type="text" style={styles.searchInput} placeholder="Search user..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Country</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Registered At</th>
                <th style={styles.th}>Status</th>
               
                <th style={styles.th}>Assign Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}><code style={styles.code}>{user.user_code}</code></td>
                  <td style={styles.td}><strong>{user.username}</strong></td>
                  <td style={styles.td}>{maskEmail(user.email)}</td>
                  <td style={styles.td}>{user.country_code}</td>
                  <td style={styles.td}>{maskPhone(user.mobile)}</td>
                  <td style={styles.td}>{user.registered_at}</td>
                  <td style={styles.td}>
                    <span style={user.is_frozen ? styles.badgeFrozen : styles.badgeActive}>
                      {user.is_frozen ? "Frozen" : "Active"}
                    </span>
                  </td>
                  {/* ✅ புதிய தம்பதி: அட்மின் மாற்றுவதற்கான ரோல் Dropdown */}
                  <td style={styles.td}>
                    <select
                      style={styles.roleSelect}
                      value={user.role || "USER"}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="USER">User 👤</option>
                      <option value="TRAINER">Trainer 🏋️</option>
                      <option value="ADMIN">Admin 🛡️</option>
                      <option value="SUPER_ADMIN">Super Admin 👑</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button type="button" style={{ ...styles.actionButton, ...styles.editButton }} onClick={() => openEditModal(user)}>Edit</button>
                      <button type="button" style={{ ...styles.actionButton, ...styles.hardResetBtn }} onClick={() => handleHardResetPassword(user)}>Hard Reset</button>
                      <button type="button" style={{ ...styles.actionButton, ...styles.deleteButton }} onClick={() => handleDeleteUser(user)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div style={styles.modalOverlay} onClick={closeEditModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div><strong>Edit User Profile</strong></div>
              <button type="button" onClick={closeEditModal} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "20px" }}>×</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div style={styles.modalBody}>
                <div style={styles.field}>
                  <label style={styles.label}>Username</label>
                  <input style={styles.input} value={editForm.username} onChange={(e) => handleEditChange("username", e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" value={editForm.email} onChange={(e) => handleEditChange("email", e.target.value)} required />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Country Code</label>
                    <input style={styles.input} value={editForm.country_code} onChange={(e) => handleEditChange("country_code", e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Mobile</label>
                    <input style={styles.input} value={editForm.mobile} onChange={(e) => handleEditChange("mobile", e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.secondaryBtn} onClick={closeEditModal}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default User;