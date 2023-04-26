// Abc_123$ ---- password
const User = require('../models/userModel')
const Post = require('../models/postModel')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const nodemailer = require("nodemailer");


const keysecret = process.env.SECRET

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET
        // , { expiresIn: '3d' }

    )
}
//create user or signin
const createUser = async (req, res) => {

    try {
        const { token } = req.cookies

        if (token) {
            return res.status(401).json({ error: 'User Already Signed In' })
        }

        const user = await User.signup(req.body.email, req.body.password, req.body.name, req.body.image)
        //delete a token
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        const authId = createToken(user._id)
        res.status(200).cookie("token", authId, cookieOptions).json({
            success: true,
            user,
            authId
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findById({ _id: id }).populate({ path: "saved" }).populate({ path: 'posts' })
        return res.status(200).json(user)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//get all Users

const getUsers = async (req, res) => {

    try {
        const users = await User.find({ followers: { $nin: req.user._id } }).sort({ createdAt: -1 })
        res.status(200).json(users)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


//login
const accountLogin = async (req, res) => {

    try {
        const { token } = req.cookies

        console.log("login user---token", token)

        if (token) {
            return res.status(401).json({ error: 'User Already Logged In' })
        }
        const user = await User.login(req.body.email, req.body.password)
        //create a token
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        const authId = createToken(user._id)
        res.status(200).cookie("token", authId, cookieOptions).json({
            success: true,
            user,
            message: 'Logged In',
            authId
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//logout user
const logout = async (req, res) => {

    try {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now())
        };
        res.status(200).cookie("token", null, cookieOptions).json({
            success: true,
            message: 'Logged Out'
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const search = async (req, res) => {
    try {
        const search = req.query.search || "";

        const users = await User.find({
            name: {
                $regex: search,
                $options: "i"
            }
        })

        res.status(200).json({
            error: false,
            users,
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}


//Delete User
const deleteUser = async (req, res) => {
    const user_id = req.user._id
    try {
        const user = await User.findById({ _id: user_id })
        const followers = user.followers
        const following = user.following

        //deleting user
        await User.deleteOne({ _id: user_id })

        //logout user
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

        //deleting user posts
        await Post.deleteMany({ user: user_id })

        //remove followers
        for (let i = 0; i < followers.length; i++) {
            const id = followers[i]
            const followuser = await User.findById({ _id: id })
            await followuser.updateOne({ $pull: { "following": user_id } })

        }

        //remove following
        for (let i = 0; i < following.length; i++) {
            const id = following[i]
            const followinguser = await User.findById({ _id: id })
            await followinguser.updateOne({ $pull: { "followers": user_id } })

        }


        return res.status(200).json(user)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const sendEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(401).json({ status: 401, message: "Enter Your Email" })
    }

    try {
        const user = await User.findOne({ email: email });

        const token = createToken(user._id)

        if (token) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Email For password Reset",
                text: `https://bereal-app.netlify.app/password/reset/${user._id}/${token}`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    res.status(401).json({ status: 401, message: "Email not sent" })
                } else {
                    console.log("Email sent", info.response);
                    res.status(201).json({ status: 201, message: "Email sent Successfully" })
                }
            })

        }

    } catch (error) {
        res.status(401).json({ status: 401, message: "invalid user" })
    }

};

const changePassword = async (req, res) => {

    try {
        // if (!req.body.token) {
        //     return res.status(401).json({ error: 'Password Update Timeout' })
        // }
        if (!validator.isStrongPassword(req.body.password)) {
            return res.status(401).json({ error: 'Password not Strong Enough' })
        }
        const user = await User.findById({ _id: req.body.id })

        // hashing the password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        await user.updateOne({ $set: { "password": hash } })

        res.status(200).json({
            user_id: req.body.id,
            id: req.body.password,
            message: 'Password Changed Successfully'
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

}

//follow user
const followUnfollow = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        let user = await User.findById({ _id: id })
        let main_user = await User.findById({ _id: user_id })
        if (!user) {
            return res.status(404).json({
                sucess: false,
                message: "User not found"
            })
        }

        var following = true;
        var posts = []

        if (user.followers.includes(user_id)) {
            user = await user.updateOne({ $pull: { "followers": user_id } })
            main_user = await main_user.updateOne({ $pull: { "following": id } })
            await Post.updateMany({ user: id }, { $pull: { "followed_by": user_id } })
            user = await User.findById({ _id: id })
            following = false;
        }

        else {
            user = await user.updateOne({ $push: { "followers": user_id } })
            main_user = await main_user.updateOne({ $push: { "following": id } })
            await Post.updateMany({ user: id }, { $push: { "followed_by": user_id } })
            posts = await Post.find({ $or: [{ followed_by: { $in: user_id } }, { user: user_id }] })
        }
        main_user = await User.findById({ _id: user_id })
        return res.status(200).json({
            data: main_user,
            following,
            user,
            posts,
            following
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const removeFollower = async (req, res) => {
    const { id } = req.params
    const user_id = req.user._id
    try {
        let user = await User.findById({ _id: id })
        let main_user = await User.findById({ _id: user_id })
        if (!user) {
            return res.status(404).json({
                sucess: false,
                message: "User not found"
            })
        }

        if (main_user.followers.includes(id)) {
            main_user = await main_user.updateOne({ $pull: { "followers": id } })
            user = await user.updateOne({ $pull: { "following": user_id } })
            main_user = await User.findById({ _id: user_id })
            await Post.updateMany({ user: user_id }, { $pull: { "followed_by": id } })
            return res.status(200).json(main_user)
        }

        else {
            return res.status(200).json({
                message: "failed attempt"
            })
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createUser,
    getUser,
    getUsers,
    accountLogin,
    logout,
    deleteUser,
    followUnfollow,
    removeFollower,
    sendEmail,
    changePassword,
    search

}