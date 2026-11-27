import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, getDeptColor, fmtSalary, getInitials, exportCSV } from "../utils/helpers";
import {
  SearchIcon, DownloadIcon, AddUserIcon, TrashIcon,
  EyeIcon, EditIcon, ChevLeft, ChevRight,
} from "../components/Icons";
import EmployeeDetailModal from "../components/EmployeeDetailModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const EmployeesPage = ({
  employees, isLoading, onNavigate,
  onUpdate, onDelete, onBulkDelete,
  initSearch = "", initDept = "All",
}) => {
  const [search, setSearch]       = useState(initSearch);
  const [dept, setDept]           = useState(initDept);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir]     = useState("desc");
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);
  const [selected, setSelected]   = useState([]);

  const [viewEmp, setViewEmp]   = useState(null);
  const [editEmp, setEditEmp]   = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editErr, setEditErr]   = useState("");
  const [delEmp, setDelEmp]     = useState(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [isDeleting, setIsDeleting]   = useState(false);

  useEffect(() => { setSearch(initSearch); }, [initSearch]);
  useEffect(() => { setDept(initDept); }, [initDept]);

  /* ── Department options ── */
  const deptOptions = useMemo(() => {
    const s = new Set(DEPARTMENTS);
    employees.forEach((e) => e.department && s.add(e.department));
    return ["All", ...s];
  }, [employees]);

  /* ── Filter + sort ── */
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = employees.filter((e) => {
      if (dept !== "All" && e.department !== dept) return false;
      if (!q) return true;
      return (
        e.employeeId.toLowerCase().includes(q) ||
        e.employeeName.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "salary")
        cmp = (Number(a.salary) || 0) - (Number(b.salary) || 0);
      else if (sortField === "createdAt")
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      else
        cmp = String(a[sortField] || "").localeCompare(
          String(b[sortField] || ""), undefined, { numeric: true, sensitivity: "base" }
        );
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [employees, search, dept, sortField, sortDir]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = useMemo(
    () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
    [processed, safePage, pageSize]
  );

  useEffect(() => { setPage(1); }, [search, dept, pageSize, sortField, sortDir]);

  /* Keep selection in sync when employees change */
  useEffect(() => {
    const ids = new Set(employees.map((e) => e._id));
    setSelected((p) => p.filter((id) => ids.has(id)));
  }, [employees]);

  /* ── Sort helpers ── */
  const handleSort = (f) => {
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir(f === "salary" ? "desc" : "asc"); }
  };
  const arrow = (f) =>
    sortField !== f
      ? <span className="sort-arrow">↕</span>
      : <span className="sort-arrow active">{sortDir === "asc" ? "↑" : "↓"}</span>;

  /* ── Selection helpers ── */
  const toggleOne = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  const togglePage = () => {
    const ids = paginated.map((e) => e._id);
    const allSel = ids.every((id) => selected.includes(id));
    if (allSel) setSelected((p) => p.filter((id) => !ids.includes(id)));
    else setSelected((p) => Array.from(new Set([...p, ...ids])));
  };

  /* ── CRUD handlers ── */
  const handleSaveEdit = async (id, payload) => {
    setIsSaving(true);
    setEditErr("");
    const r = await onUpdate(id, payload);
    setIsSaving(false);
    if (r.success) { setEditEmp(null); return true; }
    setEditErr(r.error);
    return false;
  };

  const handleConfirmDel = async (id) => {
    setIsDeleting(true);
    if (bulkPending) {
      const r = await onBulkDelete(selected);
      setIsDeleting(false);
      if (r.success) { setSelected([]); setBulkPending(false); }
      return;
    }
    const r = await onDelete(id);
    setIsDeleting(false);
    if (r.success) setDelEmp(null);
  };

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div>
      <section className="card">

        {/* ── Header ── */}
        <div className="card-header">
          <div>
            <div className="card-title">Employee Directory</div>
            <div className="card-sub">
              Showing {processed.length} of {employees.length} records
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => exportCSV(processed)}
              disabled={!processed.length}
            >
              <DownloadIcon />
              <span className="btn-txt">Export CSV</span>
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate("add")}>
              <AddUserIcon />
              <span className="btn-txt">Add Employee</span>
            </button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="tb-search">
            <span className="tb-si"><SearchIcon /></span>
            <input
              placeholder="Search by ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tb-controls">
            <div className="fg">
              <label>Dept:</label>
              <select value={dept} onChange={(e) => setDept(e.target.value)}>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Departments" : d}
                  </option>
                ))}
              </select>
            </div>

            <div className="fg">
              <label>Sort:</label>
              <select
                value={`${sortField}:${sortDir}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split(":");
                  setSortField(f);
                  setSortDir(d);
                }}
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="employeeName:asc">Name A→Z</option>
                <option value="employeeName:desc">Name Z→A</option>
                <option value="salary:desc">Salary High→Low</option>
                <option value="salary:asc">Salary Low→High</option>
              </select>
            </div>

            {(search || dept !== "All") && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => { setSearch(""); setDept("All"); }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Bulk action bar ── */}
        {selected.length > 0 && (
          <div className="bulk-bar">
            <span><strong>{selected.length}</strong> employee(s) selected</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelected([])}>
                Clear
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setBulkPending(true)}
              >
                <TrashIcon /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {isLoading ? (
          <div className="loading-state">Loading employee records...</div>
        ) : processed.length === 0 ? (
          <div className="empty-state">
            <h4>No Records Found</h4>
            <p>Try adjusting your search or department filter.</p>
          </div>
        ) : (
          <>
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th className="no-sort" style={{ width: 42, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={
                          paginated.length > 0 &&
                          paginated.every((e) => selected.includes(e._id))
                        }
                        onChange={togglePage}
                      />
                    </th>
                    <th onClick={() => handleSort("employeeId")}>
                      Employee ID {arrow("employeeId")}
                    </th>
                    <th onClick={() => handleSort("employeeName")}>
                      Name {arrow("employeeName")}
                    </th>
                    <th onClick={() => handleSort("department")}>
                      Department {arrow("department")}
                    </th>
                    <th onClick={() => handleSort("salary")}>
                      Salary {arrow("salary")}
                    </th>
                    <th className="no-sort">Designation</th>
                    <th className="no-sort">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => {
                    const c = getDeptColor(emp.department);
                    const isSel = selected.includes(emp._id);
                    return (
                      <tr key={emp._id} className={isSel ? "selected" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleOne(emp._id)}
                          />
                        </td>
                        <td>
                          <span className="id-pill">{emp.employeeId}</span>
                        </td>
                        <td>
                          <button className="name-btn" onClick={() => setViewEmp(emp)}>
                            <span
                              className="avatar"
                              style={{ backgroundColor: c.bar }}
                            >
                              {getInitials(emp.employeeName)}
                            </span>
                            <div>
                              <div className="emp-nm">{emp.employeeName}</div>
                              <div className="emp-role">{emp.designation}</div>
                            </div>
                          </button>
                        </td>
                        <td>
                          <span
                            className="dept-badge"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {emp.department}
                          </span>
                        </td>
                        <td className="salary">{fmtSalary(emp.salary)}</td>
                        <td>{emp.designation}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn btn-sm btn-view"
                              onClick={() => setViewEmp(emp)}
                              title="View details"
                            >
                              <EyeIcon />
                            </button>
                            <button
                              className="btn btn-sm btn-edit"
                              onClick={() => { setEditErr(""); setEditEmp(emp); }}
                              title="Edit employee"
                            >
                              <EditIcon />
                            </button>
                            <button
                              className="btn btn-sm btn-del"
                              onClick={() => setDelEmp(emp)}
                              title="Delete employee"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="pag-bar">
              <div className="pag-info">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  Page {safePage} of {totalPages}
                </span>
              </div>
              <div className="pag-btns">
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevLeft /> Prev
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevRight />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Modals ── */}
      <EmployeeDetailModal
        employee={viewEmp}
        onClose={() => setViewEmp(null)}
        onEdit={(e) => { setEditErr(""); setEditEmp(e); }}
        onDelete={(e) => setDelEmp(e)}
      />

      <EditEmployeeModal
        employee={editEmp}
        onClose={() => !isSaving && setEditEmp(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        errorMessage={editErr}
        onClearError={() => setEditErr("")}
      />

      <DeleteConfirmModal
        employee={delEmp}
        bulkCount={bulkPending ? selected.length : 0}
        onCancel={() => {
          if (isDeleting) return;
          setDelEmp(null);
          setBulkPending(false);
        }}
        onConfirm={handleConfirmDel}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default EmployeesPage;
