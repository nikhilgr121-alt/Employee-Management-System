import React from "react";
import { CheckIcon, AlertIcon, CloseIcon } from "./Icons";

const AlertBanner = ({ type = "success", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {type === "success" ? <CheckIcon /> : <AlertIcon />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
