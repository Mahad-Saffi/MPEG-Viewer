import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs';
import ApiError from './ApiError';


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

export const deleteFromCoudinary = async (url) => {
    const publicId = extractPublicId(url);

    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        .then(result => {return result})
        .catch((err) => {
            throw new ApiError(500, err?.message || "something went wrong while deleting file from cloudinary")
        })
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting file from cloudinary")
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
