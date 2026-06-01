import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, scamCategoriesTable } from "@workspace/db";
import type { CategoryListResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db
    .select()
    .from(scamCategoriesTable)
    .orderBy(asc(scamCategoriesTable.sortOrder));

  const response: CategoryListResponse = {
    categories: categories.map((c) => ({
      id: c.id,
      key: c.key,
      nameEn: c.nameEn,
      descriptionEn: c.descriptionEn,
      icon: c.icon,
      sortOrder: c.sortOrder,
    })),
  };
  res.json(response);
});

export default router;
