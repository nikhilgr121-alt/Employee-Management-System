import React from "react";
import {
  formatDate,
  formatSalary,
  getDepartmentColor,
  getInitials,
} from "../assets/constants";
import { CloseIcon, DeleteIcon, EditIcon } from "./Icons";

const EmployeeDetailModal = ({ employee, onClose, onEdit, onDelete }) => {
  if (!employee) return null;

  const deptColor = getDepartmentColor(employee.department);
  const monthlySalary = Number(employee.salary) || 0;
  const annualSalary = monthlySalary * 12;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="detail-modal-title" className="modal-title">
            Employee Profile
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close employee profile"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-hero">
            <div
              className="profile-avatar-lg"
              style={{ backgroundColor: deptColor.bar }}
            >
              {getInitials(employee.employeeName)}
            </div>
            <div>
              <span className="emp-id-pill">{employee.employeeId}</span>
              <h3 className="profile-name">{employee.employeeName}</h3>
              <p className="profile-designation">{employee.designation}</p>
            </div>
            <span
              className="dept-badge profile-dept-badge"
              style={{ backgroundColor: deptColor.bg, color: deptColor.text }}
            >
              {employee.department}
            </span>
          </div>

          <div className="profile-details-grid">
            <div className="detail-tile">
              <span className="detail-label">Monthly Salary</span>
              <strong className="detail-value">{formatSalary(monthlySalary)}</strong>
            </div>
            <div className="detail-tile">
              <span className="detail-label">Estimated Annual</span>
              <strong className="detail-value">{formatSalary(annualSalary)}</strong>
            </div>
            <div className="detail-tile">
              <span className="detail-label">Joined / Added</span>
              <strong className="detail-value">
                {formatDate(employee.createdAt)}
              </strong>
            </div>
            <div className="detail-tile">
              <span className="detail-label">Last Updated</span>
              <strong className="detail-value">
                {formatDate(employee.updatedAt)}
              </strong>
            </div>
          </div>

          <div className="mongo-meta-box">
            <span className="detail-label">MongoDB Document ID:</span>{" "}
            <code>{employee._id}</code>
          </div>

          <div className="form-actions" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-delete"
              onClick={() => {
                onClose();
                onDelete(employee);
              }}
            >
              <DeleteIcon />
              <span>Delete</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
            >
              <EditIcon />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
