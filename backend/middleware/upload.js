// Upload middleware: parses multipart/form-data, saves an optional task
// attachment to backend/uploads/, and exposes the file as req.file.
//
// Allowed types: PDF, Word, plain text, common images.
// Max size: 10 MB. Files larger than that are rejected with a clear error.

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the directory exists at startup so the first upload doesn't fail
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const random = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.has(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type. Allowed: PDF, Word, TXT, PNG, JPG.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Wrap multer's middleware so its errors return JSON instead of HTML
const singleAttachment = (req, res, next) => {
  upload.single('attachment')(req, res, (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File is too large (max 10 MB)'
          : err.message || 'File upload failed';
      return res.status(status).json({ success: false, message });
    }
    next();
  });
};

module.exports = { singleAttachment, UPLOAD_DIR };
