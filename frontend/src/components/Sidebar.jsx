import React from "react";
import {
  BuildingIcon,
  CloseIcon,
  DashboardIcon,
  UserPlusIcon,
  UsersIcon,
} from "./Icons";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "employees", label: "Employees", icon: <UsersIcon /> },
  { id: "add-employee", label: "Add Employee", icon: <UserPlusIcon /> },
];

const Sidebar = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  employeeCount,
  dbStatus,
}) => {
  const handleSelect = (pageId) => {
    onNavigate(pageId);
    onClose();
  };

  const isConnected = dbStatus?.status === "connected";

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div>
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-logo">
                <BuildingIcon />
              </div>
              <div>
                <h1 className="brand-title">EMS Admin</h1>
                <p className="brand-subtitle">Workforce Suite</p>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <p className="nav-section-label">WORKSPACE</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? "nav-item-active" : ""}`}
                onClick={() => handleSelect(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.id === "employees" && (
                  <span className="nav-badge">{employeeCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="db-status-card">
            <span
              className={`status-dot ${isConnected ? "status-online" : "status-offline"}`}
            />
            <div>
              <p className="db-status-title">
                {isConnected ? "MongoDB Connected" : "Database Offline"}
              </p>
              <p className="db-status-sub">
                {dbStatus?.name || "employee_management"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
