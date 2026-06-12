import React, { useState, useEffect } from "react";

function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "https://lernevo-backend-237359549871.us-central1.run.app/api/users/";

  // Get all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.success && data.action === 'get_all_users') {
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

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.toLowerCase().includes(searchTerm.toLowerCase())
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>📊 User Management</h1>
        <p style={styles.headerP}>Username | Email | Country Code | Registered Date | Last Login</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search by username, email, or mobile..."
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = "#667eea"}
          onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
        />
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Loading user data...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Country Code</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>User Code</th>
                <th style={styles.th}>Registered At</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  style={index % 2 === 0 ? {} : { background: "#fafafa" }}
                >
                  <td style={styles.td}><strong>{user.username}</strong></td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.country_code}</td>
                  <td style={styles.td}>{user.mobile || "-"}</td>
                  <td style={styles.td}><code style={styles.code}>{user.user_code}</code></td>
                  <td style={styles.td}>{user.registered_at}</td>
                  <td style={styles.td}>{user.last_login}</td>
                  <td style={styles.td}>
                    <span style={user.is_frozen ? styles.badgeFrozen : styles.badgeActive}>
                      {user.is_frozen ? "🔒 Frozen" : "✅ Active"}
                    </span>
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
    </div>
  );
}

export default User;