import React, { useState } from "react";
import { getDeptColor, fmtSalary, getInitials, nextEmpId } from "../utils/helpers";
import EmployeeForm from "../components/EmployeeForm";

const AddEmployeePage = ({ employees, onCreate, onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState({ employeeId: "", employeeName: "", department: "", salary: "", designation: "" });

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    const r = await onCreate(payload);
    setSubmitting(false);
    return r.success;
  };

  const c = getDeptColor(preview.department);
  const sal = Number(preview.salary);

  return (
    <div className="add-grid">
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Employee Registration Form</div>
            <div className="card-sub">Fill all fields · Use Auto ID for next sequential ID</div>
          </div>
        </div>
        <div className="card-body">
          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => onNavigate("employees")}
            onAutoId={() => nextEmpId(employees)}
            onValuesChange={setPreview}
            submitLabel="Add Employee"
            isSubmitting={submitting}
            resetOnSuccess
          />
        </div>
      </section>

      <div className="add-side">
        {/* Live Preview */}
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live ID Badge Preview</div>
              <div className="card-sub">Updates as you type</div>
            </div>
          </div>
          <div className="card-body">
            <div className="badge-preview">
              <div className="avatar-lg" style={{ backgroundColor: c.bar }}>
                {getInitials(preview.employeeName || "New Employee")}
              </div>
              <div className="preview-info">
                <span className="id-pill preview-id">{preview.employeeId || "EMPXXX"}</span>
                <div className="preview-name">{preview.employeeName || "Employee Name"}</div>
                <div className="preview-role">{preview.designation || "Designation"}</div>
                <div className="preview-foot">
                  <span className="dept-badge" style={{ backgroundColor: c.bg, color: c.text }}>
                    {preview.department || "Department"}
                  </span>
                  <span className="salary">{sal > 0 ? fmtSalary(sal) : "$0"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="card">
          <div className="card-header">
            <div className="card-title">Guidelines</div>
          </div>
          <div className="card-body">
            <ul className="guide-list">
              <li><span className="guide-dot" /><span>All 5 fields are mandatory.</span></li>
              <li><span className="guide-dot" /><span><strong>Employee ID</strong> must be unique. Use <strong>Auto ID</strong> to generate the next one.</span></li>
              <li><span className="guide-dot" /><span><strong>Salary</strong> must be a positive number greater than 0.</span></li>
              <li><span className="guide-dot" /><span>Records are saved permanently to MongoDB.</span></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddEmployeePage;
