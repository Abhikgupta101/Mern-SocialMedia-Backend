const express = require('express')
const {
    getPosts, getFollowingUserPosts, createPost, likeDislike, commentPost, savePost, deletePost
} = require('../controllers/postController')
const requireAuth = require('../middleware/requireAuth')
const cookieParser = require("cookie-parser")
const router = express.Router()

//middleware
router.use(cookieParser());
router.use(requireAuth)

//routes
router.get('/', getPosts)
router.get('/followingPosts', getFollowingUserPosts)
router.post('/', createPost)
router.get('/like/:id', likeDislike)
router.post('/comment/:id', commentPost)
router.get('/save/:id', savePost)
router.get('/delete/:id', deletePost)

module.exports = router