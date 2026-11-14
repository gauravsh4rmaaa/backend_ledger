import express from 'express';
import { authmiddlware } from '../middlewares/auth.middlerware.js';
import { createAccountController } from '../controllers/acc.controller.js';

const router = express.Router();

router.post("/createacc",authmiddlware, createAccountController);


export default router;