import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRouter from "./routes/user.routes.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
dotenv.config({});

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "I'm coming from backend",
        success: true,
    });
});

//middleWares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRoute );
app.use("/api/v1/message", messageRoute);


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running at PORT : ${PORT}`);
});
