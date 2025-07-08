const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists with proper permissions
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists before trying to save
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Configure multer with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4 // Maximum 4 files per upload
  }
});

// Error handling wrapper
const uploadWithErrorHandling = (fieldname) => {
  return (req, res, next) => {
    upload.single(fieldname)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

// Export both the original upload and the wrapper
module.exports = upload;
module.exports.uploadWithErrorHandling = uploadWithErrorHandling; 