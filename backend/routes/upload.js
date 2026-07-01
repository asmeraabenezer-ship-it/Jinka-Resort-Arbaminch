
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

router.post('/', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'Error: No File Selected!' });
      } else {
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url });
      }
    }
  });
});

module.exports = router;
