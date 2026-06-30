import { Router } from "express";
import { addToHistory, getUserHistory, userLogin, userRegister } from "../controllers/user.controller.js";

const router = Router();

router.post("/login", userLogin);
router.post("/register", userRegister);
router.post("/add_to_activity", addToHistory);
router.get("/get_all_activity", getUserHistory);

export default router;