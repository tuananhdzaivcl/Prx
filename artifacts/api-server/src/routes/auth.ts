import { Router } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, membersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.username, username));

  if (existing) {
    res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [member] = await db
    .insert(membersTable)
    .values({ username, passwordHash, isAdmin: false, isBlocked: false })
    .returning();

  req.session.memberId = member.id;

  res.status(201).json({
    member: {
      id: member.id,
      username: member.username,
      isAdmin: member.isAdmin,
      isBlocked: member.isBlocked,
      createdAt: member.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [member] = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.username, username));

  if (!member) {
    res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    return;
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    return;
  }

  if (member.isBlocked) {
    res.status(403).json({ error: "Tài khoản của bạn đã bị khóa" });
    return;
  }

  req.session.memberId = member.id;

  res.json({
    member: {
      id: member.id,
      username: member.username,
      isAdmin: member.isAdmin,
      isBlocked: member.isBlocked,
      createdAt: member.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ message: "Đã đăng xuất" });
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [member] = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.id, req.session.memberId!));

  if (!member) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({
    id: member.id,
    username: member.username,
    isAdmin: member.isAdmin,
    isBlocked: member.isBlocked,
    createdAt: member.createdAt.toISOString(),
  });
});

// One-time setup: create initial admin account if none exists
router.post("/setup", async (req, res): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password || password.length < 6) {
    res.status(400).json({ error: "Cần username và password (ít nhất 6 ký tự)" });
    return;
  }

  const admins = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.isAdmin, true));

  if (admins.length > 0) {
    res.status(403).json({ error: "Admin đã tồn tại. Endpoint này chỉ dùng một lần." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [member] = await db
    .insert(membersTable)
    .values({ username, passwordHash, isAdmin: true, isBlocked: false })
    .returning();

  res.status(201).json({
    message: "Tạo admin thành công!",
    member: {
      id: member.id,
      username: member.username,
      isAdmin: member.isAdmin,
    },
  });
});

export default router;
