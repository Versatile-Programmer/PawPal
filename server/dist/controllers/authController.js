import prisma from "../config/database.js";
import { registerSchema, loginSchema } from "../validation/authValidations.js";
import { formatError, renderEmailEjs } from "../helper.js";
import bcrypt from "bcrypt";
import { v4 as uuid4 } from "uuid";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
import jwt from "jsonwebtoken";
/**
 * @description Handles user registration, including validation, hashing passwords, and storing user data in the database.
 * @route POST /register
 * @access Public
 * @param {Request} req - Express request object containing user registration data.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Responds with a success message or an appropriate error message.
 */
const registerController = async (req, res) => {
    try {
        // console.log("Starting user registration process");
        // Extract request body
        const body = req.body;
        // console.log("Request body extracted:", body);
        // Validate user input using Zod schema
        const payload = registerSchema.safeParse(body);
        if (!payload.success) {
            const errors = formatError(payload.error);
            // console.log("Validation error:", errors);
            res.status(422).json({ message: "Validation error", errors });
            return;
        }
        // Check if a user with the provided email already exists
        let user = await prisma.user.findUnique({
            where: { email: payload.data.email },
        });
        if (user) {
            // console.log("User already exists:", payload.data.email);
            res.status(409).json({ message: "User already exists" });
            return;
        }
        // Generate a cryptographic salt
        const salt = await bcrypt.genSalt(10);
        // console.log("Cryptographic salt generated");
        // Hash the user's password
        payload.data.password = await bcrypt.hash(payload.data.password, salt);
        // console.log("Password hashed");
        // Generate a unique token for email verification or password reset
        const token = await bcrypt.hash(uuid4(), salt);
        // console.log("Email verification token generated");
        // Construct the email verification URL
        const url = `${process.env.APP_URL}/verify-email?email=${payload.data.email}&token=${token}`;
        // console.log("Email verification URL constructed:", url);
        // Construct the email body with the verification link and user details
        const emailBody = await renderEmailEjs("email_verify", { name: payload.data.name, url: url });
        // console.log("Email body constructed");
        // Add the email to the email queue handle by bullMq
        await emailQueue.add(emailQueueName, { to: payload.data.email, subject: "Verify your email address", body: emailBody });
        // console.log("Email added to the queue");
        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: {
                name: payload.data.name,
                email: payload.data.email,
                password: payload.data.password, // Store hashed password
                email_verify_token: token,
            },
        });
        // console.log("New user created:", newUser);
        // Send success response
        res.status(201).json({ message: "Check your email to verify your account" });
        // console.log("Success response sent");
        return;
    }
    catch (error) {
        // console.error("Internal server error:", error);
        // Handle server errors
        res.status(500).json({ message: "Internal server error" });
    }
};
const loginController = async (req, res) => {
    try {
        const body = req.body;
        console.log(body);
        const payload = loginSchema.safeParse(body);
        if (!payload.success) {
            const errors = formatError(payload.error);
            res.status(422).json({ message: "Validation error", errors });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { email: payload.data.email }
        });
        if (!user || user === null) {
            res.status(422).json({ errors: { email: "No User found with this email" } });
            return;
        }
        else {
            // * Check Password
            const isPasswordValid = await bcrypt.compare(payload.data.password, user.password);
            if (!isPasswordValid) {
                res.status(422).json({ errors: { emails: "Invalid Credentials." } });
                return;
            }
            const jwtPayload = {
                id: user.id,
                name: user.name,
                email: user.email,
            };
            const token = jwt.sign(jwtPayload, process.env.SECRET_KEY, { expiresIn: "30d" });
            res.status(200).json({ message: "Login Success", data: { ...jwtPayload, token: `Bearer ${token}` } });
            return;
        }
    }
    catch (error) {
        // console.error("Internal server error:", error);
        // Handle server errors
        res.status(500).json({ message: "Internal server error" });
    }
};
const userController = (req, res) => {
    const user = req.user;
    res.json({ data: user });
};
export { registerController, loginController, userController };
