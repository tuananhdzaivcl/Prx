import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: contextLogin } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    registerMutation.mutate(
      { data: { username: values.username, password: values.password } },
      {
        onSuccess: (data) => {
          contextLogin(data.member);
          toast({
            title: "Đăng ký thành công",
            description: `Chào mừng ${data.member.username} tham gia trang kỷ niệm!`,
          });
          setLocation("/");
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Không thể đăng ký. Tên đăng nhập có thể đã tồn tại.";
          toast({
            title: "Đăng ký thất bại",
            description: msg,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[url('/images/memories_4.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-[#fdfbf7]/85 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl z-10 border border-border/50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Đăng ký</h1>
          <p className="text-muted-foreground text-sm">
            Tham gia vào lớp 9A2
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên của bạn" {...field} className="bg-[#fdfbf7]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-[#fdfbf7]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-[#fdfbf7]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11 text-base font-medium mt-6" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Đã là thành viên?{" "}
          <Link href="/login">
            <span className="text-primary font-medium hover:underline cursor-pointer">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
