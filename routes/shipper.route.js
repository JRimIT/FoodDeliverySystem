import express from "express";
const router = express.Router();
import * as shipperController from "../controllers/shipper.controller.js";

router.get("/dashboard", shipperController.getDashboard);
router.post('/accept/:orderId', shipperController.acceptOrder);
router.post('/delivered/:orderId', shipperController.markDelivered);

export default router;
