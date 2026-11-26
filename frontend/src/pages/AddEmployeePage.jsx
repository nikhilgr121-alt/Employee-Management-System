import React, { useState } from "react";
import {
  formatSalary,
  generateNextEmployeeId,
  getDepartmentColor,
  getInitials,
} from "../assets/constants";
import EmployeeForm from "../components/EmployeeForm";

const AddEmployeePage = ({ employees, onCreateEmployee, onNavigate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    salary: "",
    designation: "",
  });

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    const result = await onCreateEmployee(payload);
    setIsSubmitting(false);
    return result.success;
  };

  const deptColor = getDepartmentColor(preview.department);
  const numericSalary = Number(preview.salary);

  return (
    <div className="add-page-grid">
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Employee Registration Form</h2>
            <p className="card-subtitle">
              Fill in all mandatory fields or click Auto ID to generate the next ID
            </p>
          </div>
        </div>
        <div className="card-body">
          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => onNavigate("employees")}
            onAutoGenerateId={() => generateNextEmployeeId(employees)}
            onValuesChange={setPreview}
            submitLabel="Submit"
            isSubmitting={isSubmitting}
            resetOnSuccess={true}
          />
        </div>
      </section>

      <aside className="add-side-stack">
        {/* Live Employee Card Preview */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Live ID Badge Preview</h2>
              <p className="card-subtitle">Updates as you type</p>
            </div>
          </div>
          <div className="card-body">
            <div className="id-preview-card">
              <div
                className="profile-avatar-lg"
                style={{ backgroundColor: deptColor.bar }}
              >
                {getInitials(preview.employeeName || "New Employee")}
              </div>
              <div className="id-preview-info">
                <span className="emp-id-pill">
                  {preview.employeeId.trim() || "EMPXXX"}
                </span>
                <h3 className="id-preview-name">
                  {preview.employeeName.trim() || "Employee Name"}
                </h3>
                <p className="id-preview-role">
                  {preview.designation.trim() || "Designation"}
                </p>
                <div className="id-preview-footer">
                  <span
                    className="dept-badge"
                    style={{
                      backgroundColor: deptColor.bg,
                      color: deptColor.text,
                    }}
                  >
                    {preview.department || "Department"}
                  </span>
                  <span className="salary-cell">
                    {numericSalary > 0 ? formatSalary(numericSalary) : "$0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Registration Guidelines</h2>
              <p className="card-subtitle">Validation rules enforced</p>
            </div>
          </div>
          <div className="card-body">
            <ul className="guidelines-list">
              <li>
                <span className="guideline-bullet" />
                <span>
                  All five fields (Employee ID, Employee Name, Department,
                  Salary, and Designation) are mandatory.
                </span>
              </li>
              <li>
                <span className="guideline-bullet" />
                <span>
                  <strong>Employee ID</strong> must be unique across all records
                  (use <strong>Auto ID</strong> for the next sequential ID).
                </span>
              </li>
              <li>
                <span className="guideline-bullet" />
                <span>
                  <strong>Salary</strong> accepts only valid positive numbers
                  greater than 0.
                </span>
              </li>
              <li>
                <span className="guideline-bullet" />
                <span>
                  Records are saved permanently to the{" "}
                  <code>employee_management</code> MongoDB database.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </aside>
    </div>
  );
};

export default AddEmployeePage;
