import React from "react";
import { BuildingIcon, CloseIcon, DashIcon, UsersIcon, AddUserIcon, ChartIcon } from "./Icons";

const NAV = [
  { id: "dashboard",  label: "Dashboard",   icon: <DashIcon /> },
  { id: "employees",  label: "Employees",   icon: <UsersIcon /> },
  { id: "analysis",   label: "Analysis",    icon: <ChartIcon /> },
  { id: "add",        label: "Add Employee",icon: <AddUserIcon /> },
];

const Sidebar = ({ active, onNav, isOpen, onClose, empCount, dbStatus }) => {
  const connected = dbStatus?.status === "connected";

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon"><BuildingIcon /></div>
            <div>
              <div className="brand-name">EMS Admin</div>
              <div className="brand-sub">Workforce Suite</div>
            </div>
            <button className="sidebar-close" onClick={onClose} aria-label="Close menu" style={{ marginLeft: "auto" }}>
              <CloseIcon />
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label-sm">MENU</div>
            {NAV.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${active === item.id ? "active" : ""}`}
                onClick={() => { onNav(item.id); onClose(); }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "employees" && (
                  <span className="badge">{empCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="db-status">
            <span className={`status-dot ${connected ? "dot-on" : "dot-off"}`} />
            <div>
              <div className="db-name">{connected ? "MongoDB Connected" : "DB Offline"}</div>
              <div className="db-sub">{dbStatus?.name || "employee_management"}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
