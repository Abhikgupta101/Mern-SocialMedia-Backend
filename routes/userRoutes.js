const express = require('express')
const {
    createUser,
    getUser,
    accountLogin,
    logout,
    removeFollower,
    followUnfollow,
    deleteUser,
    getUsers,
    sendEmail,
    changePassword,
    search
} = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

router.post('/signup', createUser)
router.post('/login', accountLogin)
router.post('/sendEmail', sendEmail)
router.post('/changePassword', changePassword)
//middleware

router.use(requireAuth)

//Login
router.get('/info/:id', getUser)
router.get('/', getUsers)
router.get('/logout', logout)
router.get('/delete', deleteUser)
router.get('/follow/:id', followUnfollow)
router.get('/remove/:id', removeFollower)
router.get('/search', search)


module.exports = router
