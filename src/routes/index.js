import express from "express";
import authRoutes from "./auth.js";
import meetingsRoutes from "./meetings.js";
import actionItemsRoutes from "./actionItems.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/meetings", meetingsRoutes);
router.use("/action-items", actionItemsRoutes);

export default router;
