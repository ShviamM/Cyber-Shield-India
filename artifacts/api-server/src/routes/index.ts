import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import reportsRouter from "./reports";
import numbersRouter from "./numbers";
import checkRouter from "./check";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(reportsRouter);
router.use(numbersRouter);
router.use(checkRouter);
router.use(adminRouter);
router.use(statsRouter);

export default router;
