import express from "express"
import app from "./app.js"
import dotenv from "dotenv"


dotenv.config()

const server = express()
const PORT = process.env.PORT || 5000

server.use(app)

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})