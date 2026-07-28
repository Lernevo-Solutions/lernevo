import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import {
  Ban,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  Mail,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "TRAINER", label: "Trainer" },
  { value: "ADMIN", label: "Admin" },
];

const STATUS_OPTIONS = ["All", "Active", "Pending"];
const ROLE_FILTER_OPTIONS = ["All", "User", "Trainer", "Admin"];

const badgeStyles = {
  ADMIN: { background: "rgba(124, 58, 237, 0.14)", color: "#7c3aed" },
  TRAINER: { background: "rgba(245, 158, 11, 0.14)", color: "#d97706" },
  USER: { background: "rgba(16, 185, 129, 0.14)", color: "#059669" },
  Active: { background: "rgba(16, 185, 129, 0.14)", color: "#059669" },
  Pending: { background: "rgba(245, 158, 11, 0.14)", color: "#d97706" },
};

const makeInviteLink = (token) =>
  `${window.location.origin}/get-started?mode=register&invitation_token=${token}`;

function AdminRolesPage() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    trainers: 0,
    admins: 0,
    pending_invites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMember, setProfileMember] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Assign Trainer Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "USER",
  });
  const [editRole, setEditRole] = useState("USER");
  const menuRef = useRef(null);

  // Available Trainers List for Assign Trainer Modal
  const trainersList = useMemo(() => {
    return members.filter(
      (m) => m.kind === "USER" && (m.role || "").toUpperCase() === "TRAINER"
    );
  }, [members]);

  const getMemberUserId = (member) => {
    if (member.user_code) return member.user_code;
    if (member.kind === "INVITATION") {
      return `INV-${(member.id || "").slice(0, 6).toUpperCase()}`;
    }
    if (member.id && member.id.length > 20) {
      return member.id.slice(0, 8);
    }
    return member.id || member.member_id || "-";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        api.get("/roles/members/"),
        api.get("/roles/stats/"),
      ]);
      setMembers(
        Array.isArray(membersRes.data.members) ? membersRes.data.members : []
      );
      setStats(statsRes.data.stats || stats);
    } catch (error) {
      console.error("Failed to load roles data", error);
      alert(error.response?.data?.detail || "Failed to load roles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter((member) => {
      const memberRole = (member.role || "USER").toUpperCase();
      const status = (member.status || "Active").toLowerCase();
      const searchable = [
        getMemberUserId(member),
        member.principal_email,
        member.name,
        member.role,
        member.status,
        member.assigned_trainer_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const matchesRole =
        roleFilter === "All" || memberRole === roleFilter.toUpperCase();
      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, roleFilter, statusFilter]);

  const visibleIds = filteredMembers.map((member) => member.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const refreshStatsOnly = async () => {
    try {
      const statsRes = await api.get("/roles/stats/");
      setStats(statsRes.data.stats || stats);
    } catch (error) {
      console.error("Failed to refresh stats", error);
    }
  };

  const updateMemberInState = (updatedMember) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? { ...member, ...updatedMember } : member
      )
    );
  };

  const removeMemberFromState = (id) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();
    if (!inviteForm.email.trim()) {
      alert("Email is required");
      return;
    }

    setSaving(true);
    try {
      const response = await api.post("/roles/invite/", {
        email: inviteForm.email.trim().toLowerCase(),
        role: inviteForm.role,
      });

      if (response.data?.member) {
        setMembers((prev) => [response.data.member, ...prev]);
      }
      await refreshStatsOnly();
      setInviteOpen(false);
      setInviteForm({ email: "", role: "USER" });
      if (response.data?.warning) {
        alert(response.data.warning);
      } else {
        alert("Invitation created successfully");
      }
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send invitation");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (member) => {
    setEditMember(member);
    setEditRole((member.role || "USER").toUpperCase());
    setEditOpen(true);
    setActiveMenuId(null);
  };

  const saveRoleChange = async () => {
    if (!editMember) return;
    setSaving(true);
    try {
      const response = await api.patch("/roles/change-role/", {
        member_id: editMember.id,
        member_type: editMember.member_type || editMember.kind,
        role: editRole,
      });
      if (response.data?.member) {
        updateMemberInState(response.data.member);
      }
      setEditOpen(false);
      setEditMember(null);
      alert("Role updated successfully");
      await refreshStatsOnly();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = (member) => {
    setAssignUser(member);
    setSelectedTrainerId(member.assigned_trainer_id || "");
    setAssignModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAssignTrainer = async () => {
    if (!assignUser) return;
    setSaving(true);
    try {
      await api.post("/roles/assign-trainer/", {
        user_id: assignUser.id,
        trainer_id: selectedTrainerId || null,
      });
      alert("Trainer assigned successfully!");
      setAssignModalOpen(false);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to assign trainer");
    } finally {
      setSaving(false);
    }
  };

  const resendInvitation = async (member) => {
    setSaving(true);
    try {
      const response = await api.post("/roles/resend/", { id: member.id });
      if (response.data?.member) {
        updateMemberInState(response.data.member);
      }
      alert(response.data?.warning || "Invitation resent successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to resend invitation");
    } finally {
      setSaving(false);
      setActiveMenuId(null);
    }
  };

  const cancelInvitation = async (member) => {
    if (!window.confirm(`Cancel invitation for ${member.principal_email}?`)) return;
    setSaving(true);
    try {
      await api.post("/roles/cancel/", { id: member.id });
      removeMemberFromState(member.id);
      alert("Invitation cancelled");
      await refreshStatsOnly();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to cancel invitation");
    } finally {
      setSaving(false);
      setActiveMenuId(null);
    }
  };

  const copyInvitationLink = async (member) => {
    try {
      await navigator.clipboard.writeText(makeInviteLink(member.token));
      alert("Invitation link copied");
    } catch (error) {
      alert("Could not copy invitation link");
    } finally {
      setActiveMenuId(null);
    }
  };

  const openProfile = (member) => {
    setProfileMember(member);
    setProfileOpen(true);
    setActiveMenuId(null);
  };

  const removeAccess = async (member, label) => {
    if (!window.confirm(`${label} ${member.name || member.principal_email}?`)) return;
    setSaving(true);
    try {
      await api.delete("/users/", { data: { user_id: member.id } });
      removeMemberFromState(member.id);
      alert(`${label} completed`);
      await refreshStatsOnly();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          `Failed to ${label.toLowerCase()}`
      );
    } finally {
      setSaving(false);
      setActiveMenuId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      "User ID",
      "Type",
      "Principal Email",
      "Name",
      "Role",
      "Assigned Trainer",
      "Status",
      "Joined On",
    ];
    const rows = filteredMembers.map((member) => [
      getMemberUserId(member),
      member.kind === "INVITATION" ? "Invitation" : "User",
      member.principal_email || "",
      member.name || "",
      member.role || "",
      member.assigned_trainer_name || "None",
      member.status || "",
      member.joined_on || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roles-members.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const toggleSelectedId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleMenuAction = async (member, action) => {
    setActiveMenuId(null);

    if (action === "edit-role") {
      openEditModal(member);
      return;
    }

    if (action === "assign-trainer") {
      openAssignModal(member);
      return;
    }

    if (action === "view-profile") {
      openProfile(member);
      return;
    }

    if (action === "resend") {
      await resendInvitation(member);
      return;
    }

    if (action === "copy-link") {
      await copyInvitationLink(member);
      return;
    }

    if (action === "cancel") {
      await cancelInvitation(member);
      return;
    }

    if (action === "deactivate") {
      await removeAccess(member, "Deactivate User");
      return;
    }

    if (action === "remove-access") {
      await removeAccess(member, "Remove Access");
    }
  };

  const summaryCards = [
    { label: "Total Users", value: stats.total_users || 0, icon: Users, accent: "#0f766e" },
    { label: "Trainers", value: stats.trainers || 0, icon: UserCog, accent: "#d97706" },
    { label: "Admins", value: stats.admins || 0, icon: ShieldCheck, accent: "#7c3aed" },
    { label: "Pending Invites", value: stats.pending_invites || 0, icon: Mail, accent: "#b45309" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />

      <div style={styles.shell}>
        <div style={styles.hero}>
          <div>
            <div style={styles.kicker}>Admin only</div>
            <h1 style={styles.title}>Roles & Access</h1>
            <p style={styles.subtitle}>
              Manage users, trainers, and invitations from one place. Super Admin
              never appears in this module.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button type="button" style={styles.secondaryButton} onClick={exportCsv}>
              <Download size={16} />
              Export
            </button>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => setInviteOpen(true)}
            >
              <Plus size={16} />
              Invite Member
            </button>
          </div>
        </div>

        <div style={styles.cardGrid}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={styles.summaryCard}>
                <div style={{ ...styles.summaryIcon, background: card.accent }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={styles.summaryLabel}>{card.label}</div>
                  <div style={styles.summaryValue}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={16} color="#64748b" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by ID, email, name, role, status or trainer"
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterWrap}>
            <div style={styles.filterChip}>
              <Filter size={14} />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                style={styles.select}
              >
                {ROLE_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.filterChip}>
              <Shield size={14} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={styles.select}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading roles data...</div>
          ) : filteredMembers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No members found</div>
              <div style={styles.emptyText}>
                Try changing the search or filter values, or invite a new member.
              </div>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={styles.th}>User ID</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Principal (Email)</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Assigned Trainer</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Joined On</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const isSelected = selectedIds.includes(member.id);
                    const isPending = member.status === "Pending";
                    const isMenuOpen = activeMenuId === member.id;
                    const isUserRole = (member.role || "").toUpperCase() === "USER";

                    return (
                      <tr key={member.id} style={isSelected ? styles.selectedRow : undefined}>
                        <td style={styles.td}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectedId(member.id)}
                          />
                        </td>
                        <td style={styles.td}>
                          <code style={styles.codeCell}>{getMemberUserId(member)}</code>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.typePill}>
                            {isPending ? "Invitation" : "User"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <strong>{member.principal_email || "-"}</strong>
                        </td>
                        <td style={styles.td}>{member.name || "-"}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...(badgeStyles[(member.role || "USER").toUpperCase()] ||
                                badgeStyles.USER),
                            }}
                          >
                            {member.role || "USER"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {member.assigned_trainer_name ? (
                            <span style={styles.trainerTag}>
                              🏋️ {member.assigned_trainer_name}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...(badgeStyles[member.status || "Active"] || badgeStyles.Active),
                            }}
                          >
                            {member.status || "Active"}
                          </span>
                        </td>
                        <td style={styles.td}>{member.joined_on || "-"}</td>
                        <td style={styles.td}>
                          <div style={styles.actionWrap} ref={isMenuOpen ? menuRef : undefined}>
                            <button
                              type="button"
                              style={styles.menuButton}
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : member.id)
                              }
                            >
                              <Pencil size={15} />
                              <ChevronDown size={13} />
                            </button>

                            {isMenuOpen && (
                              <div style={styles.menu}>
                                <button
                                  type="button"
                                  style={styles.menuItem}
                                  onClick={() => handleMenuAction(member, "edit-role")}
                                >
                                  <Pencil size={14} />
                                  Edit Role
                                </button>

                                {!isPending && isUserRole && (
                                  <button
                                    type="button"
                                    style={styles.menuItem}
                                    onClick={() => handleMenuAction(member, "assign-trainer")}
                                  >
                                    <UserCheck size={14} />
                                    Assign Trainer
                                  </button>
                                )}

                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      style={styles.menuItem}
                                      onClick={() => handleMenuAction(member, "resend")}
                                    >
                                      <RotateCw size={14} />
                                      Resend Invitation
                                    </button>
                                    <button
                                      type="button"
                                      style={styles.menuItem}
                                      onClick={() => handleMenuAction(member, "copy-link")}
                                    >
                                      <Copy size={14} />
                                      Copy Invitation Link
                                    </button>
                                    <button
                                      type="button"
                                      style={styles.menuItemDanger}
                                      onClick={() => handleMenuAction(member, "cancel")}
                                    >
                                      <X size={14} />
                                      Cancel Invitation
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      style={styles.menuItem}
                                      onClick={() => handleMenuAction(member, "view-profile")}
                                    >
                                      <Eye size={14} />
                                      View Profile
                                    </button>
                                    <button
                                      type="button"
                                      style={styles.menuItemDanger}
                                      onClick={() => handleMenuAction(member, "deactivate")}
                                    >
                                      <Ban size={14} />
                                      Deactivate User
                                    </button>
                                    <button
                                      type="button"
                                      style={styles.menuItemDanger}
                                      onClick={() => handleMenuAction(member, "remove-access")}
                                    >
                                      <Trash2 size={14} />
                                      Remove Access
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {inviteOpen && (
        <ModalFrame title="Invite Member" onClose={() => setInviteOpen(false)}>
          <form onSubmit={handleInviteSubmit} style={styles.modalBody}>
            <label style={styles.field}>
              <span style={styles.label}>Email</span>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="ravi@gmail.com"
                style={styles.input}
                required
              />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Role</span>
              <select
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, role: event.target.value }))
                }
                style={styles.input}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setInviteOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                <Mail size={16} />
                Send Invitation
              </button>
            </div>
          </form>
        </ModalFrame>
      )}

      {editOpen && editMember && (
        <ModalFrame title="Edit Role" onClose={() => setEditOpen(false)}>
          <div style={styles.modalBody}>
            <div style={styles.currentRoleCard}>
              <div style={styles.currentRoleLabel}>Current Role</div>
              <div style={styles.currentRoleValue}>{editMember.role || "USER"}</div>
              <div style={styles.currentRoleLabel}>Member</div>
              <div style={styles.currentRoleValueSmall}>{editMember.principal_email}</div>
            </div>

            <label style={styles.field}>
              <span style={styles.label}>New Role</span>
              <select
                value={editRole}
                onChange={(event) => setEditRole(event.target.value)}
                style={styles.input}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={saveRoleChange}
                disabled={saving}
              >
                <Check size={16} />
                Save
              </button>
            </div>
          </div>
        </ModalFrame>
      )}

      {assignModalOpen && assignUser && (
        <ModalFrame title="Assign Trainer" onClose={() => setAssignModalOpen(false)}>
          <div style={styles.modalBody}>
            <div style={styles.currentRoleCard}>
              <div style={styles.currentRoleLabel}>Target User</div>
              <div style={styles.currentRoleValue}>
                {assignUser.name} ({assignUser.principal_email})
              </div>
              <div style={styles.currentRoleLabel}>Currently Assigned Trainer</div>
              <div style={styles.currentRoleValueSmall}>
                {assignUser.assigned_trainer_name
                  ? `🏋️ ${assignUser.assigned_trainer_name}`
                  : "None (Unassigned)"}
              </div>
            </div>

            <label style={styles.field}>
              <span style={styles.label}>Select Trainer</span>
              <select
                value={selectedTrainerId}
                onChange={(event) => setSelectedTrainerId(event.target.value)}
                style={styles.input}
              >
                <option value="">-- No Trainer (Unassign) --</option>
                {trainersList.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name} ({trainer.principal_email})
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setAssignModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={handleAssignTrainer}
                disabled={saving}
              >
                <Check size={16} />
                Save Assignment
              </button>
            </div>
          </div>
        </ModalFrame>
      )}

      {profileOpen && profileMember && (
        <ModalFrame title="View Profile" onClose={() => setProfileOpen(false)}>
          <div style={styles.profileBody}>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Principal Email</span>
              <span style={styles.profileValue}>{profileMember.principal_email}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Name</span>
              <span style={styles.profileValue}>{profileMember.name || "-"}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Role</span>
              <span style={styles.profileValue}>{profileMember.role || "USER"}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Assigned Trainer</span>
              <span style={styles.profileValue}>
                {profileMember.assigned_trainer_name || "None"}
              </span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Status</span>
              <span style={styles.profileValue}>{profileMember.status || "Active"}</span>
            </div>
            <div style={styles.profileRow}>
              <span style={styles.profileLabel}>Joined On</span>
              <span style={styles.profileValue}>{profileMember.joined_on || "-"}</span>
            </div>
          </div>
        </ModalFrame>
      )}
    </div>
  );
}

