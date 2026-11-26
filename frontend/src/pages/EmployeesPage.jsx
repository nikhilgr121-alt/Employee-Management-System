import React, { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, exportEmployeesToCSV } from "../assets/constants";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import EmployeeDetailModal from "../components/EmployeeDetailModal";
import EmployeeTable from "../components/EmployeeTable";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  DownloadIcon,
  FilterResetIcon,
  SearchIcon,
  UserPlusIcon,
} from "../components/Icons";

const EmployeesPage = ({
  employees,
  isLoading,
  onNavigate,
  onUpdateEmployee,
  onDeleteEmployee,
  onBulkDeleteEmployees,
  initialSearch = "",
  initialDepartment = "All",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDepartment, setSelectedDepartment] =
    useState(initialDepartment);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState("");

  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedDepartment(initialDepartment);
  }, [initialDepartment]);

  const departmentOptions = useMemo(() => {
    const set = new Set(DEPARTMENTS);
    employees.forEach((emp) => {
      if (emp.department) set.add(emp.department);
    });
    return ["All", ...Array.from(set)];
  }, [employees]);

  // Filter & sort employees cleanly
  const processedEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = employees.filter((emp) => {
      const matchesDept =
        selectedDepartment === "All" || emp.department === selectedDepartment;
      if (!matchesDept) return false;
      if (!query) return true;

      return (
        emp.employeeId.toLowerCase().includes(query) ||
        emp.employeeName.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "salary") {
        comparison = (Number(a.salary) || 0) - (Number(b.salary) || 0);
      } else if (sortField === "createdAt") {
        comparison =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
      } else {
        comparison = String(a[sortField] || "").localeCompare(
          String(b[sortField] || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        );
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [employees, searchQuery, selectedDepartment, sortField, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedEmployees.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedEmployees.slice(start, start + pageSize);
  }, [processedEmployees, safePage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, pageSize, sortField, sortOrder]);

  // Keep selectedIds synced with existing records
  useEffect(() => {
    const existingSet = new Set(employees.map((e) => e._id));
    setSelectedIds((prev) => prev.filter((id) => existingSet.has(id)));
  }, [employees]);

  const handleSortColumn = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "salary" ? "desc" : "asc");
    }
  };

  const handleSortSelect = (e) => {
    const [field, order] = e.target.value.split(":");
    setSortField(field);
    setSortOrder(order);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All");
    setSortField("createdAt");
    setSortOrder("desc");
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (pageRows) => {
    const pageIds = pageRows.map((emp) => emp._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenEdit = (employee) => {
    setEditModalError("");
    setEditingEmployee(employee);
  };

  const handleSaveEdit = async (id, payload) => {
    setIsSavingEdit(true);
    setEditModalError("");
    const result = await onUpdateEmployee(id, payload);
    setIsSavingEdit(false);

    if (result.success) {
      setEditingEmployee(null);
      return true;
    }

    setEditModalError(result.error);
    return false;
  };

  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    if (bulkDeletePending) {
      const result = await onBulkDeleteEmployees(selectedIds);
      setIsDeleting(false);
      if (result.success) {
        setSelectedIds([]);
        setBulkDeletePending(false);
      }
      return;
    }

    const result = await onDeleteEmployee(id);
    setIsDeleting(false);
    if (result.success) {
      setDeletingEmployee(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDepartment !== "All" ||
    sortField !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div>
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Employee Directory</h2>
            <p className="card-subtitle">
              Showing {processedEmployees.length} of {employees.length} total
              employee records
            </p>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => exportEmployeesToCSV(processedEmployees)}
              disabled={processedEmployees.length === 0}
              title="Download filtered employees as CSV"
            >
              <DownloadIcon />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate("add-employee")}
            >
              <UserPlusIcon />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by Employee ID or Employee Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search employees by ID or name"
            />
          </div>

          <div className="toolbar-controls">
            <div className="filter-group">
              <label htmlFor="dept-filter" className="filter-label">
                Department:
              </label>
              <select
                id="dept-filter"
                className="filter-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-select" className="filter-label">
                Sort:
              </label>
              <select
                id="sort-select"
                className="filter-select"
                value={`${sortField}:${sortOrder}`}
                onChange={handleSortSelect}
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="employeeName:asc">Name (A → Z)</option>
                <option value="employeeName:desc">Name (Z → A)</option>
                <option value="salary:desc">Salary (High → Low)</option>
                <option value="salary:asc">Salary (Low → High)</option>
                <option value="employeeId:asc">Employee ID (Asc)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <FilterResetIcon />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-action-bar">
            <span>
              <strong>{selectedIds.length}</strong> employee{" "}
              {selectedIds.length === 1 ? "record" : "records"} selected
            </span>
            <div className="header-btn-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setBulkDeletePending(true)}
              >
                <DeleteIcon />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">Loading employee records...</div>
        ) : (
          <>
            <EmployeeTable
              employees={paginatedEmployees}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onView={(emp) => setViewingEmployee(emp)}
              onEdit={handleOpenEdit}
              onDelete={(emp) => setDeletingEmployee(emp)}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortColumn={handleSortColumn}
            />

            {processedEmployees.length > 0 && (
              <div className="pagination-bar">
                <div className="pagination-info">
                  <span>Rows per page:</span>
                  <select
                    className="page-size-select"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    aria-label="Rows per page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="pagination-range">
                    Page {safePage} of {totalPages}
                  </span>
                </div>

                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeftIcon />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <span>Next</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <EmployeeDetailModal
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={handleOpenEdit}
        onDelete={(emp) => setDeletingEmployee(emp)}
      />

      <EditEmployeeModal
        employee={editingEmployee}
        onClose={() => !isSavingEdit && setEditingEmployee(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
        errorMessage={editModalError}
        onClearError={() => setEditModalError("")}
      />

      <DeleteConfirmModal
        employee={deletingEmployee}
        bulkCount={bulkDeletePending ? selectedIds.length : 0}
        onCancel={() => {
          if (isDeleting) return;
          setDeletingEmployee(null);
          setBulkDeletePending(false);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default EmployeesPage;
