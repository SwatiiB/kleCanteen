import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get absolute path to uploads directory
const uploadsDir = path.resolve(process.cwd(), 'backend/uploads');
console.log('Uploads directory path:', uploadsDir);

// Ensure uploads directory exists with proper permissions
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('Uploads directory created successfully');
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
} else {
  console.log('Uploads directory already exists');
  // Ensure proper permissions
  try {
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Uploads directory permissions updated');
  } catch (error) {
    console.error('Error updating uploads directory permissions:', error);
  }
}

// Configure storage with absolute path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Clean the filename to prevent issues
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}-${sanitizedFilename}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max file size
  fileFilter: fileFilter
});

export default upload;
