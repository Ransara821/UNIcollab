const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Cloudinary SDK will auto-configure from CLOUDINARY_URL env var.
// If not set, fall back to individual vars.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine the resource_type based on the file extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    let resourceType = 'raw'; // Default to raw for pdf, docx, zip, etc.
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      resourceType = 'image';
    } else if (['mp4', 'webm', 'mov'].includes(ext)) {
      resourceType = 'video';
    }

    return {
      folder: 'unicollab-resources',
      resource_type: resourceType,
      allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'zip'],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

module.exports = { cloudinary, upload };

