const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  uploadResource,
  getAllResources,
  getResourceById,
  updateResource,
  trackDownload,
  deleteResource,
} = require("../controllers/resource.controller");

// Admin: Upload a file
router.post("/upload", protect, adminOnly, upload.single("file"), uploadResource);

// Public (Protected): Get all resources (with optional ?category=&search=&subject=&year=&semester= filters)
router.get("/", protect, getAllResources);

// Public (Protected): Get single resource
router.get("/:id", protect, getResourceById);

// Admin: Update resource (optional file replacement)
router.put("/:id", protect, adminOnly, upload.single("file"), updateResource);

// Public (Protected): Track a download
router.patch("/:id/download", protect, trackDownload);

// Admin: Delete a resource
router.delete("/:id", protect, adminOnly, deleteResource);

module.exports = router;