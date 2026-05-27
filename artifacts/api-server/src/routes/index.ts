import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import photosRouter from "./photos";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(photosRouter);
router.use(statsRouter);
router.use(adminRouter);

export default router;
