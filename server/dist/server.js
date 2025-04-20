import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
/*
 * we are using dotenv/config because here only one .env file present use dotenv(manual mode)  when there is multiple .env file
 */
import "dotenv/config";
import Routes from "./routes/index.routes.js";
import prisma from "./config/database.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5005;
const publicUploadsPath = path.join(__dirname, "../public/uploads");
console.log(`[Server.ts] Serving static '/uploads' from: ${publicUploadsPath}`);
app.use("/uploads", express.static(publicUploadsPath));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(Routes);
// app.use("/uploads", express.static(path.join(__dirname, "../public/uploads"))); 
// * set View Engine
app.set("view engine", "ejs");
import "./jobs/index.js";
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("connected to database successfully 🚀");
    }
    catch (error) {
        console.error("database connection failed ", error);
        process.exit(1);
    }
};
const connectServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
    catch {
        console.error("server connection failed");
    }
};
connectServer();
