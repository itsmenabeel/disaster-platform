const multer = require("multer");
const path = require("path");

// Store files in memory as Buffer objects — no disk writes.
// The buffer is then converted to a base64 data-URI in the controller
// and saved directly into MongoDB.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max per file (keeps base64 within MongoDB's 16 MB doc limit)
});

module.exports = upload;
