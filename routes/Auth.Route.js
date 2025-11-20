import {Router} from "express";
import { register, login, forgetPassword, resetPassword } from "../controllers/Auth.Controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;
