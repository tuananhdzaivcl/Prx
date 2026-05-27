import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Blocked() {
  const { logout: contextLogout } = useAuth();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        contextLogout();
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        window.location.href = "/";
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-destructive/20 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
          Tài khoản bị khóa
        </h1>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Tài khoản của bạn đã bị quản trị viên tạm khóa. Bạn không thể truy cập vào trang kỷ niệm của lớp lúc này. 
          Vui lòng liên hệ ban cán sự lớp để biết thêm chi tiết.
        </p>
        
        <Button onClick={handleLogout} variant="outline" className="w-full">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
