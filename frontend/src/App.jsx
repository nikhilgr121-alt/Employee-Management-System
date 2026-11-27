import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import UserMenu from "./components/UserMenu";
import AlertBanner from "./components/AlertBanner";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import AnalysisPage from "./pages/AnalysisPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import { MenuIcon, RefreshIcon, SearchIcon } from "./components/Icons";
import { checkHealth, getEmployees, createEmployee, updateEmployee, deleteEmployee, bulkDeleteEmployees } from "./services/employeeService";

const TITLES = {
  dashboard: { title: "Dashboard", sub: "Workforce overview and recent activity" },
  employees: { title: "Employees", sub: "Search, filter, and manage all employee records" },
  analysis:  { title: "Analysis",  sub: "Workforce analytics, salary distribution, and insights" },
  add:       { title: "Add Employee", sub: "Register a new employee into the system" },
};

export default function App() {
  const { user, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({ status: "connecting", name: "employee_management" });
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [quickSearch, setQuickSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const showAlert = useCallback((type, message) => setAlert({ type, message }), []);
  const clearAlert = useCallback(() => setAlert({ type: "", message: "" }), []);

  useEffect(() => {
    if (!alert.message) return;
    const t = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [data, health] = await Promise.all([
        getEmployees(),
        checkHealth().catch(() => null),
      ]);
      setEmployees(data);
      setDbStatus(health?.database || { status: "connected", name: "employee_management" });
    } catch (err) {
      setDbStatus({ status: "disconnected", name: "employee_management" });
      showAlert("error", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAlert]);

  useEffect(() => { if (user) loadData(false); }, [user, loadData]);

  if (authLoading) {
    return (
      <div className="page-loader">
        <div className="big-spinner" />
        <p style={{ color: "#64748b", fontWeight: 500 }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const navigate = (p) => {
    clearAlert();
    if (p !== "employees") { setDeptFilter("All"); setQuickSearch(""); }
    setPage(p);
  };

  const filterByDept = (dept) => {
    clearAlert();
    setDeptFilter(dept);
    setQuickSearch("");
    setPage("employees");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    clearAlert();
    setDeptFilter("All");
    setPage("employees");
  };

  const handleCreate = async (payload) => {
    try {
      const res = await createEmployee(payload);
      setEmployees((p) => [res.data, ...p]);
      showAlert("success", res.message || "Employee added.");
      return { success: true };
    } catch (err) {
      showAlert("error", err.message);
      return { success: false, error: err.message };
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const res = await updateEmployee(id, payload);
      setEmployees((p) => p.map((e) => (e._id === id ? res.data : e)));
      showAlert("success", res.message || "Employee updated.");
      return { success: true };
    } catch (err) {
      showAlert("error", err.message);
      return { success: false, error: err.message };
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteEmployee(id);
      setEmployees((p) => p.filter((e) => e._id !== id));
      showAlert("success", res.message || "Employee deleted.");
      return { success: true };
    } catch (err) {
      showAlert("error", err.message);
      return { success: false, error: err.message };
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      const res = await bulkDeleteEmployees(ids);
      const idSet = new Set(ids);
      setEmployees((p) => p.filter((e) => !idSet.has(e._id)));
      showAlert("success", res.message || "Employees deleted.");
      return { success: true };
    } catch (err) {
      showAlert("error", err.message);
      return { success: false, error: err.message };
    }
  };

  const { title, sub } = TITLES[page] || TITLES.dashboard;

  return (
    <div className="app-layout">
      <Sidebar active={page} onNav={navigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} empCount={employees.length} dbStatus={dbStatus} />

      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
            <div>
              <div className="page-title">{title}</div>
              <div className="page-sub">{sub}</div>
            </div>
          </div>

          <div className="topbar-right">
            <form className="search-wrap" onSubmit={handleSearch}>
              <span className="search-icon"><SearchIcon /></span>
              <input placeholder="Quick search..." value={quickSearch} onChange={(e) => setQuickSearch(e.target.value)} />
            </form>

            <button className="icon-btn" onClick={() => loadData(true)} title="Refresh" disabled={refreshing}>
              <RefreshIcon spin={refreshing} />
            </button>

            {page !== "add" && (
              <button className="btn btn-primary" onClick={() => navigate("add")}>
                + <span className="btn-txt">Add Employee</span>
              </button>
            )}

            <UserMenu />
          </div>
        </header>

        <main className="main-content">
          <AlertBanner type={alert.type} message={alert.message} onClose={clearAlert} />

          {page === "dashboard" && (
            <DashboardPage employees={employees} isLoading={loading} onNavigate={navigate}
              onFilterDept={filterByDept} onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
          {page === "employees" && (
            <EmployeesPage employees={employees} isLoading={loading} onNavigate={navigate}
              onUpdate={handleUpdate} onDelete={handleDelete} onBulkDelete={handleBulkDelete}
              initSearch={quickSearch} initDept={deptFilter} />
          )}
          {page === "analysis" && (
            <AnalysisPage employees={employees} isLoading={loading} />
          )}
          {page === "add" && (
            <AddEmployeePage employees={employees} onCreate={handleCreate} onNavigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
}
