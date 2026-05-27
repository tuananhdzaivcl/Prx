import { useAuth } from "@/lib/AuthContext";
import {
  useListMembers,
  useBlockMember,
  useUnblockMember,
  useDeletePhoto,
  useAdminListPhotos,
  useApprovePhoto,
  useRejectPhoto,
  getListMembersQueryKey,
  getListPhotosQueryKey,
  getAdminListPhotosQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  ShieldAlert,
  Calendar,
  Image as ImageIcon,
  Check,
  X,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const [blockMemberId, setBlockMemberId] = useState<{ id: number; isBlocked: boolean } | null>(null);

  const { data: members, isLoading: isLoadingMembers } = useListMembers({
    query: {
      enabled: !!user?.isAdmin,
      queryKey: getListMembersQueryKey(),
    },
  });

  const { data: photos, isLoading: isLoadingPhotos } = useAdminListPhotos({
    query: {
      enabled: !!user?.isAdmin,
      queryKey: getAdminListPhotosQueryKey(),
    },
  });

  const blockMutation = useBlockMember();
  const unblockMutation = useUnblockMember();
  const deletePhotoMutation = useDeletePhoto();
  const approvePhotoMutation = useApprovePhoto();
  const rejectPhotoMutation = useRejectPhoto();

  useEffect(() => {
    if (!isAuthLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user?.isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingPhotos = photos?.filter((p) => !p.isApproved) ?? [];
  const approvedPhotos = photos?.filter((p) => p.isApproved) ?? [];

  const confirmToggleBlock = () => {
    if (!blockMemberId) return;
    const { id, isBlocked } = blockMemberId;
    const mutation = isBlocked ? unblockMutation : blockMutation;
    mutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: `Đã ${isBlocked ? "mở khóa" : "khóa"} tài khoản.`,
          });
          queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
          setBlockMemberId(null);
        },
        onError: () => {
          toast({
            title: "Lỗi",
            description: "Không thể thay đổi trạng thái tài khoản.",
            variant: "destructive",
          });
          setBlockMemberId(null);
        },
      }
    );
  };

  const confirmDeletePhoto = () => {
    if (deletePhotoId === null) return;
    deletePhotoMutation.mutate(
      { id: deletePhotoId },
      {
        onSuccess: () => {
          toast({ title: "Thành công", description: "Đã xóa bức ảnh." });
          queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getAdminListPhotosQueryKey() });
          setDeletePhotoId(null);
        },
        onError: () => {
          toast({ title: "Lỗi", description: "Không thể xóa ảnh.", variant: "destructive" });
          setDeletePhotoId(null);
        },
      }
    );
  };

  const handleApprove = (id: number) => {
    approvePhotoMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Đã duyệt ảnh", description: "Ảnh đã được hiển thị công khai." });
          queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getAdminListPhotosQueryKey() });
        },
        onError: () => {
          toast({ title: "Lỗi", description: "Không thể duyệt ảnh.", variant: "destructive" });
        },
      }
    );
  };

  const handleReject = (id: number) => {
    rejectPhotoMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Đã từ chối ảnh", description: "Ảnh đã được đưa về trạng thái chờ." });
          queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getAdminListPhotosQueryKey() });
        },
        onError: () => {
          toast({ title: "Lỗi", description: "Không thể từ chối ảnh.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <ShieldAlert className="w-7 h-7 md:w-8 md:h-8 text-destructive" />
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Trang Quản Trị</h1>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 md:mb-8 bg-white border border-border shadow-sm p-1 w-full">
          <TabsTrigger
            value="pending"
            className="flex-1 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt
            {pendingPhotos.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingPhotos.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Đã duyệt ({approvedPhotos.length})
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            Thành viên ({members?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Pending Photos Tab */}
        <TabsContent value="pending">
          {isLoadingPhotos ? (
            <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-border/50">
              Đang tải ảnh...
            </div>
          ) : pendingPhotos.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-border/50">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Không có ảnh nào đang chờ duyệt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pendingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="aspect-video relative bg-black/5">
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-500 text-white border-0 gap-1 text-xs">
                        <Clock className="w-3 h-3" /> Chờ duyệt
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <p className="text-xs text-muted-foreground">
                      Bởi: <span className="font-semibold text-foreground">{photo.uploaderName}</span>
                    </p>
                    {photo.caption && (
                      <p className="text-sm line-clamp-2 text-muted-foreground flex-1">{photo.caption}</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(photo.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(photo.id)}
                        disabled={approvePhotoMutation.isPending || rejectPhotoMutation.isPending}
                      >
                        <Check className="w-3.5 h-3.5" /> Duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setDeletePhotoId(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                      >
                        <X className="w-3.5 h-3.5" /> Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Photos Tab */}
        <TabsContent value="photos">
          {isLoadingPhotos ? (
            <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-border/50">
              Đang tải ảnh...
            </div>
          ) : approvedPhotos.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-border/50">
              Không có bức ảnh nào đã được duyệt.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {approvedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="aspect-video relative bg-black/5">
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white border-0 gap-1 text-xs">
                        <CheckCircle className="w-3 h-3" /> Đã duyệt
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <p className="text-xs text-muted-foreground">
                      Bởi: <span className="font-semibold text-foreground">{photo.uploaderName}</span>
                    </p>
                    {photo.caption && (
                      <p className="text-sm line-clamp-2 text-muted-foreground flex-1">{photo.caption}</p>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                        onClick={() => handleReject(photo.id)}
                        disabled={rejectPhotoMutation.isPending || approvePhotoMutation.isPending}
                      >
                        <X className="w-3.5 h-3.5" /> Bỏ duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => setDeletePhotoId(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          {isLoadingMembers ? (
            <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-border/50">
              Đang tải danh sách...
            </div>
          ) : !members || members.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-white rounded-xl border border-border/50">
              Không có thành viên nào.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl border border-border/50 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">{member.username}</span>
                        <span className="text-xs text-muted-foreground">#{member.id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {member.isAdmin ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs">
                            <Shield className="w-3 h-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                            Thành viên
                          </Badge>
                        )}
                        {member.isBlocked ? (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <Ban className="w-3 h-3" /> Bị khóa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1 text-xs">
                            <CheckCircle className="w-3 h-3" /> Hoạt động
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(member.createdAt), "dd/MM/yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {member.photoCount} ảnh
                      </span>
                    </div>
                    {!member.isAdmin && (
                      <Button
                        variant={member.isBlocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => setBlockMemberId({ id: member.id, isBlocked: member.isBlocked })}
                        disabled={blockMutation.isPending || unblockMutation.isPending}
                        className="shrink-0"
                      >
                        {member.isBlocked ? "Mở khóa" : "Khóa"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog
        open={blockMemberId !== null}
        onOpenChange={(open) => !open && setBlockMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockMemberId?.isBlocked ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockMemberId?.isBlocked
                ? "Tài khoản này sẽ được mở khóa và có thể đăng nhập trở lại."
                : "Tài khoản này sẽ bị khóa. Người dùng sẽ bị đăng xuất và không thể đăng nhập lại."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleBlock}
              className={blockMemberId?.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {blockMemberId?.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Photo Confirmation Dialog */}
      <AlertDialog
        open={deletePhotoId !== null}
        onOpenChange={(open) => !open && setDeletePhotoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bức ảnh này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bức ảnh sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePhoto} className="bg-destructive hover:bg-destructive/90">
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
