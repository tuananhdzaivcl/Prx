import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Image as ImageIcon, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout: contextLogout } = useAuth();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        contextLogout();
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    });
  };

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <span
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="font-serif font-bold text-xl text-primary cursor-pointer flex items-center gap-2">
            Lớp 9A2
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" icon={Home}>Trang chủ</NavLink>
          <NavLink href="/gallery" icon={ImageIcon}>Thư viện ảnh</NavLink>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Panel button — always visible for admins on all screen sizes */}
          {user?.isAdmin && (
            <Link href="/admin">
              <Button
                variant={location === "/admin" ? "default" : "outline"}
                size="sm"
                className={`gap-2 font-semibold ${
                  location === "/admin"
                    ? "bg-amber-600 hover:bg-amber-700 text-white border-0"
                    : "border-amber-500 text-amber-700 hover:bg-amber-50"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Chào, <span className="font-medium text-foreground">{user.username}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline-block">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
