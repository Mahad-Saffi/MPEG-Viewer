import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const comments = await Comment.find({video: videoId})
    .skip((page - 1) * limit)
    .limit(limit);  

    if (!comments) {
        throw new ApiError(500, "Unable to find comments")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )
        
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    const userId = req.user?._id

    if (!videoId || !content) {
        throw new ApiError(400, "Video Id and content is required")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: userId
    })

    if (!comment) {
        throw new ApiError(500, "Somthing went wrong while creating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content
        },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(500, "Something went wrong while deleting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updateComment, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }