import e from "express";
import {  loginController, signUpController } from "../controllers/userCredential-controller.js";

const router = e.Router();

router.post("/signup",signUpController);
router.post("/login",loginController);

export default router;