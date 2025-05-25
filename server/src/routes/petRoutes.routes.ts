import { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { createPetHandler,
  deletePet,
  getAllAvailablePets,
  getMyListedPets,
  getPetById, 
  updatePetHandler} from "../controllers/petController.controller.js";
import upload  from "../config/multerConfig.js";
const router = Router();


router.post(
  "/list",
  authMiddleware,
  upload.single("petImage"),
  createPetHandler
);
router.put(
  "/update/:id",
  authMiddleware,
  upload.single("petImage"), // Process new image if provided
  updatePetHandler
);
router.get("/my-listings", authMiddleware, getMyListedPets);
router.get("/view/:id",  getPetById);
router.get("/all", getAllAvailablePets);
router.delete("/delete/:id", authMiddleware, deletePet);

export default router;











