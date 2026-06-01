import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import reportsRouter from "./reports";
import numbersRouter from "./numbers";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(reportsRouter);
router.use(numbersRouter);
router.use(adminRouter);

export default router;
