const mongoose = require("mongoose");

/**
 * Mongoose schema for the `employees` collection in `employee_management`.
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee Name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0.01, "Salary must be a positive number greater than 0"],
      validate: {
        validator: (value) => typeof value === "number" && Number.isFinite(value) && value > 0,
        message: "Salary must be a valid positive number",
      },
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
  },
  {
    collection: "employees",
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
