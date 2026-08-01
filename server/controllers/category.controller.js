const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const CategoryModel = require("../models/category.model");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.findAll();
  res.status(200).json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.update(req.params.id, req.body);
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await CategoryModel.delete(req.params.id);
  res.status(200).json({ success: true, message: "Category removed" });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
