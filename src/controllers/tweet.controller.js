import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "Content for tweet is required")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500, "Unable to create a tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body

    if (!tweetId || !content) {
        throw new ApiError(400, "Tweet id and content is required")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        },
        {new: true}
    )

    if (!updatedTweet) {
        throw new ApiError(500, "Unable to update tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfuly")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    const result = await Tweet.deleteOne({_id: tweetId})

    if (result.acknowledged < 1) {
        throw new ApiError(500, "Unable to delete tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}