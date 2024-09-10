import express from "express";
import productsController from '../../../controller/productsController';
import { verifyToken } from "../../middlewares";

const router = express.Router();

router.post("/", productsController.addProduct);
router.get("/", productsController.getAllProducts);
router.get("/category", productsController.getProductsByCategory);
router.get("/:id", productsController.getProductById);

export default router;