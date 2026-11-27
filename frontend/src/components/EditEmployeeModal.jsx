import React from "react";
import { CloseIcon } from "./Icons";
import AlertBanner from "./AlertBanner";
import EmployeeForm from "./EmployeeForm";

const EditEmployeeModal = ({ employee, onClose, onSave, isSaving, errorMessage, onClearError }) => {
  if (!employee) return null;

  return (
    <div className="modal-bg" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">Edit Employee</span>
          <button className="modal-x" onClick={onClose} disabled={isSaving}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <AlertBanner type="error" message={errorMessage} onClose={onClearError} />
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
