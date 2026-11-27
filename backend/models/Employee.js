const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    salary: {
      type: Number,
      required: true,
      min: [0.01, "Salary must be greater than 0"],
    },
    designation: { type: String, required: true, trim: true },
  },
  { collection: "employees", timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
