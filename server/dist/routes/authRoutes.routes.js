import { Router } from "express";
import { loginController, registerController, userController, checkCredentials } from "../controllers/authController.controller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
const router = Router();
// * Register Route 
//POST: /api/auth/register
router.post("/register", registerController);
// * Login Route
//POST: /api/auth/login
router.post("/login", loginController);
//POST: /api/auth/check/credentials
router.post("/check/credentials", checkCredentials);
// * Get User
// GET: /api/auth/user
router.get("/user", authMiddleware, userController);
export default router;
