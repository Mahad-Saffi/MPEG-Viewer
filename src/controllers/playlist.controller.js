import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and Description of playlist is required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(500, "Unable to create playlsit")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    const platlists = await Playlist.find({owner: userId})

    if (!platlists) {
        throw new ApiError(500, "Unable to find playlists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, platlists, "Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "Unable to find playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist is fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id and video id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "Unable to find playlist")
    }

    const videoIndex = playlist.videos.indexOf(videoId)

    if (videoIndex === -1) {
        throw new ApiError(404, "Video not found in playlist")
    }

    playlist.videos.splice(videoIndex, 1)

    const updatedPlaylist = await playlist.save()

    if (!updatedPlaylist) {
        throw new ApiError(500, "Unable to remove video from playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    await playlist.remove()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {} ,"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    playlist.name = name || playlist.name
    playlist.description = description || playlist.description

    const updatedPlaylist = await playlist.save()

    if (!updatedPlaylist) {
        throw new ApiError(500, "Unable to update playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}