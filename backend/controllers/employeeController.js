const Employee = require("../models/Employee");

const escapeRegex = (val) => val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validate = (body) => {
  const employeeId = String(body.employeeId || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const department = String(body.department || "").trim();
  const designation = String(body.designation || "").trim();
  const salary = body.salary;

  if (!employeeId || !employeeName || !department || !designation || salary === undefined || salary === "") {
    return { error: "All fields are required." };
  }
  const num = Number(salary);
  if (!Number.isFinite(num) || num <= 0) {
    return { error: "Salary must be a positive number." };
  }
  return { data: { employeeId, employeeName, department, designation, salary: num } };
};

// GET /api/employees
const getAll = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const q = {};
    if (department && department !== "All") q.department = department.trim();
    if (search?.trim()) {
      const p = escapeRegex(search.trim());
      q.$or = [
        { employeeId: { $regex: p, $options: "i" } },
        { employeeName: { $regex: p, $options: "i" } },
      ];
    }
    const employees = await Employee.find(q).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) { next(err); }
};

// GET /api/employees/:id
const getOne = async (req, res, next) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) { res.status(404); throw new Error("Employee not found."); }
    res.json({ success: true, data: emp });
  } catch (err) { next(err); }
};

// POST /api/employees
const create = async (req, res, next) => {
  try {
    const { data, error } = validate(req.body);
    if (error) { res.status(400); throw new Error(error); }

    const dup = await Employee.findOne({
      employeeId: { $regex: `^${escapeRegex(data.employeeId)}$`, $options: "i" },
    });
    if (dup) { res.status(409); throw new Error(`Employee ID "${data.employeeId}" already exists.`); }

    const emp = await Employee.create(data);
    res.status(201).json({ success: true, message: "Employee added successfully.", data: emp });
  } catch (err) { next(err); }
};

// PUT /api/employees/:id
const update = async (req, res, next) => {
  try {
    const existing = await Employee.findById(req.params.id);
    if (!existing) { res.status(404); throw new Error("Employee not found."); }

    const { data, error } = validate(req.body);
    if (error) { res.status(400); throw new Error(error); }

    const dup = await Employee.findOne({
      _id: { $ne: req.params.id },
      employeeId: { $regex: `^${escapeRegex(data.employeeId)}$`, $options: "i" },
    });
    if (dup) { res.status(409); throw new Error(`Employee ID "${data.employeeId}" already in use.`); }

    const updated = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, message: "Employee updated successfully.", data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/employees/:id
const remove = async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) { res.status(404); throw new Error("Employee not found."); }
    res.json({ success: true, message: `"${emp.employeeName}" deleted successfully.` });
  } catch (err) { next(err); }
};

// POST /api/employees/bulk-delete
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400); throw new Error("No employees selected.");
    }
    const result = await Employee.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${result.deletedCount} employee(s) deleted.` });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, bulkDelete };
