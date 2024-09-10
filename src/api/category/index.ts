import express from "express";
import categoryController from '../../../controller/categoryController';
import { verifyToken } from "../../middlewares";

const router = express.Router();

router.post("/", categoryController.addCategory);

export default router;