const express = require("express");
const { getAll, getOne, create, update, remove, bulkDelete } = require("../controllers/employeeController");

const router = express.Router();

router.post("/bulk-delete", bulkDelete);
router.route("/").get(getAll).post(create);
router.route("/:id").get(getOne).put(update).delete(remove);

module.exports = router;
