import React from "react";
import AlertBanner from "./AlertBanner";
import EmployeeForm from "./EmployeeForm";
import { CloseIcon } from "./Icons";

const EditEmployeeModal = ({
  employee,
  onClose,
  onSave,
  isSaving,
  errorMessage,
  onClearError,
}) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title">
            Update Employee Details
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close edit modal"
            disabled={isSaving}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <AlertBanner
            type="error"
            message={errorMessage}
            onClose={onClearError}
          />
          <EmployeeForm
            initialValues={employee}
            onSubmit={(payload) => onSave(employee._id, payload)}
            onCancel={onClose}
            submitLabel="Update Employee"
            isSubmitting={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
