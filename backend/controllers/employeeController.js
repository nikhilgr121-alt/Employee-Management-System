const Employee = require("../models/Employee");

/**
 * Validates and normalizes employee payload fields for create and update operations.
 * Returns either { data } on success or { error } with a user-friendly message.
 */
const validateEmployeePayload = (body) => {
  const employeeId = typeof body.employeeId === "string" ? body.employeeId.trim() : "";
  const employeeName = typeof body.employeeName === "string" ? body.employeeName.trim() : "";
  const department = typeof body.department === "string" ? body.department.trim() : "";
  const designation = typeof body.designation === "string" ? body.designation.trim() : "";
  const rawSalary = body.salary;

  if (!employeeId || !employeeName || !department || !designation || rawSalary === undefined || rawSalary === null || rawSalary === "") {
    return {
      error: "All fields (Employee ID, Employee Name, Department, Salary, Designation) are mandatory.",
    };
  }

  const parsedSalary = Number(rawSalary);
  if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
    return {
      error: "Salary must be a valid positive number greater than 0.",
    };
  }

  return {
    data: {
      employeeId,
      employeeName,
      department,
      salary: parsedSalary,
      designation,
    },
  };
};

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const { data, error } = validateEmployeePayload(req.body);
    if (error) {
      res.status(400);
      throw new Error(error);
    }

    // Check case-insensitively for an existing employeeId to prevent near-duplicate IDs
    const existingEmployee = await Employee.findOne({
      employeeId: { $regex: `^${escapeRegex(data.employeeId)}$`, $options: "i" },
    });

    if (existingEmployee) {
      res.status(409);
      throw new Error(
        `Employee ID "${data.employeeId}" already exists. Please use a unique Employee ID.`
      );
    }

    const employee = await Employee.create(data);

    res.status(201).json({
      success: true,
      message: "Employee added successfully.",
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all employees (supports optional ?search= and ?department= filters)
 * @route   GET /api/employees
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const query = {};

    if (department && department !== "All") {
      query.department = department.trim();
    }

    if (search && search.trim()) {
      const pattern = escapeRegex(search.trim());
      query.$or = [
        { employeeId: { $regex: pattern, $options: "i" } },
        { employeeName: { $regex: pattern, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single employee by MongoDB document ID
 * @route   GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error("Employee record not found.");
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update employee by MongoDB document ID
 * @route   PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const existingRecord = await Employee.findById(req.params.id);
    if (!existingRecord) {
      res.status(404);
      throw new Error("Employee record not found.");
    }

    const { data, error } = validateEmployeePayload(req.body);
    if (error) {
      res.status(400);
      throw new Error(error);
    }

    // Ensure the new employeeId does not collide with another employee document
    const duplicate = await Employee.findOne({
      _id: { $ne: req.params.id },
      employeeId: { $regex: `^${escapeRegex(data.employeeId)}$`, $options: "i" },
    });

    if (duplicate) {
      res.status(409);
      throw new Error(
        `Employee ID "${data.employeeId}" is already assigned to another employee.`
      );
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      data: updatedEmployee,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete employee by MongoDB document ID
 * @route   DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error("Employee record not found.");
    }

    res.status(200).json({
      success: true,
      message: `Employee "${employee.employeeName}" (${employee.employeeId}) deleted successfully.`,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete multiple employees by MongoDB document IDs
 * @route   POST /api/employees/bulk-delete
 */
const bulkDeleteEmployees = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error("Please select at least one employee to delete.");
    }

    const result = await Employee.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} employee record(s) deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Escapes special regex characters for safe MongoDB $regex queries.
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees,
};
