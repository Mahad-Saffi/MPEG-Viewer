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
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}