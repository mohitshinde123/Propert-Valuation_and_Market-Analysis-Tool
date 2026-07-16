import ImageKit from 'imageKit';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_key_here',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_key_here',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id/'
});

// Upload image to ImageKit
export const uploadImage = async (file, fileName, folder = '/properties') => {
  try {
    const result = await imagekit.upload({
      file: file, // Can be URL, base64, or binary
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['property', 'indian-realestate']
    });

    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: imagekit.url({
        src: result.url,
        transformation: [
          { width: 300, height: 200, cropMode: 'maintain_ar' }
        ]
      })
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, folder = '/properties') => {
  try {
    const uploadPromises = files.map((file, index) => 
      uploadImage(
        file.buffer || file,
        file.originalname || `image_${Date.now()}_${index}.jpg`,
        folder
      )
    );

    const results = await Promise.all(uploadPromises);
    return {
      success: true,
      images: results.map(r => ({
        url: r.url,
        fileId: r.fileId,
        thumbnailUrl: r.thumbnailUrl
      }))
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload images');
  }
};

// Delete image from ImageKit
export const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Delete multiple images
export const deleteMultipleImages = async (fileIds) => {
  try {
    await imagekit.bulkDeleteFiles(fileIds);
    return { success: true, message: 'Images deleted successfully' };
  } catch (error) {
    console.error('Multiple delete error:', error);
    throw new Error('Failed to delete images');
  }
};

// Get image URL with transformations
export const getOptimizedUrl = (imageUrl, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 80,
    format = 'auto',
    cropMode = 'maintain_ar'
  } = options;

  const transformations = [];

  if (width || height) {
    transformations.push({
      ...(width && { width }),
      ...(height && { height }),
      cropMode,
      quality
    });
  }

  // Add format optimization
  transformations.push({ format });

  return imagekit.url({
    src: imageUrl,
    transformation: transformations
  });
};

// Get thumbnail URL
export const getThumbnail = (imageUrl, width = 300, height = 200) => {
  return imagekit.url({
    src: imageUrl,
    transformation: [
      { width, height, cropMode: 'maintain_ar', quality: 70 }
    ]
  });
};

// Generate signed URL for private images
export const getSignedUrl = (imageUrl, expireSeconds = 3600) => {
  try {
    const token = imagekit.getAuthenticationParameters();
    return {
      url: imageUrl,
      token: token.token,
      expire: token.expire,
      signature: token.signature
    };
  } catch (error) {
    console.error('Signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

// List images in a folder
export const listImages = async (folder = '/properties', limit = 100) => {
  try {
    const result = await imagekit.listFiles({
      path: folder,
      limit: limit,
      sort: 'DESC_CREATED'
    });

    return {
      success: true,
      images: result.map(img => ({
        fileId: img.fileId,
        name: img.name,
        url: img.url,
        thumbnail: getThumbnail(img.url),
        size: img.size,
        createdAt: img.createdAt
      }))
    };
  } catch (error) {
    console.error('List images error:', error);
    throw new Error('Failed to list images');
  }
};

// Get ImageKit authentication parameters (for client-side upload)
export const getAuthParams = () => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return {
      success: true,
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    };
  } catch (error) {
    console.error('Auth params error:', error);
    throw new Error('Failed to get authentication parameters');
  }
};

export default imagekit;
