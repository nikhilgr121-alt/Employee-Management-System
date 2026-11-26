import React, { useState } from "react";
import {
  DEPARTMENTS,
  exportEmployeesToCSV,
  formatSalary,
  getDepartmentColor,
  getInitials,
} from "../assets/constants";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import EmployeeDetailModal from "../components/EmployeeDetailModal";
import {
  BuildingIcon,
  DollarIcon,
  DownloadIcon,
  TrendIcon,
  UserPlusIcon,
  UsersIcon,
} from "../components/Icons";
import StatCard from "../components/StatCard";

const DashboardPage = ({
  employees,
  isLoading,
  onNavigate,
  onFilterDepartment,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEdit = async (id, payload) => {
    setIsSavingEdit(true);
    setEditError("");
    const result = await onUpdateEmployee(id, payload);
    setIsSavingEdit(false);
    if (result.success) {
      setEditingEmployee(null);
      return true;
    }
    setEditError(result.error);
    return false;
  };

  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    const result = await onDeleteEmployee(id);
    setIsDeleting(false);
    if (result.success) {
      setDeletingEmployee(null);
    }
  };

  const totalEmployees = employees.length;
  const salaries = employees.map((emp) => Number(emp.salary) || 0);
  const totalPayroll = salaries.reduce((sum, val) => sum + val, 0);
  const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  const highestSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
  const lowestSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

  // Build department summary (count + total payroll)
  const deptMap = {};
  DEPARTMENTS.forEach((dept) => {
    deptMap[dept] = { count: 0, payroll: 0 };
  });
  employees.forEach((emp) => {
    const dept = emp.department || "Other";
    if (!deptMap[dept]) deptMap[dept] = { count: 0, payroll: 0 };
    deptMap[dept].count += 1;
    deptMap[dept].payroll += Number(emp.salary) || 0;
  });

  const departmentEntries = Object.entries(deptMap).sort(
    (a, b) => b[1].count - a[1].count
  );
  const activeDepartmentCount = departmentEntries.filter(
    ([, stats]) => stats.count > 0
  ).length;

  const recentEmployees = employees.slice(0, 5);

  // Build SVG donut chart segments
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;
  const donutSegments =
    totalEmployees > 0
      ? departmentEntries
          .filter(([, stats]) => stats.count > 0)
          .map(([department, stats]) => {
            const fraction = stats.count / totalEmployees;
            const dashLength = fraction * circumference;
            const dashOffset = -cumulativeFraction * circumference;
            cumulativeFraction += fraction;
            return {
              department,
              count: stats.count,
              color: getDepartmentColor(department).bar,
              dashArray: `${dashLength} ${circumference}`,
              dashOffset,
            };
          })
      : [];

  if (isLoading) {
    return (
      <div className="card">
        <div className="loading-state">Loading dashboard overview...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div>
          <span className="hero-pill">Workforce Overview</span>
          <h2 className="hero-title">Welcome to Employee Management System</h2>
          <p className="hero-subtitle">
            Managing <strong>{totalEmployees}</strong> active employee{" "}
            {totalEmployees === 1 ? "record" : "records"} across{" "}
            <strong>{activeDepartmentCount}</strong> departments with an
            estimated annual payroll of{" "}
            <strong>{formatSalary(totalPayroll * 12)}</strong>.
          </p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-hero-light"
            onClick={() => exportEmployeesToCSV(employees)}
            disabled={employees.length === 0}
          >
            <DownloadIcon />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-hero-primary"
            onClick={() => onNavigate("add-employee")}
          >
            <UserPlusIcon />
            <span>Add Employee</span>
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Stored permanently in MongoDB"
          icon={<UsersIcon />}
          accent="navy"
        />
        <StatCard
          title="Active Departments"
          value={activeDepartmentCount}
          subtitle={`Out of ${departmentEntries.length} tracked departments`}
          icon={<BuildingIcon />}
          accent="blue"
        />
        <StatCard
          title="Average Salary"
          value={formatSalary(averageSalary)}
          subtitle={
            totalEmployees > 0
              ? `Range: ${formatSalary(lowestSalary)} – ${formatSalary(highestSalary)}`
              : "No salary records yet"
          }
          icon={<TrendIcon />}
          accent="green"
        />
        <StatCard
          title="Monthly Payroll"
          value={formatSalary(totalPayroll)}
          subtitle={`Annual: ${formatSalary(totalPayroll * 12)}`}
          icon={<DollarIcon />}
          accent="amber"
        />
      </div>

      <div className="dashboard-grid">
        {/* Department Analytics Card */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Department Breakdown</h2>
              <p className="card-subtitle">
                Click any department to view its employees
              </p>
            </div>
          </div>
          <div className="card-body">
            {totalEmployees > 0 && (
              <div className="donut-wrapper">
                <svg width="150" height="150" viewBox="0 0 150 150" className="donut-svg">
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke="var(--grey-200)"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.department}
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      transform="rotate(-90 75 75)"
                    />
                  ))}
                  <text x="75" y="71" textAnchor="middle" className="donut-center-num">
                    {totalEmployees}
                  </text>
                  <text x="75" y="90" textAnchor="middle" className="donut-center-label">
                    Staff
                  </text>
                </svg>

                <div className="donut-legend">
                  {donutSegments.map((seg) => (
                    <div key={seg.department} className="legend-item">
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="legend-name">{seg.department}</span>
                      <span className="legend-count">{seg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dept-list">
              {departmentEntries.map(([department, stats]) => {
                const percentage =
                  totalEmployees > 0
                    ? Math.round((stats.count / totalEmployees) * 100)
                    : 0;
                const deptColor = getDepartmentColor(department);

                return (
                  <button
                    key={department}
                    type="button"
                    className="dept-item-btn"
                    onClick={() => onFilterDepartment(department)}
                    title={`View ${department} employees`}
                  >
                    <div className="dept-item-top">
                      <span className="dept-name">{department}</span>
                      <span className="dept-meta">
                        <span className="dept-payroll">
                          {formatSalary(stats.payroll)}/mo
                        </span>
                        <span className="dept-count">
                          {stats.count} ({percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="dept-bar-track">
                      <div
                        className="dept-bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: deptColor.bar,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recently Added Employees */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recently Added Employees</h2>
              <p className="card-subtitle">
                Latest {recentEmployees.length} employee registrations
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => onNavigate("employees")}
            >
              View Directory
            </button>
          </div>

          {recentEmployees.length === 0 ? (
            <div className="empty-state">
              <h4>No Employees Added Yet</h4>
              <p style={{ marginBottom: "14px" }}>
                Add your first employee to see live dashboard analytics.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate("add-employee")}
              >
                <UserPlusIcon />
                <span>Add Employee</span>
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmployees.map((emp) => {
                    const deptColor = getDepartmentColor(emp.department);
                    return (
                      <tr key={emp._id}>
                        <td>
                          <span className="emp-id-pill">{emp.employeeId}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="emp-name-link"
                            onClick={() => setViewingEmployee(emp)}
                          >
                            <span
                              className="avatar-sm"
                              style={{ backgroundColor: deptColor.bar }}
                            >
                              {getInitials(emp.employeeName)}
                            </span>
                            <div>
                              <div className="emp-name-cell">
                                {emp.employeeName}
                              </div>
                              <div className="emp-sub-role">
                                {emp.designation}
                              </div>
                            </div>
                          </button>
                        </td>
                        <td>
                          <span
                            className="dept-badge"
                            style={{
                              backgroundColor: deptColor.bg,
                              color: deptColor.text,
                            }}
                          >
                            {emp.department}
                          </span>
                        </td>
                        <td className="salary-cell">
                          {formatSalary(emp.salary)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <EmployeeDetailModal
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={(emp) => {
          setEditError("");
          setEditingEmployee(emp);
        }}
        onDelete={(emp) => setDeletingEmployee(emp)}
      />

      <EditEmployeeModal
        employee={editingEmployee}
        onClose={() => !isSavingEdit && setEditingEmployee(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
        errorMessage={editError}
        onClearError={() => setEditError("")}
      />

      <DeleteConfirmModal
        employee={deletingEmployee}
        onCancel={() => !isDeleting && setDeletingEmployee(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
