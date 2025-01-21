import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", authenticateToken, getAllProduct);
router.get("/:id", authenticateToken, getProductById);
router.post("/create", authenticateToken, createProduct);
router.put("/update/:id", authenticateToken, updateProduct);
router.delete("/delete/:id", authenticateToken, deleteProduct);

export default router;
