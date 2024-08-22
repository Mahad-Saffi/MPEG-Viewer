import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs';
import ApiError from './ApiError.js';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function extractPublicId(url) {
    const parts = url.split('/');
  
    const versionIndex = parts.findIndex(part => part.startsWith('v') && !isNaN(part.slice(1)));
    
    if (versionIndex !== -1 && versionIndex + 1 < parts.length) {
      return parts[versionIndex + 1].split('.')[0];
    }
  
    return null;
}

export const deleteFromCloudinary = async (url, resourceType) => {
    const publicId = extractPublicId(url);

    if (!publicId) {
        throw new ApiError(400, "Invalid URL or public ID could not be extracted");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        return result;
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while deleting file from Cloudinary");
    }

}



export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlink(localFilePath)
        return null;
    }
}
