import React, { useCallback, useEffect, useState } from "react";
import AlertBanner from "./components/AlertBanner";
import {
  MenuIcon,
  MoonIcon,
  RefreshIcon,
  SearchIcon,
  SunIcon,
  UserPlusIcon,
} from "./components/Icons";
import Sidebar from "./components/Sidebar";
import UserMenu from "./components/UserMenu";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import {
  bulkDeleteEmployees,
  checkHealth,
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "./services/employeeService";

const PAGE_TITLES = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of workforce statistics and recent registrations",
  },
  employees: {
    title: "Employees",
    subtitle: "Search, filter, sort, export, and manage all employee records",
  },
  "add-employee": {
    title: "Add Employee",
    subtitle: "Register a new employee into MongoDB",
  },
};

function AppShell() {
  const { user, isLoading: authLoading } = useAuth();

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    status: "connecting",
    name: "employee_management",
  });
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [quickSearch, setQuickSearch] = useState("");
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryDepartment, setDirectoryDepartment] = useState("All");

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
  }, []);

  const clearAlert = useCallback(() => {
    setAlert({ type: "", message: "" });
  }, []);

  useEffect(() => {
    if (!alert.message) return undefined;
    const timer = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const [employeeList, healthInfo] = await Promise.all([
          getEmployees(),
          checkHealth().catch(() => null),
        ]);
        setEmployees(employeeList);
        setDbStatus(
          healthInfo?.database || { status: "connected", name: "employee_management" }
        );
      } catch (error) {
        setDbStatus({ status: "disconnected", name: "employee_management" });
        showAlert("error", error.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showAlert]
  );

  useEffect(() => {
    if (user) loadData(false);
  }, [user, loadData]);

  // Show loading spinner while checking auth token
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p>Loading Employee Management System...</p>
      </div>
    );
  }

  // Show Login Page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page) => {
    clearAlert();
    if (page !== "employees") {
      setDirectoryDepartment("All");
      setDirectorySearch("");
    }
    setActivePage(page);
  };

  const handleFilterDepartmentFromDashboard = (department) => {
    clearAlert();
    setDirectorySearch("");
    setDirectoryDepartment(department);
    setActivePage("employees");
  };

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    clearAlert();
    setDirectoryDepartment("All");
    setDirectorySearch(quickSearch);
    setActivePage("employees");
  };

  const handleCreateEmployee = async (payload) => {
    try {
      const response = await createEmployee(payload);
      setEmployees((prev) => [response.data, ...prev]);
      showAlert("success", response.message || "Employee added successfully.");
      return { success: true };
    } catch (error) {
      showAlert("error", error.message);
      return { success: false, error: error.message };
    }
  };

  const handleUpdateEmployee = async (id, payload) => {
    try {
      const response = await updateEmployee(id, payload);
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === id ? response.data : emp))
      );
      showAlert("success", response.message || "Employee updated successfully.");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      showAlert("success", response.message || "Employee deleted successfully.");
      return { success: true };
    } catch (error) {
      showAlert("error", error.message);
      return { success: false, error: error.message };
    }
  };

  const handleBulkDeleteEmployees = async (ids) => {
    try {
      const response = await bulkDeleteEmployees(ids);
      const idSet = new Set(ids);
      setEmployees((prev) => prev.filter((emp) => !idSet.has(emp._id)));
      showAlert("success", response.message || "Selected employees deleted successfully.");
      return { success: true };
    } catch (error) {
      showAlert("error", error.message);
      return { success: false, error: error.message };
    }
  };

  const currentHeader = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <div className="app-layout" data-theme={theme}>
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        employeeCount={employees.length}
        dbStatus={dbStatus}
      />

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>
            <div>
              <h2 className="page-heading">{currentHeader.title}</h2>
              <p className="page-subheading">{currentHeader.subtitle}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <form className="topbar-search" onSubmit={handleQuickSearchSubmit}>
              <span className="topbar-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="topbar-search-input"
                placeholder="Quick search ID or name..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                aria-label="Quick search employees"
              />
            </form>

            <button
              type="button"
              className="icon-btn"
              onClick={() => loadData(true)}
              title="Refresh data from MongoDB"
              aria-label="Refresh"
              disabled={isRefreshing}
            >
              <RefreshIcon spinning={isRefreshing} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

            {activePage !== "add-employee" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleNavigate("add-employee")}
              >
                <UserPlusIcon />
                <span className="btn-text-hide">Add Employee</span>
              </button>
            )}

            <UserMenu />
          </div>
        </header>

        <main className="main-content">
          <AlertBanner type={alert.type} message={alert.message} onClose={clearAlert} />

          {activePage === "dashboard" && (
            <DashboardPage
              employees={employees}
              isLoading={isLoading}
              onNavigate={handleNavigate}
              onFilterDepartment={handleFilterDepartmentFromDashboard}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activePage === "employees" && (
            <EmployeesPage
              employees={employees}
              isLoading={isLoading}
              onNavigate={handleNavigate}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBulkDeleteEmployees={handleBulkDeleteEmployees}
              initialSearch={directorySearch}
              initialDepartment={directoryDepartment}
            />
          )}

          {activePage === "add-employee" && (
            <AddEmployeePage
              employees={employees}
              onCreateEmployee={handleCreateEmployee}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
