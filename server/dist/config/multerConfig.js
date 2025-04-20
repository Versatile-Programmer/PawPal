import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
// --- Get the equivalent of __dirname in ESM ---
const __filename = fileURLToPath(import.meta.url); // Get the full path to the current file
const __dirname = path.dirname(__filename); // Get the directory containing the current file
// --- End ESM __dirname fix ---
// Define the destination directory for uploads relative to the current file's directory
// Assuming dist/config/multerConfig.js needs to go up two levels to reach the project root
// where 'public' typically resides. Adjust '../..' if your structure differs.
const uploadDir = path.join(__dirname, "../../public/uploads/pets");
// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created upload directory: ${uploadDir}`);
    }
    catch (err) {
        console.error(`Failed to create upload directory ${uploadDir}:`, err);
        // Consider throwing error or exiting if upload dir is critical
    }
}
else {
    console.log(`Upload directory already exists: ${uploadDir}`);
}
// Configure disk storage (rest of the code remains the same)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if dir exists again just before saving (optional safety)
        if (!fs.existsSync(uploadDir)) {
            return cb(new Error(`Upload directory missing: ${uploadDir}`), uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    },
});
// File filter function
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        // Use Error object for better error handling
        cb(new Error("File is not an image"), false);
    }
};
// Create the multer instance
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
    },
});
export default upload;
