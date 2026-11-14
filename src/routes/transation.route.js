import express from "express";
import { authmiddlware } from "../middlewares/auth.middlerware.js";
import { createInitialFundsTransaction, transactioncontroller } from "../controllers/transaction.controller.js";
import { systemUserAuthMiddlware } from "../middlewares/systemauth.middleware.js";

const router = express.Router();

router.post("/", authmiddlware, transactioncontroller);
router.post("/initial-funds", systemUserAuthMiddlware,createInitialFundsTransaction);

export default router;
