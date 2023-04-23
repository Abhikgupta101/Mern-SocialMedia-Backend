require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const postRoutes = require('./routes/postRoutes')
const userRoutes = require('./routes/userRoutes')
const app = express()
const cors = require("cors");

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'https://bereal-app.netlify.app/',
    credentials: true,
}));


//routes
app.use('/api/user', userRoutes)
app.use('/api/posts', postRoutes)

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
    console.log('Listening on port', PORT)
})

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => { server })
    .catch((error) => {
        console.log(error)
    })
