/**
 * Script to ensure the uploads directory exists with proper permissions
 * Run this script before starting the server
 */

import fs from 'fs';
import path from 'path';

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
    process.exit(1);
  }
} else {
  console.log('Uploads directory already exists');
  // Ensure proper permissions
  try {
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Uploads directory permissions updated');
  } catch (error) {
    console.error('Error updating uploads directory permissions:', error);
    process.exit(1);
  }
}

console.log('Uploads directory is ready');
