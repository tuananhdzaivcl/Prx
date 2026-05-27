import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
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
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: contextLogin } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          contextLogin(data.member);
          toast({
            title: "Đăng nhập thành công",
            description: `Chào mừng ${data.member.username} trở lại!`,
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            title: "Đăng nhập thất bại",
            description: "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[url('/images/memories_3.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-[#fdfbf7]/80 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl z-10 border border-border/50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Đăng nhập</h1>
          <p className="text-muted-foreground text-sm">
            Trở lại với ký ức tuổi học trò
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} className="bg-[#fdfbf7]" />
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
            <Button type="submit" className="w-full h-11 text-base font-medium mt-2" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register">
            <span className="text-primary font-medium hover:underline cursor-pointer">Đăng ký ngay</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
