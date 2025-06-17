import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY
    });

    console.log('Cloudinary configuration loaded successfully');

    // Test Cloudinary connection
    const testResult = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', testResult);
  } catch (error) {
    console.error('Error connecting to Cloudinary:', error);
  }
};

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise} - Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'kle-canteen') => {
  console.log('Starting Cloudinary upload for file:', filePath);

  // Verify file exists before attempting upload
  if (!fs.existsSync(filePath)) {
    console.error('File not found for Cloudinary upload:', filePath);
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    console.log('File exists, proceeding with upload to Cloudinary folder:', folder);

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    // Remove the file from local storage
    try {
      fs.unlinkSync(filePath);
      console.log('Temporary file removed:', filePath);
    } catch (unlinkError) {
      console.error('Error removing temporary file:', unlinkError);
      // Continue execution even if file removal fails
    }

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);

    // Remove the file from local storage in case of error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Temporary file removed after upload error:', filePath);
      }
    } catch (unlinkError) {
      console.error('Error removing temporary file after upload error:', unlinkError);
    }

    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 * @returns {Promise} - Cloudinary delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.log('No public ID provided for deletion');
      return null;
    }

    console.log('Deleting file from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default connectCloudinary;
