import React from "react";
import { getDeptColor, fmtSalary, fmtDate, getInitials } from "../utils/helpers";
import { CloseIcon, EditIcon, TrashIcon } from "./Icons";

const EmployeeDetailModal = ({ employee, onClose, onEdit, onDelete }) => {
  if (!employee) return null;
  const c = getDeptColor(employee.department);
  const monthly = Number(employee.salary) || 0;

  return (
    <div className="modal-bg" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">Employee Profile</span>
          <button className="modal-x" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <div className="profile-hero">
            <div className="avatar-lg" style={{ backgroundColor: c.bar }}>{getInitials(employee.employeeName)}</div>
            <div>
              <span className="id-pill">{employee.employeeId}</span>
              <div className="profile-name">{employee.employeeName}</div>
              <div className="profile-desig">{employee.designation}</div>
            </div>
            <span className="dept-badge dept-ml" style={{ backgroundColor: c.bg, color: c.text }}>{employee.department}</span>
          </div>

          <div className="detail-grid">
            <div className="detail-tile"><div className="detail-lbl">Monthly Salary</div><div className="detail-val">{fmtSalary(monthly)}</div></div>
            <div className="detail-tile"><div className="detail-lbl">Annual Salary</div><div className="detail-val">{fmtSalary(monthly * 12)}</div></div>
            <div className="detail-tile"><div className="detail-lbl">Added On</div><div className="detail-val">{fmtDate(employee.createdAt)}</div></div>
            <div className="detail-tile"><div className="detail-lbl">Last Updated</div><div className="detail-val">{fmtDate(employee.updatedAt)}</div></div>
          </div>

          <div className="mongo-box">
            <strong>MongoDB ID:</strong> <code>{employee._id}</code>
          </div>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-del" onClick={() => { onClose(); onDelete(employee); }}>
              <TrashIcon /> Delete
            </button>
            <button className="btn btn-primary" onClick={() => { onClose(); onEdit(employee); }}>
              <EditIcon /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
