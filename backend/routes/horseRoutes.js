import express from 'express';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import {
  getHorses,
  getHorseById,
  createHorse,
  updateHorse,
  deleteHorse,
  getHorsePedigree,
  getHorseDescendants,
} from '../controllers/horseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadWithErrorHandling } from '../middleware/uploadMiddleware.js';
import { s3Client } from '../config/s3.js';

const router = express.Router();

// Test endpoint for S3 connectivity
router.get('/test-s3', protect, async (req, res) => {
  try {
    console.log('Testing S3 connection...');
    const command = new HeadBucketCommand({
      Bucket: process.env.AWS_BUCKET_NAME
    });
    
    await s3Client.send(command);
    console.log('S3 connection successful');
    res.json({ 
      success: true, 
      message: 'S3 connection successful',
      bucket: process.env.AWS_BUCKET_NAME
    });
  } catch (error) {
    console.error('S3 Test Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'S3 connection failed',
      error: error.message,
      details: error.stack
    });
  }
});

// Pedigree routes
// Base routes
router.route('/')
  .get(getHorses)
  .post(protect, uploadWithErrorHandling, createHorse);

// ID-based routes
router.route('/:id')
  .get(getHorseById)
  .put(protect, uploadWithErrorHandling, updateHorse)
  .delete(protect, deleteHorse);

// Pedigree routes
router.get('/:id/pedigree', getHorsePedigree);
router.get('/:id/descendants', getHorseDescendants);

export default router;
