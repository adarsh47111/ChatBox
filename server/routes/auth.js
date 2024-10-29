import express from "express";
import { authController } from "../controllers/index.js";
const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/passwordreset/email").post(authController.sendEmail);
router.route("/passwordreset/verifyOtp").post(authController.verifyOTP);
router
  .route("/passwordreset/updatepassword")
  .post(authController.updatePassword);

export default router;
