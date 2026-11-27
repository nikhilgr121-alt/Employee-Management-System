import React, { useState } from "react";
import { DEPARTMENTS, getDeptColor, fmtSalary, getInitials } from "../utils/helpers";
import { UsersIcon, BuildingIcon, TrendIcon, DollarIcon, AddUserIcon, DownloadIcon } from "../components/Icons";
import { exportCSV } from "../utils/helpers";
import EmployeeDetailModal from "../components/EmployeeDetailModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-head">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
    {sub && <div className="stat-desc">{sub}</div>}
  </div>
);

const DashboardPage = ({ employees, isLoading, onNavigate, onFilterDept, onUpdate, onDelete }) => {
  const [viewEmp, setViewEmp] = useState(null);
  const [editEmp, setEditEmp] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [delEmp, setDelEmp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const total = employees.length;
  const salaries = employees.map((e) => Number(e.salary) || 0);
  const payroll = salaries.reduce((s, v) => s + v, 0);
  const avg = total > 0 ? payroll / total : 0;
  const highest = salaries.length ? Math.max(...salaries) : 0;
  const lowest = salaries.length ? Math.min(...salaries) : 0;

  // Department breakdown
  const deptMap = {};
  DEPARTMENTS.forEach((d) => { deptMap[d] = { count: 0, payroll: 0 }; });
  employees.forEach((e) => {
    const d = e.department || "Other";
    if (!deptMap[d]) deptMap[d] = { count: 0, payroll: 0 };
    deptMap[d].count++;
    deptMap[d].payroll += Number(e.salary) || 0;
  });
  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1].count - a[1].count);
  const activeDepts = deptEntries.filter(([, s]) => s.count > 0).length;
  const recent = employees.slice(0, 5);

  // Donut chart
  const R = 54, C = 2 * Math.PI * R;
  let cum = 0;
  const segments = total > 0
    ? deptEntries.filter(([, s]) => s.count > 0).map(([dept, stats]) => {
        const frac = stats.count / total;
        const seg = { dept, color: getDeptColor(dept).bar, dash: `${frac * C} ${C}`, offset: -cum * C };
        cum += frac;
        return seg;
      })
    : [];

  const handleSaveEdit = async (id, payload) => {
    setIsSaving(true); setEditErr("");
    const r = await onUpdate(id, payload);
    setIsSaving(false);
    if (r.success) { setEditEmp(null); return true; }
    setEditErr(r.error); return false;
  };

  const handleConfirmDel = async (id) => {
    setIsDeleting(true);
    const r = await onDelete(id);
    setIsDeleting(false);
    if (r.success) setDelEmp(null);
  };

  if (isLoading) return <div className="card"><div className="loading-state">Loading dashboard...</div></div>;

  return (
    <div className="dash-stack">
      {/* Hero */}
      <section className="hero-banner">
        <div>
          <span className="hero-pill">Workforce Overview</span>
          <h2 className="hero-title">Employee Management System</h2>
          <p className="hero-desc">
            Managing <strong>{total}</strong> employee{total !== 1 ? "s" : ""} across{" "}
            <strong>{activeDepts}</strong> departments · Annual payroll{" "}
            <strong>{fmtSalary(payroll * 12)}</strong>
          </p>
        </div>
        <div className="hero-btns">
          <button className="btn btn-hero-outline" onClick={() => exportCSV(employees)} disabled={!total}>
            <DownloadIcon /> <span className="btn-txt">Export CSV</span>
          </button>
          <button className="btn btn-hero-white" onClick={() => onNavigate("add")}>
            <AddUserIcon /> <span className="btn-txt">Add Employee</span>
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Total Employees" value={total} sub="Stored in MongoDB" icon={<UsersIcon />} color="navy" />
        <StatCard label="Active Departments" value={activeDepts} sub={`Out of ${deptEntries.length} tracked`} icon={<BuildingIcon />} color="blue" />
        <StatCard label="Average Salary" value={fmtSalary(avg)} sub={total ? `Range: ${fmtSalary(lowest)} – ${fmtSalary(highest)}` : "No data"} icon={<TrendIcon />} color="green" />
        <StatCard label="Monthly Payroll" value={fmtSalary(payroll)} sub={`Annual: ${fmtSalary(payroll * 12)}`} icon={<DollarIcon />} color="amber" />
      </div>

      <div className="dash-grid">
        {/* Department Breakdown */}
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Department Breakdown</div>
              <div className="card-sub">Click a department to view its employees</div>
            </div>
          </div>
          <div className="card-body">
            {total > 0 && (
              <div className="donut-wrap">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r={R} fill="none" stroke="#e2e8f0" strokeWidth="16" />
                  {segments.map((s) => (
                    <circle key={s.dept} cx="70" cy="70" r={R} fill="none" stroke={s.color}
                      strokeWidth="16" strokeDasharray={s.dash} strokeDashoffset={s.offset}
                      transform="rotate(-90 70 70)" />
                  ))}
                  <text x="70" y="66" textAnchor="middle" className="donut-num">{total}</text>
                  <text x="70" y="82" textAnchor="middle" className="donut-lbl">Staff</text>
                </svg>
                <div className="legend">
                  {segments.map((s) => (
                    <div key={s.dept} className="legend-row">
                      <span className="legend-dot" style={{ backgroundColor: s.color }} />
                      <span className="legend-name">{s.dept}</span>
                      <span className="legend-cnt">{deptMap[s.dept].count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="dept-list">
              {deptEntries.map(([dept, stats]) => {
                const pct = total > 0 ? Math.round((stats.count / total) * 100) : 0;
                const c = getDeptColor(dept);
                return (
                  <button key={dept} className="dept-btn" onClick={() => onFilterDept(dept)}>
                    <div className="dept-top">
                      <span className="dept-nm">{dept}</span>
                      <div className="dept-info">
                        <span className="dept-pay">{fmtSalary(stats.payroll)}/mo</span>
                        <span className="dept-cnt">{stats.count} ({pct}%)</span>
                      </div>
                    </div>
                    <div className="dept-track">
                      <div className="dept-fill" style={{ width: `${pct}%`, background: c.bar }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recently Added */}
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recently Added</div>
              <div className="card-sub">Latest {recent.length} registrations</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("employees")}>View All</button>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <h4>No Employees Yet</h4>
              <p>Add your first employee to see dashboard analytics.</p>
              <button className="btn btn-primary" onClick={() => onNavigate("add")}>
                <AddUserIcon /> Add Employee
              </button>
            </div>
          ) : (
            <div className="recent-table-wrap">
              <table className="recent-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Department</th><th>Salary</th></tr>
                </thead>
                <tbody>
                  {recent.map((emp) => {
                    const c = getDeptColor(emp.department);
                    return (
                      <tr key={emp._id}>
                        <td><span className="id-pill">{emp.employeeId}</span></td>
                        <td>
                          <button className="name-btn" onClick={() => setViewEmp(emp)}>
                            <span className="avatar" style={{ backgroundColor: c.bar }}>{getInitials(emp.employeeName)}</span>
                            <div>
                              <div className="emp-nm">{emp.employeeName}</div>
                              <div className="emp-role">{emp.designation}</div>
                            </div>
                          </button>
                        </td>
                        <td><span className="dept-badge" style={{ backgroundColor: c.bg, color: c.text }}>{emp.department}</span></td>
                        <td className="salary">{fmtSalary(emp.salary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <EmployeeDetailModal employee={viewEmp} onClose={() => setViewEmp(null)}
        onEdit={(e) => { setEditErr(""); setEditEmp(e); }} onDelete={(e) => setDelEmp(e)} />

      <EditEmployeeModal employee={editEmp} onClose={() => !isSaving && setEditEmp(null)}
        onSave={handleSaveEdit} isSaving={isSaving} errorMessage={editErr} onClearError={() => setEditErr("")} />

      <DeleteConfirmModal employee={delEmp} onCancel={() => !isDeleting && setDelEmp(null)}
        onConfirm={handleConfirmDel} isDeleting={isDeleting} />
    </div>
  );
};

export default DashboardPage;
