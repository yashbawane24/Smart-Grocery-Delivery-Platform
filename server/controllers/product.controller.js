const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ProductModel = require("../models/product.model");
const paginate = require("../utils/paginate");
const cloudinary = require("../config/cloudinary");

// @route GET /api/v1/products
const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = paginate(req);
  const { category, search, minPrice, maxPrice, sort } = req.query;

  const { items, total } = await ProductModel.findAll({
    category, search, minPrice, maxPrice, sort, limit, offset,
  });

  res.status(200).json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @route GET /api/v1/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({ success: true, data: product });
});

// @route POST /api/v1/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  let images = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "farmly/products" })
      )
    );
    images = uploads.map((u) => u.secure_url);
  }

  const product = await ProductModel.create({ ...req.body, images });
  res.status(201).json({ success: true, data: product });
});

// @route PUT /api/v1/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.update(req.params.id, req.body);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({ success: true, data: product });
});

// @route DELETE /api/v1/products/:id  (admin) — soft delete
const deleteProduct = asyncHandler(async (req, res) => {
  await ProductModel.delete(req.params.id);
  res.status(200).json({ success: true, message: "Product removed" });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
