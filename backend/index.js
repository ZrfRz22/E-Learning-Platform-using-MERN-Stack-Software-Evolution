const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path") // to import the path model.

const app = express()
const Routes = require("./routes/route.js")

const PORT = process.env.PORT || 5001

dotenv.config();

app.use(express.json({ limit: '10mb' }))
app.use(cors())

// Makes the 'uploads' folder public.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})