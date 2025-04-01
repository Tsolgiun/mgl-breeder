import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../config/s3.js';

export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      console.log('Processing file:', file.originalname);
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log('Generating key for file:', file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const key = 'horses/' + uniqueSuffix + '-' + file.originalname;
      console.log('Generated key:', key);
      cb(null, key);
    },
    shouldTransform: function(req, file, cb) {
      // Log any transform decisions
      console.log('Checking if file should be transformed:', file.originalname);
      cb(null, false); // Don't transform images, upload as-is
    }
  }),
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Not an image! Please upload an image.');
      console.error('File filter error:', error.message);
      cb(error, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

// Wrap the upload middleware to handle errors better
export const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
        code: err.code
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'S3 upload failed',
        error: err.message
      });
    }
    next();
  });
};
