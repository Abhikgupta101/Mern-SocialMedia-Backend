const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema
    (
        {
            profileName: {
                type: String
            },
            image: {
                type: String,
                // required: [true, "Please Upload Product's Image"],
            },
            userImage: {
                type: String,
            },
            likes: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    required: [true, 'Post must be liked by users']
                },
            ],
            comments: [{
                comment: {
                    user_name: {
                        type: String
                    },
                    user_id: {
                        type: String
                    },
                    text: {
                        type: String
                    }

                }
            }],
            saved_by: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    required: [true, 'Post must be saved by users']
                },
            ],
            followed_by: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    required: [true, 'Post must be followed by users']
                },
            ],
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, 'Post must belong to a user']
            },
        },
        {
            toJSON: { virtuals: true },
            toObject: { virtuals: true }
        }
    )

module.exports = mongoose.model('Post', postSchema)