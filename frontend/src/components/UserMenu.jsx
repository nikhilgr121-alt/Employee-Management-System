import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";
import { LogoutIcon } from "./Icons";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="user-wrap">
      <button className="user-btn" onClick={() => setOpen((v) => !v)}>
        <span className="user-initials">{getInitials(user.fullName)}</span>
        <span className="user-nm">{user.fullName.split(" ")[0]}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <>
          <div className="user-backdrop" onClick={() => setOpen(false)} />
          <div className="user-dropdown">
            <div className="user-dp-top">
              <div className="user-dp-av">{getInitials(user.fullName)}</div>
              <div>
                <div className="user-dp-name">{user.fullName}</div>
                <div className="user-dp-email">{user.email || "—"}</div>
                <span className="user-dp-role">{user.role}</span>
              </div>
            </div>
            <button className="user-logout" onClick={() => { setOpen(false); logout(); }}>
              <LogoutIcon /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
