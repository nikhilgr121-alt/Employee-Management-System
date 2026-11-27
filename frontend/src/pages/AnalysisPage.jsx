import React from "react";
import { DEPARTMENTS, getDeptColor, fmtSalary, getInitials } from "../utils/helpers";

const AnalysisPage = ({ employees, isLoading }) => {
  if (isLoading) return <div className="card"><div className="loading-state">Loading analysis...</div></div>;

  const total = employees.length;
  const salaries = employees.map((e) => Number(e.salary) || 0);
  const payroll = salaries.reduce((s, v) => s + v, 0);
  const avg = total > 0 ? payroll / total : 0;
  const highest = salaries.length ? Math.max(...salaries) : 0;
  const lowest = salaries.length ? Math.min(...salaries) : 0;

  // Per-department stats
  const deptMap = {};
  DEPARTMENTS.forEach((d) => { deptMap[d] = { count: 0, payroll: 0, employees: [] }; });
  employees.forEach((e) => {
    const d = e.department || "Other";
    if (!deptMap[d]) deptMap[d] = { count: 0, payroll: 0, employees: [] };
    deptMap[d].count++;
    deptMap[d].payroll += Number(e.salary) || 0;
    deptMap[d].employees.push(e);
  });

  const deptEntries = Object.entries(deptMap)
    .filter(([, s]) => s.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  // Top earners
  const topEarners = [...employees].sort((a, b) => (Number(b.salary) || 0) - (Number(a.salary) || 0)).slice(0, 5);

  // Salary ranges
  const ranges = [
    { label: "< $30k", min: 0, max: 30000 },
    { label: "$30k – $60k", min: 30000, max: 60000 },
    { label: "$60k – $90k", min: 60000, max: 90000 },
    { label: "$90k – $120k", min: 90000, max: 120000 },
    { label: "> $120k", min: 120000, max: Infinity },
  ];
  const rangeCounts = ranges.map((r) => ({
    ...r,
    count: employees.filter((e) => { const s = Number(e.salary) || 0; return s >= r.min && s < r.max; }).length,
  }));
  const maxRangeCount = Math.max(...rangeCounts.map((r) => r.count), 1);

  if (total === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <h4>No Data to Analyze</h4>
          <p>Add employees to see workforce analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-stack">
      {/* Summary Stats */}
      <div className="stats-grid">
        {[
          { label: "Total Employees", value: total, color: "navy" },
          { label: "Total Monthly Payroll", value: fmtSalary(payroll), color: "blue" },
          { label: "Average Salary", value: fmtSalary(avg), color: "green" },
          { label: "Salary Range", value: `${fmtSalary(lowest)} – ${fmtSalary(highest)}`, color: "amber" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: s.label === "Salary Range" ? "1.1rem" : undefined }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="analysis-top">
        {/* Department Analysis */}
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Department Analysis</div>
              <div className="card-sub">Headcount and payroll per department</div>
            </div>
          </div>
          <div className="card-body">
            <div className="analysis-dept-list">
              {deptEntries.map(([dept, stats]) => {
                const c = getDeptColor(dept);
                const pct = Math.round((stats.count / total) * 100);
                const deptAvg = stats.count > 0 ? stats.payroll / stats.count : 0;
                return (
                  <div key={dept} className="analysis-dept-item">
                    <div className="adept-top">
                      <span className="adept-nm">
                        <span className="dept-badge" style={{ backgroundColor: c.bg, color: c.text }}>{dept}</span>
                      </span>
                      <span className="adept-cnt">{stats.count} ({pct}%)</span>
                    </div>
                    <div className="dept-track" style={{ marginBottom: 8 }}>
                      <div className="dept-fill" style={{ width: `${pct}%`, background: c.bar }} />
                    </div>
                    <div className="adept-salary">
                      <span>Monthly Payroll: <strong>{fmtSalary(stats.payroll)}</strong></span>
                      <span>Avg: <strong>{fmtSalary(deptAvg)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top Earners */}
        <section className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top 5 Earners</div>
              <div className="card-sub">Highest paid employees</div>
            </div>
          </div>
          <div className="card-body">
            <div className="top-earners">
              {topEarners.map((emp, i) => {
                const c = getDeptColor(emp.department);
                return (
                  <div key={emp._id} className="earner-row">
                    <span className="earner-rank">#{i + 1}</span>
                    <span className="avatar" style={{ backgroundColor: c.bar, width: 36, height: 36, borderRadius: "50%", color: "#fff", fontSize: ".74rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {getInitials(emp.employeeName)}
                    </span>
                    <div className="earner-info">
                      <div className="earner-name">{emp.employeeName}</div>
                      <div className="earner-role">{emp.designation} · {emp.department}</div>
                    </div>
                    <span className="earner-salary">{fmtSalary(emp.salary)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Salary Distribution */}
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Salary Distribution</div>
            <div className="card-sub">Number of employees in each salary band</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rangeCounts.map((r) => {
              const pct = Math.round((r.count / maxRangeCount) * 100);
              return (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 130, fontSize: ".84rem", color: "#334155", fontWeight: 500, flexShrink: 0 }}>{r.label}</span>
                  <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 999, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb", borderRadius: 999, transition: "width .3s ease" }} />
                  </div>
                  <span style={{ width: 32, fontSize: ".84rem", fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisPage;
