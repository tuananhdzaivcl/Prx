import { Router } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, membersTable, photosTable } from "@workspace/db";

const router = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [photoCountRow] = await db
    .select({ count: count() })
    .from(photosTable)
    .where(eq(photosTable.isApproved, true));

  const [memberCountRow] = await db
    .select({ count: count() })
    .from(membersTable)
    .where(eq(membersTable.isAdmin, false));

  const recentRows = await db
    .select({
      id: photosTable.id,
      url: photosTable.url,
      caption: photosTable.caption,
      uploaderId: photosTable.uploaderId,
      uploaderName: membersTable.username,
      createdAt: photosTable.createdAt,
      isApproved: photosTable.isApproved,
    })
    .from(photosTable)
    .innerJoin(membersTable, eq(photosTable.uploaderId, membersTable.id))
    .where(eq(photosTable.isApproved, true))
    .orderBy(desc(photosTable.createdAt))
    .limit(6);

  res.json({
    totalPhotos: photoCountRow.count,
    totalMembers: memberCountRow.count,
    recentPhotos: recentRows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

export default router;
