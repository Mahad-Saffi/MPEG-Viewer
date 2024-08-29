import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const sortDirection = sortType === 'desc' ? -1 : 1; // Convert sortType to a MongoDB-compatible format

    const matchStage = {};

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    if (query) {
        matchStage.$text = { $search: query };
    }

    const pipeline = [
        {
            $match: matchStage,
        },
        {
            $lookup: {
                from: "users", 
                localField: "owner", 
                foreignField: "_id", 
                as: "user", 
            },
        },
        {
            $unwind: "$user",
        },
        {
            $sort: {
                [sortBy]: sortDirection,
            },
        },
        {
            $skip: (pageNumber - 1) * limitNumber,
        },
        {
            $limit: limitNumber,
        },
    ];

    const videos = await Video.aggregate(pipeline);

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    if (!title || !description) {
        throw new ApiError(401, "Title or description is missing")
    }

    let videoLocalPath;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0].path;
    }else{
        throw new ApiError(400, "video file is required");
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }else{
        throw new ApiError(400, "thumbnail file is required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!video || !thumbnail) {
        throw new ApiError(500, "Something went wrong while uploading file on cloudinary")
    }

    const videoObject = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        isPublished: true,
        duration: video.duration,
        owner: req.user?._id
    })

    const publishedVideo = await Video.find({videoFile: video.url})

    if (!publishedVideo) {
        throw new ApiError(500, "Something went wrong while publishing the video")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, {publishedVideo}, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(401, "Video id is required")
    }

    const video = await Video.findById(videoId).select("videoFile")

    if (!video) {
        throw new ApiError(500, "Something went wrong while fetching the video")
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                video
            },
            "Video fetched successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    
    const {title, description} = req.body
    
    if (!(title || description)) {
        throw new ApiError(401, "Title and description is required")
    }
    
    const thumbnailPath = req.file?.path
    
    if (!thumbnailPath) {
        throw new ApiError(401, "Thumbnail is missing")
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    
    if (!thumbnail) {
        throw new ApiError(500, "Something went wrong during upload of thumbnail on cloudinary")
    }
    
    const video = await Video.findById(videoId)
    
    if(!video) {throw new ApiError(500, "Unable to retrieve video thumbnail which is to be deleted")}
    const isFileDeleted = await deleteFromCloudinary(video.thumbnail, "image")

    if (!isFileDeleted) {
        throw new ApiError(500, "Something went wrong during deleting of thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            title: title,
            description: description,
            thumbnail: thumbnail.url
        },
        {new: true}
    )

    if (!updateVideo) {
        throw new ApiError(500, "Video cannot be upadted successfully")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, updateVideo, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(500, "Unable to find video from videoId")
    }

    const result = await Video.deleteOne({_id: video._id})

    if (result.acknowledged < 1) {
        throw new ApiError(500, "Unable to delete a video")
    }

    const isFileDeleted = await deleteFromCloudinary(video.videoFile, "video")

    if (!isFileDeleted) {
        throw new ApiError(500, "Unable to delete file from cloudinary")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(500, "Unable to fetch the video")
    }

    if(video.isPublished === true){
        video.isPublished = false;
    }else {
        video.isPublished = true;
    }

    const savedVideo = await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, savedVideo, "Published status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}