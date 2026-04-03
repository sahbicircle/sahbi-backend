const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createWaitingListEntry,
  listWaitingList,
  getWaitingListById,
  updateWaitingListEntry,
  deleteWaitingListEntry,
} = require("../controllers/waitingListController");

// Public: landing / sahbi-web signup
router.post("/", createWaitingListEntry);

// Admin CRUD
router.get("/", adminMiddleware, listWaitingList);
router.get("/:id", adminMiddleware, getWaitingListById);
router.put("/:id", adminMiddleware, updateWaitingListEntry);
router.delete("/:id", adminMiddleware, deleteWaitingListEntry);

module.exports = router;
