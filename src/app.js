import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({limit: '15kb'}));
app.use(express.urlencoded({extended: true, limit: '15kb'}));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
import userRouter from './routes/user.route.js';

// Routes Declaration
app.use("/api/v1/users", userRouter)

export default app;