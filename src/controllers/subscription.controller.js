import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscriber = req.user?._id

    const subscription = await Subscription.findOne({channel: channelId, subscriber: subscriber})

    if (subscription) {
        await subscription.deleteOne({subscriber: subscriber})
        return res
        .status(200)
        .json(
            new ApiResponse(200, {} ,"Unsubscribed successfully")
        )
    }

    const createdSubscription = await Subscription.create({channel: channelId, subscriber: subscriber})

    if (!createdSubscription) {
        throw new ApiError(500, "Something went wrong while subscribing to the channel")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdSubscription, "Subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }

    const channel = await User.findById(subscriberId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {channel: new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                "subscriber.password": 0,
                "subscriber.email": 0,
                "subscriber.createdAt": 0,
                "subscriber.updatedAt": 0,
                "subscriber.refreshToken": 0
            }
        }
    ])

    if (!subscribers) {
        throw new ApiError(404, "No subscribers found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Subscriber ID")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {subscriber: new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                "channel.password": 0,
                "channel.email": 0,
                "channel.createdAt": 0,
                "channel.updatedAt": 0,
                "channel.refreshToken": 0
            }
        }
    ])

    if (!subscribedChannels) {
        throw new ApiError(404, "No subscribed channels found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}