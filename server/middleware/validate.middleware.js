const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after express-validator chains; short-circuits with a 422 if any
// field failed validation.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      422,
      "Validation failed",
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
