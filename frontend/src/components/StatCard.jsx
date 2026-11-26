import React from "react";

const StatCard = ({ title, value, subtitle, icon, accent = "blue" }) => {
  return (
    <div className={`stat-card stat-accent-${accent}`}>
      <div className="stat-card-header">
        <div>
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className="stat-icon-box">{icon}</div>
      </div>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
