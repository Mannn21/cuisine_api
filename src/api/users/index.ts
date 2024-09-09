import express from "express";
import usersController from '../../../controller/usersController';
import { verifyToken } from "../../middlewares";

const router = express.Router();

router.get("/", verifyToken, usersController.getAllUsers);
router.post("/", usersController.addUser);
router.get("/:id", usersController.getUserById);

export default router;