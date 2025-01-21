import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import { createOrder, updateOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create/:productId", authenticateToken, createOrder);
router.put("/update/:id", authenticateToken, updateOrder);

export default router;
