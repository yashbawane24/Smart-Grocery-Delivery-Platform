const { body } = require("express-validator");

const productValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be 0 or more"),
  body("categoryId").notEmpty().withMessage("Category is required"),
];

module.exports = { productValidator };
