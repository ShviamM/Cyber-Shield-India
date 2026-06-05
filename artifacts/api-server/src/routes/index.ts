import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import reportsRouter from "./reports";
import numbersRouter from "./numbers";
import checkRouter from "./check";
import adminRouter from "./admin";
import superAdminRouter from "./super-admin";
import statsRouter from "./stats";
import subscriptionRouter from "./subscription";
import notificationsRouter from "./notifications";
import familyRouter from "./family";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(reportsRouter);
router.use(numbersRouter);
router.use(checkRouter);
router.use(adminRouter);
router.use(superAdminRouter);
router.use(statsRouter);
router.use(subscriptionRouter);
router.use(notificationsRouter);
router.use(familyRouter);
router.use(webhooksRouter);

export default router;
