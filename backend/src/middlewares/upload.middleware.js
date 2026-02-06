const multer = require('multer');
const fs = require('fs');
const path = require('path');

// UC005: Return request media upload directory
const RETURNS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'returns');

// Ensure upload directory exists
if (!fs.existsSync(RETURNS_UPLOAD_DIR)) {
  fs.mkdirSync(RETURNS_UPLOAD_DIR, { recursive: true });
}

// Memory storage - files in req.files as buffer (saved to disk in service)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    const mimetype = file.mimetype || '';
    if (allowedTypes.test(ext) || allowedTypes.test(mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images (jpeg, png, gif, webp) and videos (mp4, mov, avi, webm)'));
    }
  }
});

// For return request: files (max 5). reason comes from req.body (text field)
const returnRequestUpload = upload.array('files', 5);

/**
 * UC005: Multer diskStorage for return request media
 * Lưu file vào backend/uploads/returns
 * Chỉ cho phép ảnh: jpg, jpeg, png
 * Max 5MB/file, max 5 files
 */
const returnMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(RETURNS_UPLOAD_DIR)) {
      fs.mkdirSync(RETURNS_UPLOAD_DIR, { recursive: true });
    }
    cb(null, RETURNS_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    const uniqueName = `return_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadReturnMedia = multer({
  storage: returnMediaStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedExts = ['jpg', 'jpeg', 'png'];
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    const mimetype = file.mimetype || '';
    const isImage = mimetype.startsWith('image/');
    const isValidExt = allowedExts.includes(ext);

    if (isImage && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên ảnh định dạng JPG, JPEG hoặc PNG'));
    }
  }
});

module.exports = {
  returnRequestUpload,
  uploadReturnMedia
};
