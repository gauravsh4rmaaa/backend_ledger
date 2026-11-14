import express from "express";
import { getBalance } from "../controllers/get.controller.js";
import { authmiddlware } from "../middlewares/auth.middlerware.js";

const router = express.Router();

router.get("/balance", authmiddlware, getBalance);

export default router;
