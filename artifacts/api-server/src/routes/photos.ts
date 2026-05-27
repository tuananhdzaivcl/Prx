import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { eq, desc } from "drizzle-orm";
import { db, membersTable, photosTable } from "@workspace/db";
import { DeletePhotoParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép tệp ảnh (.jpg, .png, .gif, .webp)"));
    }
  },
});

const router = Router();

router.get("/photos", async (req, res): Promise<void> => {
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
    .where(eq(photosTable.isApproved, true))
    .orderBy(desc(photosTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post(
  "/photos",
  requireAuth,
  upload.single("file"),
  async (req, res): Promise<void> => {
    const memberId = req.session.memberId!;

    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, memberId));

    if (!member || member.isBlocked) {
      res.status(403).json({ error: "Tài khoản của bạn đã bị khóa" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Vui lòng chọn ảnh để tải lên" });
      return;
    }

    const url = `/api/uploads/${(req.file as Express.Multer.File & { filename: string }).filename}`;
    const caption =
      typeof req.body.caption === "string" ? req.body.caption : null;
    const isApproved = member.isAdmin;

    const [photo] = await db
      .insert(photosTable)
      .values({ url, caption, uploaderId: memberId, isApproved })
      .returning();

    res.status(201).json({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
      uploaderId: photo.uploaderId,
      uploaderName: member.username,
      createdAt: photo.createdAt.toISOString(),
      isApproved: photo.isApproved,
    });
  },
);

router.delete("/photos/:id", requireAuth, async (req, res): Promise<void> => {
  const [member] = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.id, req.session.memberId!));

  if (!member || !member.isAdmin) {
    res.status(403).json({ error: "Chỉ admin mới có quyền xóa ảnh" });
    return;
  }

  const rawId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  const params = DeletePhotoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [photo] = await db
    .select()
    .from(photosTable)
    .where(eq(photosTable.id, params.data.id));

  if (!photo) {
    res.status(404).json({ error: "Ảnh không tồn tại" });
    return;
  }

  if (!photo.url.startsWith("http")) {
    const filename = path.basename(photo.url);
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  await db.delete(photosTable).where(eq(photosTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;
