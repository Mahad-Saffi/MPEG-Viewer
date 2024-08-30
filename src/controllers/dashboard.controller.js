import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    const videos = await Video.find({ owner: userId })

    if (!videos) {
        throw new ApiError(500, "Unable to find videos")
    }

    const totalVideos = videos.length

    const totalViews = videos.reduce((acc, video) => acc + video.views, 0)

    const totalLikes = await Like.find({ video: { $in: videos.map(video => video._id) } })

    if (!totalLikes) {
        throw new ApiError(500, "Unable to find likes")
    }

    const totalSubscribers = await Subscription.find({ channel: userId })

    if (!totalSubscribers) {
        throw new ApiError(500, "Unable to find subscribers")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalLikes: totalLikes.length,
            totalSubscribers: totalSubscribers.length
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    const videos = await Video.find({ owner: userId })

    if (!videos) {
        throw new ApiError(500, "Unable to find videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }