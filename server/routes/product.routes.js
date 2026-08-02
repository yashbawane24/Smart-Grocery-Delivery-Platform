const express = require("express");
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require("../controllers/product.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const upload = require("../middleware/upload.middleware");
const { productValidator } = require("../validators/product.validator");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  productValidator,
  validate,
  createProduct
);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
