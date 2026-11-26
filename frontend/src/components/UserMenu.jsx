import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../assets/constants";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="user-avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.fullName} className="user-avatar-img" />
        ) : (
          <span className="user-avatar-initials">
            {getInitials(user.fullName)}
          </span>
        )}
        <span className="user-name-short">{user.fullName.split(" ")[0]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="user-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="user-menu-dropdown">
            <div className="user-menu-profile">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="user-menu-avatar" />
              ) : (
                <div className="user-menu-avatar user-menu-avatar-initials">
                  {getInitials(user.fullName)}
                </div>
              )}
              <div>
                <p className="user-menu-name">{user.fullName}</p>
                <p className="user-menu-email">{user.email || user.phone || "—"}</p>
                <span className="user-role-badge">{user.role}</span>
              </div>
            </div>

            <div className="user-menu-items">
              <div className="user-menu-info-row">
                <span>Auth method:</span>
                <span className="user-menu-auth-badge">{user.authProvider}</span>
              </div>
              <div className="user-menu-info-row">
                <span>Verified:</span>
                <span>{user.isVerified ? "✓ Yes" : "✗ No"}</span>
              </div>
            </div>

            <button type="button" className="user-logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
