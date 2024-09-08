import express from "express";
import usersController from '../../../controller/usersController';

const router = express.Router();

router.get("/", usersController.getAllUsers);
router.post("/", usersController.addUser);

export default router;