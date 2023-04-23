const Post = require('../models/postModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

//get all posts

const getFollowingUserPosts = async (req, res) => {
    const { token } = req.cookies
    console.log("post------", token)

    const user_id = req.user._id
    try {
        const posts = await Post.find({ $or: [{ followed_by: { $in: user_id } }, { user: user_id }] }).sort({ createdAt: -1 })
        return res.status(200).json(posts)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getPosts = async (req, res) => {

    try {
        const post = await Post.find().sort({ createdAt: -1 })
        res.status(200).json(post)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//create posts
const createPost = async (req, res) => {
    const user_id = req.user._id
    try {
        const user = await User.findById({ _id: user_id })
        const post = await Post.create(
            {
                profileName: user.name,
                image: req.body.image,
                userImage: user.avatar,
                saved_by: [],
                likes: [],
                comments: [],
                user: user_id,
            }
        )
        res.status(200).json(post)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}



const likeDislike = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        const post = await Post.findById({ _id: id })
        if (!post) {
            return res.status(404).json({
                sucess: false,
                message: "Post not found"
            })
        }

        if (post.likes.includes(user_id)) {
            await post.updateOne({ $pull: { "likes": user_id } })
            const updatedPost = await Post.findById({ _id: id })
            return res.status(200).json({
                message: "unliked",
                updatedPost
            })
        }
        else {
            await post.updateOne({ $push: { "likes": user_id } })
            const updatedPost = await Post.findById({ _id: id })
            return res.status(200).json({
                message: "liked",
                updatedPost
            })
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const commentPost = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    const text = req.body.comment
    try {
        const user = await User.findById({ _id: user_id })
        const post = await Post.findById({ _id: id })
        if (!post) {
            return res.status(404).json({
                sucess: false,
                message: "Post not found"
            })
        }
        await post.updateOne({ $push: { "comments": { comment: { user_id, user_name: user.name, text } } } })
        const updatedPost = await Post.findById({ _id: id })
        return res.status(200).json(updatedPost)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const savePost = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        const user = await User.findById({ _id: user_id })
        const post = await Post.findById({ _id: id })
        if (!post) {
            return res.status(404).json({
                sucess: false,
                message: "Post not found"
            })
        }
        if (post.saved_by.includes(user_id)) {
            await post.updateOne({ $pull: { "saved_by": user_id } })
            const updatedPost = await Post.findById({ _id: id })
            return res.status(200).json({
                message: "unsaved",
                updatedPost
            })
        }
        else {
            await post.updateOne({ $push: { "saved_by": user_id } })
            const updatedPost = await Post.findById({ _id: id })
            return res.status(200).json({
                message: "saved",
                updatedPost
            })
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deletePost = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        // const user = await User.findById({ _id: user_id })
        await Post.deleteOne({ _id: id })
        // if (!post) {
        //     return res.status(404).json({
        //         sucess: false,
        //         message: "Post not found"
        //     })
        // }

        return res.status(200).json(id)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = {
    getPosts,
    getFollowingUserPosts,
    createPost,
    likeDislike,
    commentPost,
    savePost,
    deletePost
}