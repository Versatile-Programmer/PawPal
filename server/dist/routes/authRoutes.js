import { Router } from "express";
import { loginController, registerController, userController } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
const router = Router();
// * Register Route 
router.post("/register", registerController);
// * Login Route
router.post("/login", loginController);
// * Get User
router.get("/user", authMiddleware, userController);
export default router;
