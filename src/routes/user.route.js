import express from "express";
import {
  deleteUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", authenticateToken, updateUser);
router.delete("/delete", authenticateToken, deleteUser);

export default router;
