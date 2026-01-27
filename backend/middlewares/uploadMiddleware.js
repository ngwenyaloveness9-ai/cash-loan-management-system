const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ================== UPLOAD DIRECTORY ==================
const uploadPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================== STORAGE ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// ================== FILE FILTER ==================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed'));
  }
};

// ================== MULTER INSTANCE ==================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ================== EXPECTED FIELDS ==================
const fieldsUpload = upload.fields([
  { name: 'id', maxCount: 1 },              // REQUIRED
  { name: 'payslip', maxCount: 1 },         // OPTIONAL
  { name: 'bank_statement', maxCount: 1 }   // OPTIONAL
]);

// ================== EXPORT ==================
module.exports = (req, res, next) => {
  fieldsUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
