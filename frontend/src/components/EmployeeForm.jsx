import React, { useEffect, useState } from "react";
import { DEPARTMENTS } from "../assets/constants";
import { SparklesIcon } from "./Icons";

const EMPTY_FORM = {
  employeeId: "",
  employeeName: "",
  department: "",
  salary: "",
  designation: "",
};

/**
 * Shared Employee form used for both creating a new employee and updating an existing record.
 */
const EmployeeForm = ({
  initialValues = EMPTY_FORM,
  onSubmit,
  onCancel,
  onAutoGenerateId,
  onValuesChange,
  submitLabel = "Submit",
  isSubmitting = false,
  resetOnSuccess = false,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const normalized = {
      employeeId: initialValues.employeeId || "",
      employeeName: initialValues.employeeName || "",
      department: initialValues.department || "",
      salary:
        initialValues.salary !== undefined && initialValues.salary !== null
          ? String(initialValues.salary)
          : "",
      designation: initialValues.designation || "",
    };
    setFormData(normalized);
    setErrors({});
    if (onValuesChange) onValuesChange(normalized);
  }, [initialValues]);

  const validate = () => {
    const nextErrors = {};

    if (!formData.employeeId.trim()) {
      nextErrors.employeeId = "Employee ID is required.";
    }
    if (!formData.employeeName.trim()) {
      nextErrors.employeeName = "Employee Name is required.";
    }
    if (!formData.department.trim()) {
      nextErrors.department = "Please select a department.";
    }

    const numericSalary = Number(formData.salary);
    if (formData.salary === "" || formData.salary === null) {
      nextErrors.salary = "Salary is required.";
    } else if (!Number.isFinite(numericSalary) || numericSalary <= 0) {
      nextErrors.salary = "Salary must be a valid positive number.";
    }

    if (!formData.designation.trim()) {
      nextErrors.designation = "Designation is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (onValuesChange) onValuesChange(nextData);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAutoIdClick = () => {
    if (!onAutoGenerateId) return;
    const generated = onAutoGenerateId();
    const nextData = { ...formData, employeeId: generated };
    setFormData(nextData);
    if (onValuesChange) onValuesChange(nextData);
    if (errors.employeeId) {
      setErrors((prev) => ({ ...prev, employeeId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      employeeId: formData.employeeId.trim(),
      employeeName: formData.employeeName.trim(),
      department: formData.department.trim(),
      salary: Number(formData.salary),
      designation: formData.designation.trim(),
    };

    const succeeded = await onSubmit(payload);
    if (succeeded && resetOnSuccess) {
      setFormData(EMPTY_FORM);
      setErrors({});
      if (onValuesChange) onValuesChange(EMPTY_FORM);
    }
  };

  const departmentOptions =
    formData.department && !DEPARTMENTS.includes(formData.department)
      ? [formData.department, ...DEPARTMENTS]
      : DEPARTMENTS;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="employeeId" className="form-label">
              Employee ID<span className="required-star">*</span>
            </label>
            {onAutoGenerateId && (
              <button
                type="button"
                className="inline-action-link"
                onClick={handleAutoIdClick}
                disabled={isSubmitting}
              >
                <SparklesIcon />
                <span>Auto ID</span>
              </button>
            )}
          </div>
          <input
            id="employeeId"
            name="employeeId"
            type="text"
            className={`form-control ${errors.employeeId ? "form-control-error" : ""}`}
            placeholder="e.g. EMP007"
            value={formData.employeeId}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.employeeId && (
            <span className="field-error">{errors.employeeId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="employeeName" className="form-label">
            Employee Name<span className="required-star">*</span>
          </label>
          <input
            id="employeeName"
            name="employeeName"
            type="text"
            className={`form-control ${errors.employeeName ? "form-control-error" : ""}`}
            placeholder="e.g. Aarav Sharma"
            value={formData.employeeName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.employeeName && (
            <span className="field-error">{errors.employeeName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="department" className="form-label">
            Department<span className="required-star">*</span>
          </label>
          <select
            id="department"
            name="department"
            className={`form-control ${errors.department ? "form-control-error" : ""}`}
            value={formData.department}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">-- Select Department --</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className="field-error">{errors.department}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="salary" className="form-label">
            Salary<span className="required-star">*</span>
          </label>
          <input
            id="salary"
            name="salary"
            type="number"
            min="1"
            step="any"
            className={`form-control ${errors.salary ? "form-control-error" : ""}`}
            placeholder="e.g. 65000"
            value={formData.salary}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.salary && <span className="field-error">{errors.salary}</span>}
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="designation" className="form-label">
            Designation<span className="required-star">*</span>
          </label>
          <input
            id="designation"
            name="designation"
            type="text"
            className={`form-control ${errors.designation ? "form-control-error" : ""}`}
            placeholder="e.g. Software Engineer"
            value={formData.designation}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.designation && (
            <span className="field-error">{errors.designation}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
