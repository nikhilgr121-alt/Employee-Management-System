import React from "react";
import {
  formatSalary,
  getDepartmentColor,
  getInitials,
} from "../assets/constants";
import { DeleteIcon, EditIcon, EyeIcon } from "./Icons";

const EmployeeTable = ({
  employees,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSortColumn,
}) => {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <h4>No Employee Records Found</h4>
        <p>Try adjusting your search or department filter, or add a new employee.</p>
      </div>
    );
  }

  const allOnPageSelected =
    employees.length > 0 &&
    employees.every((emp) => selectedIds.includes(emp._id));

  const renderSortArrow = (field) => {
    if (sortField !== field) return <span className="sort-arrow muted">↕</span>;
    return (
      <span className="sort-arrow active">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="table-responsive">
      <table className="employee-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={() => onToggleSelectAll(employees)}
                aria-label="Select all employees on this page"
              />
            </th>
            <th
              className="sortable-th"
              onClick={() => onSortColumn("employeeId")}
            >
              Employee ID {renderSortArrow("employeeId")}
            </th>
            <th
              className="sortable-th"
              onClick={() => onSortColumn("employeeName")}
            >
              Employee Name {renderSortArrow("employeeName")}
            </th>
            <th
              className="sortable-th"
              onClick={() => onSortColumn("department")}
            >
              Department {renderSortArrow("department")}
            </th>
            <th className="sortable-th" onClick={() => onSortColumn("salary")}>
              Salary {renderSortArrow("salary")}
            </th>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const deptColor = getDepartmentColor(emp.department);
            const isSelected = selectedIds.includes(emp._id);

            return (
              <tr key={emp._id} className={isSelected ? "row-selected" : ""}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(emp._id)}
                    aria-label={`Select ${emp.employeeName}`}
                  />
                </td>
                <td>
                  <span className="emp-id-pill">{emp.employeeId}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="emp-name-link"
                    onClick={() => onView(emp)}
                  >
                    <span
                      className="avatar-sm"
                      style={{ backgroundColor: deptColor.bar }}
                    >
                      {getInitials(emp.employeeName)}
                    </span>
                    <span className="emp-name-cell">{emp.employeeName}</span>
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
                <td className="salary-cell">{formatSalary(emp.salary)}</td>
                <td>{emp.designation}</td>
                <td>
                  <div className="actions-cell">
                    <button
                      type="button"
                      className="btn btn-sm btn-view"
                      onClick={() => onView(emp)}
                      title={`View ${emp.employeeName}`}
                    >
                      <EyeIcon />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-edit"
                      onClick={() => onEdit(emp)}
                      title={`Edit ${emp.employeeName}`}
                    >
                      <EditIcon />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-delete"
                      onClick={() => onDelete(emp)}
                      title={`Delete ${emp.employeeName}`}
                    >
                      <DeleteIcon />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
