import express from "express";
import userRoute from "./user.js";
import authRoute from "./auth.js";

const router = express.Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);

export default router;
