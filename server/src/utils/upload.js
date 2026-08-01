const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

// Use memory storage — we upload to Cloudinary manually for more control
const storage = multer.memoryStorage();

// File filter: only allow images, audio, and video
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    // Video
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/avi',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer upload config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10, // Max 10 files per request
  },
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} resourceType - 'image', 'video', or 'raw' (audio)
 * @returns {Promise<{url, publicId}>}
 */
const uploadToCloudinary = (buffer, folder = 'pairly', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `pairly/${folder}`,
        public_id: uuidv4(),
        resource_type: resourceType,
        transformation:
          resourceType === 'image' || resourceType === 'auto'
            ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }]
            : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          duration: result.duration, // for audio/video
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId
 * @param {string} resourceType
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete ${publicId}:`, error.message);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
