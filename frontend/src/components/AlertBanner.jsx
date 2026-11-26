import React from "react";
import { AlertCircleIcon, CheckCircleIcon, CloseIcon } from "./Icons";

const AlertBanner = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert-banner alert-${type}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">
          {type === "success" ? <CheckCircleIcon /> : <AlertCircleIcon />}
        </span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
