const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Absolute path to backend/uploads
const uploadPath = path.join(__dirname, '..', 'uploads');

// ✅ Ensure uploads folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // ✅ FIXED PATH
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;
