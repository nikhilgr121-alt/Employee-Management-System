import React, { useEffect, useState } from "react";
import { DEPARTMENTS } from "../utils/helpers";
import { SparkIcon } from "./Icons";

const EMPTY = { employeeId: "", employeeName: "", department: "", salary: "", designation: "" };

const EmployeeForm = ({
  initialValues = EMPTY,
  onSubmit,
  onCancel,
  onAutoId,
  onValuesChange,
  submitLabel = "Submit",
  isSubmitting = false,
  resetOnSuccess = false,
}) => {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const n = {
      employeeId: initialValues.employeeId || "",
      employeeName: initialValues.employeeName || "",
      department: initialValues.department || "",
      salary: initialValues.salary !== undefined && initialValues.salary !== null ? String(initialValues.salary) : "",
      designation: initialValues.designation || "",
    };
    setForm(n); setErrors({});
    onValuesChange?.(n);
  }, [initialValues]);

  const validate = () => {
    const e = {};
    if (!form.employeeId.trim()) e.employeeId = "Employee ID is required.";
    if (!form.employeeName.trim()) e.employeeName = "Name is required.";
    if (!form.department) e.department = "Select a department.";
    const sal = Number(form.salary);
    if (form.salary === "") e.salary = "Salary is required.";
    else if (!Number.isFinite(sal) || sal <= 0) e.salary = "Enter a valid positive number.";
    if (!form.designation.trim()) e.designation = "Designation is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    onValuesChange?.(next);
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleAutoId = () => {
    if (!onAutoId) return;
    const id = onAutoId();
    const next = { ...form, employeeId: id };
    setForm(next);
    onValuesChange?.(next);
    if (errors.employeeId) setErrors((p) => ({ ...p, employeeId: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      employeeId: form.employeeId.trim(),
      employeeName: form.employeeName.trim(),
      department: form.department.trim(),
      salary: Number(form.salary),
      designation: form.designation.trim(),
    };
    const ok = await onSubmit(payload);
    if (ok && resetOnSuccess) { setForm(EMPTY); setErrors({}); onValuesChange?.(EMPTY); }
  };

  const depts = form.department && !DEPARTMENTS.includes(form.department)
    ? [form.department, ...DEPARTMENTS] : DEPARTMENTS;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <div className="label-row">
            <label className="form-label">Employee ID<span className="req">*</span></label>
            {onAutoId && (
              <button type="button" className="auto-btn" onClick={handleAutoId} disabled={isSubmitting}>
                <SparkIcon /> Auto ID
              </button>
            )}
          </div>
          <input name="employeeId" className={`form-input ${errors.employeeId ? "err" : ""}`} placeholder="e.g. EMP007" value={form.employeeId} onChange={handleChange} disabled={isSubmitting} />
          {errors.employeeId && <span className="field-err">{errors.employeeId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Employee Name<span className="req">*</span></label>
          <input name="employeeName" className={`form-input ${errors.employeeName ? "err" : ""}`} placeholder="e.g. Aarav Sharma" value={form.employeeName} onChange={handleChange} disabled={isSubmitting} />
          {errors.employeeName && <span className="field-err">{errors.employeeName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Department<span className="req">*</span></label>
          <select name="department" className={`form-input ${errors.department ? "err" : ""}`} value={form.department} onChange={handleChange} disabled={isSubmitting}>
            <option value="">-- Select --</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <span className="field-err">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Salary<span className="req">*</span></label>
          <input name="salary" type="number" min="1" className={`form-input ${errors.salary ? "err" : ""}`} placeholder="e.g. 65000" value={form.salary} onChange={handleChange} disabled={isSubmitting} />
          {errors.salary && <span className="field-err">{errors.salary}</span>}
        </div>

        <div className="form-group fg-full">
          <label className="form-label">Designation<span className="req">*</span></label>
          <input name="designation" className={`form-input ${errors.designation ? "err" : ""}`} placeholder="e.g. Software Engineer" value={form.designation} onChange={handleChange} disabled={isSubmitting} />
          {errors.designation && <span className="field-err">{errors.designation}</span>}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
