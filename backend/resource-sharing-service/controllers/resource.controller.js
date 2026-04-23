const Resource = require("../models/Resource");
const { cloudinary } = require("../config/cloudinary");

// POST /api/resources/upload  – Admin uploads a file to Cloudinary
exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, description, category, subject, year, semester } = req.body;

    if (!title || !year || !semester) {
      return res.status(400).json({ message: "Title, Year, and Semester are required" });
    }

    const item = await Resource.create({
      title,
      description: description || '',
      category: category || 'other',
      subject: subject || '',
      year: parseInt(year),
      semester: parseInt(semester),
      fileUrl: req.file.path,                    // Cloudinary secure URL
      cloudinaryPublicId: req.file.filename,     // public_id set by storage engine
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedBy: req.headers['x-user-name'] || 'admin',
    });

    res.status(201).json({
      message: "Resource uploaded successfully",
      resource: item,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources  – All users can list resources
exports.getAllResources = async (req, res) => {
  try {
    const { category, subject, search, year, semester } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources/:id   – Single resource
exports.getResourceById = async (req, res) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Resource not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/resources/:id/download  – Increment download counter
exports.trackDownload = async (req, res) => {
  try {
    const item = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Resource not found" });
    res.json({ downloadCount: item.downloadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/resources/:id  – Admin updates details and optionally the file
exports.updateResource = async (req, res) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Resource not found" });

    const { title, description, category, subject, year, semester } = req.body;

    // Update basic fields
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (subject !== undefined) item.subject = subject;
    if (year) item.year = parseInt(year);
    if (semester) item.semester = parseInt(semester);

    // If new file uploaded, replace old one
    if (req.file) {
      // Delete old file from Cloudinary
      if (item.cloudinaryPublicId) {
        const ext = item.originalName.split('.').pop().toLowerCase();
        let rType = 'raw';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) rType = 'image';
        else if (['mp4', 'webm', 'mov'].includes(ext)) rType = 'video';
        await cloudinary.uploader.destroy(item.cloudinaryPublicId, { resource_type: rType });
      }

      // Set new file details
      item.fileUrl = req.file.path;
      item.cloudinaryPublicId = req.file.filename;
      item.originalName = req.file.originalname;
      item.fileType = req.file.mimetype;
    }

    await item.save();
    res.json({ message: "Resource updated successfully", resource: item });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/resources/:id  – Admin deletes (also removes from Cloudinary)
exports.deleteResource = async (req, res) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Resource not found" });

    // Remove from Cloudinary if we have a public_id
    if (item.cloudinaryPublicId) {
      const ext = item.originalName.split('.').pop().toLowerCase();
      let rType = 'raw';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) rType = 'image';
      else if (['mp4', 'webm', 'mov'].includes(ext)) rType = 'video';
      
      await cloudinary.uploader.destroy(item.cloudinaryPublicId, { resource_type: rType });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
};