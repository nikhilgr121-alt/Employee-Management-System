export const DEPARTMENTS = [
  "Computer Science", "Human Resources", "Finance",
  "Marketing", "Sales", "Administration",
];

const COLORS = {
  "Computer Science": { bg: "#eff6ff", text: "#1d4ed8", bar: "#2563eb" },
  "Human Resources":  { bg: "#f5f3ff", text: "#6d28d9", bar: "#7c3aed" },
  "Finance":          { bg: "#ecfdf5", text: "#047857", bar: "#10b981" },
  "Marketing":        { bg: "#fff7ed", text: "#c2410c", bar: "#f97316" },
  "Sales":            { bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444" },
  "Administration":   { bg: "#f0f9ff", text: "#0369a1", bar: "#0284c7" },
};

export const getDeptColor = (dept) =>
  COLORS[dept] || { bg: "#f1f5f9", text: "#334155", bar: "#64748b" };

export const fmtSalary = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
};

export const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "EM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d)) return "N/A";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const nextEmpId = (employees = []) => {
  let max = 0;
  employees.forEach((e) => {
    const m = String(e.employeeId || "").match(/(\d+)$/);
    if (m && Number(m[1]) > max) max = Number(m[1]);
  });
  return `EMP${String(max + 1).padStart(3, "0")}`;
};

export const exportCSV = (employees = []) => {
  const headers = ["Employee ID","Employee Name","Department","Salary","Designation"];
  const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  const rows = employees.map((e) => [e.employeeId, e.employeeName, e.department, e.salary, e.designation].map(esc).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  a.download = "employees.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};
