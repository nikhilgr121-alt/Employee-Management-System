export const DEPARTMENTS = [
  "Computer Science",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Administration",
];

export const DEPARTMENT_COLORS = {
  "Computer Science": { bg: "#eff6ff", text: "#1d4ed8", bar: "#2563eb" },
  "Human Resources": { bg: "#f5f3ff", text: "#6d28d9", bar: "#7c3aed" },
  Finance: { bg: "#ecfdf5", text: "#047857", bar: "#10b981" },
  Marketing: { bg: "#fff7ed", text: "#c2410c", bar: "#f97316" },
  Sales: { bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444" },
  Administration: { bg: "#f0f9ff", text: "#0369a1", bar: "#0284c7" },
};

export const getDepartmentColor = (department) => {
  return (
    DEPARTMENT_COLORS[department] || {
      bg: "#f1f5f9",
      text: "#334155",
      bar: "#64748b",
    }
  );
};

/**
 * Formats a numeric salary cleanly for display.
 */
export const formatSalary = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Extracts up to 2 uppercase initials from an employee's full name.
 */
export const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Formats an ISO timestamp into a readable date string.
 */
export const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Generates the next available EMPxxx ID based on existing employee records.
 */
export const generateNextEmployeeId = (employees = []) => {
  let maxNumber = 0;
  employees.forEach((emp) => {
    const match = String(emp.employeeId || "").match(/(\d+)$/);
    if (match) {
      const num = Number(match[1]);
      if (num > maxNumber) maxNumber = num;
    }
  });
  return `EMP${String(maxNumber + 1).padStart(3, "0")}`;
};

/**
 * Exports an array of employee records as a downloadable CSV file.
 */
export const exportEmployeesToCSV = (employees = []) => {
  const headers = [
    "Employee ID",
    "Employee Name",
    "Department",
    "Salary",
    "Designation",
  ];

  const escapeCsv = (val) => {
    const str = String(val ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = employees.map((emp) =>
    [
      emp.employeeId,
      emp.employeeName,
      emp.department,
      emp.salary,
      emp.designation,
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "employees_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
