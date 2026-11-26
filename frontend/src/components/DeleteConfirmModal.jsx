import React from "react";
import { formatSalary } from "../assets/constants";
import { CloseIcon } from "./Icons";

const DeleteConfirmModal = ({
  employee,
  bulkCount = 0,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  if (!employee && bulkCount === 0) return null;

  const isBulk = !employee && bulkCount > 0;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="modal-card modal-card-sm">
        <div className="modal-header">
          <h2 id="delete-modal-title" className="modal-title">
            {isBulk ? "Confirm Bulk Deletion" : "Confirm Deletion"}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close confirmation modal"
            disabled={isDeleting}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-confirm-text">
            {isBulk
              ? `Are you sure you want to permanently delete ${bulkCount} selected employee record(s) from MongoDB? This action cannot be undone.`
              : "Are you sure you want to permanently delete this employee record from MongoDB? This action cannot be undone."}
          </p>

          {employee && (
            <div className="delete-preview-box">
              <p>
                <strong>Employee ID:</strong> {employee.employeeId}
              </p>
              <p>
                <strong>Name:</strong> {employee.employeeName}
              </p>
              <p>
                <strong>Department:</strong> {employee.department}
              </p>
              <p>
                <strong>Salary:</strong> {formatSalary(employee.salary)}
              </p>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 0, paddingTop: 14 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onConfirm(employee?._id)}
              disabled={isDeleting}
            >
              {isDeleting
                ? "Deleting..."
                : isBulk
                  ? `Delete ${bulkCount} Records`
                  : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
