import { 
  uploadImage, 
  uploadMultipleImages, 
  deleteImage, 
  deleteMultipleImages,
  getAuthParams,
  listImages,
  getOptimizedUrl
} from '../config/imageKit.js';

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private (Seller/Admin)
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file or base64 string'
      });
    }

    const imageFile = req.file ? req.file.buffer : req.body.image;
    const fileName = req.file ? req.file.originalname : `upload_${Date.now()}.jpg`;
    const folder = req.body.folder || '/properties';

    const result = await uploadImage(imageFile, fileName, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        thumbnailUrl: result.thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private (Seller/Admin)
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide image files'
      });
    }

    const folder = req.body.folder || '/properties';
    const result = await uploadMultipleImages(req.files, folder);

    res.status(200).json({
      success: true,
      message: `${result.images.length} images uploaded successfully`,
      images: result.images
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// @desc    Upload image from URL
// @route   POST /api/upload/url
// @access  Private (Seller/Admin)
export const uploadFromUrl = async (req, res) => {
  try {
    const { url, fileName } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL'
      });
    }

    const folder = req.body.folder || '/properties';
    const result = await uploadImage(url, fileName || `url_upload_${Date.now()}.jpg`, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded from URL successfully',
      image: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        thumbnailUrl: result.thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Upload from URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image from URL'
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/:fileId
// @access  Private (Seller/Admin)
export const removeImage = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide file ID'
      });
    }

    await deleteImage(fileId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

// @desc    Delete multiple images
// @route   DELETE /api/upload/bulk
// @access  Private (Seller/Admin)
export const removeMultipleImages = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide file IDs array'
      });
    }

    await deleteMultipleImages(fileIds);

    res.status(200).json({
      success: true,
      message: `${fileIds.length} images deleted successfully`
    });
  } catch (error) {
    console.error('Delete multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete images'
    });
  }
};

// @desc    Get ImageKit authentication parameters (for client-side upload)
// @route   GET /api/upload/auth
// @access  Private
export const getUploadAuth = async (req, res) => {
  try {
    const authParams = getAuthParams();

    res.status(200).json({
      success: true,
      ...authParams
    });
  } catch (error) {
    console.error('Get auth params error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get authentication parameters'
    });
  }
};

// @desc    List images in folder
// @route   GET /api/upload/list
// @access  Private (Admin)
export const listUploadedImages = async (req, res) => {
  try {
    const { folder, limit } = req.query;

    const result = await listImages(
      folder || '/properties',
      parseInt(limit) || 100
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list images'
    });
  }
};

// @desc    Get optimized image URL
// @route   GET /api/upload/optimize
// @access  Public
export const getOptimizedImage = async (req, res) => {
  try {
    const { url, width, height, quality, format } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide image URL'
      });
    }

    const optimizedUrl = getOptimizedUrl(url, {
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null,
      quality: quality ? parseInt(quality) : 80,
      format: format || 'auto'
    });

    res.status(200).json({
      success: true,
      originalUrl: url,
      optimizedUrl
    });
  } catch (error) {
    console.error('Optimize image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize image'
    });
  }
};
