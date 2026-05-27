import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, membersTable, photosTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router = Router();

async function checkAdmin(memberId: number): Promise<boolean> {
  const [m] = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.id, memberId));
  return !!m && m.isAdmin;
}

router.get("/admin/members", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
    return;
  }

  const rows = await db
    .select({
      id: membersTable.id,
      username: membersTable.username,
      isAdmin: membersTable.isAdmin,
      isBlocked: membersTable.isBlocked,
      createdAt: membersTable.createdAt,
      photoCount: sql<number>`cast(count(${photosTable.id}) as int)`,
    })
    .from(membersTable)
    .leftJoin(photosTable, eq(photosTable.uploaderId, membersTable.id))
    .groupBy(membersTable.id)
    .orderBy(desc(membersTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.patch("/admin/members/:id/block", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [member] = await db
    .update(membersTable)
    .set({ isBlocked: true })
    .where(eq(membersTable.id, id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Thành viên không tồn tại" });
    return;
  }

  res.json({
    id: member.id,
    username: member.username,
    isAdmin: member.isAdmin,
    isBlocked: member.isBlocked,
    createdAt: member.createdAt.toISOString(),
    photoCount: 0,
  });
});

router.patch("/admin/members/:id/unblock", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [member] = await db
    .update(membersTable)
    .set({ isBlocked: false })
    .where(eq(membersTable.id, id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Thành viên không tồn tại" });
    return;
  }

  res.json({
    id: member.id,
    username: member.username,
    isAdmin: member.isAdmin,
    isBlocked: member.isBlocked,
    createdAt: member.createdAt.toISOString(),
    photoCount: 0,
  });
});

router.get("/admin/photos", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
    return;
  }

  const rows = await db
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
    .orderBy(desc(photosTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.patch("/admin/photos/:id/approve", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền duyệt ảnh" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [photo] = await db
    .update(photosTable)
    .set({ isApproved: true })
    .where(eq(photosTable.id, id))
    .returning();

  if (!photo) {
    res.status(404).json({ error: "Ảnh không tồn tại" });
    return;
  }

  const [uploader] = await db
    .select({ username: membersTable.username })
    .from(membersTable)
    .where(eq(membersTable.id, photo.uploaderId));

  res.json({
    id: photo.id,
    url: photo.url,
    caption: photo.caption,
    uploaderId: photo.uploaderId,
    uploaderName: uploader?.username ?? "",
    createdAt: photo.createdAt.toISOString(),
    isApproved: photo.isApproved,
  });
});

router.patch("/admin/photos/:id/reject", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = await checkAdmin(req.session.memberId!);
  if (!isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền từ chối ảnh" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [photo] = await db
    .update(photosTable)
    .set({ isApproved: false })
    .where(eq(photosTable.id, id))
    .returning();

  if (!photo) {
    res.status(404).json({ error: "Ảnh không tồn tại" });
    return;
  }

  const [uploader] = await db
    .select({ username: membersTable.username })
    .from(membersTable)
    .where(eq(membersTable.id, photo.uploaderId));

  res.json({
    id: photo.id,
    url: photo.url,
    caption: photo.caption,
    uploaderId: photo.uploaderId,
    uploaderName: uploader?.username ?? "",
    createdAt: photo.createdAt.toISOString(),
    isApproved: photo.isApproved,
  });
});

export default router;