function ModalFrame({ title, children, onClose }) {
  return (
    <div style={styles.backdrop} role="presentation" onClick={onClose}>
      <div style={styles.modalShell} role="dialog" onClick={(event) => event.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>{title}</div>
            <div style={styles.modalSubtitle}>Admin controls only</div>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(124, 58, 237, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "80px 16px 56px", // Increased top padding to prevent overlap with navbar
    color: "#0f172a",
  },
  glowA: {
    position: "absolute",
    inset: "auto auto 12% -6%",
    width: "280px",
    height: "280px",
    borderRadius: "999px",
    background: "rgba(124, 58, 237, 0.16)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },
  glowB: {
    position: "absolute",
    inset: "8% -6% auto auto",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(14, 165, 233, 0.16)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1440px",
    margin: "24px auto 0", // Added margin-top for safe spacing from the navbar
    display: "grid",
    gap: "20px",
  },
  hero: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.09)",
    backdropFilter: "blur(18px)",
  },
  kicker: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontWeight: 800,
    color: "#7c3aed",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 4vw, 54px)",
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "14px 0 0",
    maxWidth: "720px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#475569",
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "flex-end",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    borderRadius: "14px",
    padding: "12px 18px",
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(79, 70, 229, 0.24)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: "14px",
    padding: "12px 18px",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },
  summaryCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    flexShrink: 0,
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: "28px",
    fontWeight: 900,
    marginTop: "2px",
  },
  toolbar: {
    display: "flex",
    gap: "14px",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "18px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
  },
  searchWrap: {
    flex: "1 1 420px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 16px",
    borderRadius: "16px",
    minHeight: "54px",
    background: "#fff",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
  },
  filterWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterChip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "54px",
    padding: "0 14px",
    borderRadius: "16px",
    background: "#fff",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  select: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  tableCard: {
    borderRadius: "24px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
    overflow: "hidden",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1280px",
  },
  th: {
    textAlign: "left",
    padding: "16px 18px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(248, 250, 252, 0.85)",
  },
  td: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    color: "#0f172a",
    verticalAlign: "middle",
  },
  codeCell: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.06)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    color: "#334155",
  },
  trainerTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(217, 119, 6, 0.1)",
    color: "#b45309",
    fontSize: "12px",
    fontWeight: 700,
  },
  selectedRow: {
    background: "rgba(124, 58, 237, 0.05)",
  },
  typePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.06)",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 800,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.02em",
  },
  actionWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  menuButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "12px",
    background: "#fff",
    padding: "9px 12px",
    cursor: "pointer",
    color: "#0f172a",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    zIndex: 40,
    minWidth: "220px",
    padding: "8px",
    borderRadius: "16px",
    background: "#fff",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
  },
  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 12px",
    border: "none",
    borderRadius: "12px",
    background: "transparent",
    color: "#0f172a",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
  },
  menuItemDanger: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 12px",
    border: "none",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.08)",
    color: "#dc2626",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
  },
  emptyState: {
    padding: "48px 24px",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: 900,
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#64748b",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(15, 23, 42, 0.58)",
    display: "grid",
    placeItems: "center",
    padding: "16px",
  },
  modalShell: {
    width: "100%",
    maxWidth: "560px",
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 24px",
    background: "linear-gradient(135deg, #111827 0%, #312e81 100%)",
    color: "#fff",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: 900,
  },
  modalSubtitle: {
    marginTop: "4px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.72)",
  },
  closeButton: {
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  modalBody: {
    padding: "24px",
    display: "grid",
    gap: "16px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#334155",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    padding: "13px 14px",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  currentRoleCard: {
    display: "grid",
    gap: "8px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(248, 250, 252, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
  },
  currentRoleLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#64748b",
    fontWeight: 800,
  },
  currentRoleValue: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#111827",
  },
  currentRoleValueSmall: {
    fontSize: "14px",
    color: "#334155",
  },
  profileBody: {
    padding: "24px",
    display: "grid",
    gap: "12px",
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(248, 250, 252, 0.92)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
  },
  profileLabel: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#64748b",
  },
  profileValue: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "right",
  },
};

export default AdminRolesPage;