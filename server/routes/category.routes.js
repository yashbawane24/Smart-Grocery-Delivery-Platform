const express = require("express");
const {
  getCategories, createCategory, updateCategory, deleteCategory,
} = require("../controllers/category.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
