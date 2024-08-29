import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const isLiked = await Like.findOne({likedBy: req.user?._id, video: videoId})

    if (isLiked) {
        const deletedLike = await Like.findOneAndDelete({likedBy: req.user?._id, video: videoId})

        if (!deletedLike) {
            throw new ApiError(500, "Something went wrong while deleting like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "Like deleted successfully")
        )
    }

    const like = {
        likedBy: req.user?._id,
        video: videoId,
    }

    const createdLike = await Like.create(like)

    if (!createdLike) {
        throw new ApiError(500, "Something went wrong while created new like")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdLike, "Like created successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    const isLiked = await Like.findOne({likedBy: req.user?._id, comment: commentId})

    if (isLiked) {
        const deletedLike = await Like.findOneAndDelete({likedBy: req.user?._id, comment: commentId})

        if (!deletedLike) {
            throw new ApiError(500, "Something went wrong while deleting like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "Like deleted successfully")
        )
    }

    const like = {
        likedBy: req.user?._id,
        comment: commentId,
    }

    const createdLike = await Like.create(like)

    if (!createdLike) {
        throw new ApiError(500, "Something went wrong while created new like")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdLike, "Like created successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    const isLiked = await Like.findOne({likedBy: req.user?._id, tweet: tweetId})

    if (isLiked) {
        const deletedLike = await Like.findOneAndDelete({likedBy: req.user?._id, tweet: tweetId})

        if (!deletedLike) {
            throw new ApiError(500, "Something went wrong while deleting like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "Like deleted successfully")
        )
    }

    const like = {
        likedBy: req.user?._id,
        tweet: tweetId,
    }

    const createdLike = await Like.create(like)

    if (!createdLike) {
        throw new ApiError(500, "Something went wrong while created new like")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdLike, "Like created successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user?._id

    if (!user) {
        throw new ApiError(400, "User id is required")
    }

    const likedVideos = await Like.find({likedBy: user}).populate("video")

    if (!likedVideos) {
        throw new ApiError(500, "Unable to fetch liked videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}