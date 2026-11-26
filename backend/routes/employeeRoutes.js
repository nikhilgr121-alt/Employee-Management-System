const express = require("express");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/bulk-delete", bulkDeleteEmployees);
router.route("/").post(createEmployee).get(getAllEmployees);
router.route("/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

module.exports = router;
