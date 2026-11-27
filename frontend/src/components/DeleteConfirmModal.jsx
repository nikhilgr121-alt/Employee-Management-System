import React from "react";
import { CloseIcon } from "./Icons";
import { fmtSalary } from "../utils/helpers";

const DeleteConfirmModal = ({ employee, bulkCount = 0, onCancel, onConfirm, isDeleting }) => {
  if (!employee && bulkCount === 0) return null;
  const isBulk = !employee && bulkCount > 0;

  return (
    <div className="modal-bg" role="dialog" aria-modal="true">
      <div className="modal modal-sm">
        <div className="modal-head">
          <span className="modal-title">{isBulk ? "Confirm Bulk Delete" : "Confirm Delete"}</span>
          <button className="modal-x" onClick={onCancel} disabled={isDeleting}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <p className="del-text">
            {isBulk
              ? `Permanently delete ${bulkCount} selected employee(s)? This cannot be undone.`
              : "Permanently delete this employee? This cannot be undone."}
          </p>
          {employee && (
            <div className="del-box">
              <p><strong>ID:</strong> {employee.employeeId}</p>
              <p><strong>Name:</strong> {employee.employeeName}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Salary:</strong> {fmtSalary(employee.salary)}</p>
            </div>
          )}
          <div className="form-actions" style={{ marginTop: 0, paddingTop: 12 }}>
            <button className="btn btn-secondary" onClick={onCancel} disabled={isDeleting}>Cancel</button>
            <button className="btn btn-danger" onClick={() => onConfirm(employee?._id)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : isBulk ? `Delete ${bulkCount}` : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
