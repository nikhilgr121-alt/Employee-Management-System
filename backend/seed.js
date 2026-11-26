const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Employee = require("./models/Employee");

dotenv.config();

const sampleEmployees = [
  {
    employeeId: "EMP001",
    employeeName: "Aarav Sharma",
    department: "Computer Science",
    salary: 85000,
    designation: "Senior Software Engineer",
  },
  {
    employeeId: "EMP002",
    employeeName: "Priya Nair",
    department: "Human Resources",
    salary: 62000,
    designation: "HR Manager",
  },
  {
    employeeId: "EMP003",
    employeeName: "Rohan Verma",
    department: "Finance",
    salary: 74000,
    designation: "Financial Analyst",
  },
  {
    employeeId: "EMP004",
    employeeName: "Sneha Kulkarni",
    department: "Marketing",
    salary: 68000,
    designation: "Digital Marketing Lead",
  },
  {
    employeeId: "EMP005",
    employeeName: "Vikram Patel",
    department: "Sales",
    salary: 71000,
    designation: "Account Executive",
  },
  {
    employeeId: "EMP006",
    employeeName: "Ananya Iyer",
    department: "Administration",
    salary: 58000,
    designation: "Operations Coordinator",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    for (const emp of sampleEmployees) {
      await Employee.updateOne(
        { employeeId: emp.employeeId },
        { $setOnInsert: emp },
        { upsert: true }
      );
    }

    console.log("Sample employee records seeded successfully (existing IDs preserved).");
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
