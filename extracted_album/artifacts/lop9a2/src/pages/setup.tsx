import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

export default function Setup() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { message?: string; error?: string; member?: { username: string } };
      if (!res.ok) {
        toast({ title: "Lỗi", description: data.error ?? "Có lỗi xảy ra", variant: "destructive" });
      } else {
        setDone(true);
        toast({ title: "Thành công!", description: `Tài khoản admin "${data.member?.username}" đã được tạo.` });
      }
    } catch {
      toast({ title: "Lỗi kết nối", description: "Không thể kết nối tới server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-border/50">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-2xl font-serif font-bold text-primary">Tạo tài khoản Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Chỉ dùng được một lần khi chưa có admin nào.
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">✅ Tạo admin thành công!</p>
            <a
              href="/login"
              className="inline-block w-full text-center bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Đăng nhập ngay
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                minLength={3}
                className="bg-[#fdfbf7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-[#fdfbf7]"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...</> : "Tạo tài khoản Admin"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
