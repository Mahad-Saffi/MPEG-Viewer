import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
});

connectDB()
.then(() => {
    console.log(`MongoDB connected successfully`);

    // Listening for any type of error
    app.on("error", (err) => {
        console.log(`Express server error: ${err}`);
    });

    // Listening for the port
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log(`MongoDB connection failed: ${err}`);
    process.exit(1);
});