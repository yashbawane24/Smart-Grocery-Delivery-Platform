const asyncHandler = require("../utils/asyncHandler");
const AddressModel = require("../models/address.model");

const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await AddressModel.findByUser(req.user.id);
  res.status(200).json({ success: true, data: addresses });
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await AddressModel.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  await AddressModel.delete(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: "Address removed" });
});

module.exports = { getMyAddresses, addAddress, deleteAddress };
