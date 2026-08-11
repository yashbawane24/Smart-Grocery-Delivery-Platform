const express = require("express");
const { getMyAddresses, addAddress, deleteAddress } = require("../controllers/address.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getMyAddresses);
router.post("/", addAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
