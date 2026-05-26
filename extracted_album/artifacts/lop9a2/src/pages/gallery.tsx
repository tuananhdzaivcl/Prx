import { useState, useRef, useEffect } from "react";
import {
  useListPhotos,
  useDeletePhoto,
  getListPhotosQueryKey,
} from "@workspace/api-client-react";
import { PhotoUploadDialog } from "@/components/PhotoUploadDialog";
import { useAuth } from "@/lib/AuthContext";
import { Image as ImageIcon, Calendar, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function PhotoCard({
  photo,
  index,
  isAdmin,
  onDelete,
  isDeleting,
}: {
  photo: {
    id: number;
    url: string;
    caption: string | null;
    uploaderName: string;
    createdAt: string;
  };
  index: number;
  isAdmin: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rotation =
    index % 3 === 0 ? -1.5 : index % 2 === 0 ? 1 : -0.5;

  return (
    <div
      ref={ref}
      className={`photo-frame group relative scroll-zoom-item ${visible ? "scroll-zoom-visible" : ""}`}
      style={{
        "--rotation": `${rotation}deg`,
        animationDelay: `${Math.min(index * 50, 500)}ms`,
        transitionDelay: `${Math.min(index * 30, 300)}ms`,
      } as React.CSSProperties}
    >
      <div className="aspect-[4/5] overflow-hidden mb-4 bg-black/5 relative">
        <img
          src={photo.url}
          alt={photo.caption || "Kỷ niệm lớp 9A2"}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {isAdmin && (
          <button
            onClick={() => onDelete(photo.id)}
            className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Xóa ảnh"
            disabled={isDeleting}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="px-1 flex flex-col h-full">
        {photo.caption && (
          <p className="font-serif text-foreground/90 italic text-sm mb-3 leading-snug">
            {photo.caption}
          </p>
        )}
        <div className="mt-auto pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70 truncate mr-2">
            {photo.uploaderName}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" />
            {format(new Date(photo.createdAt), "dd/MM/yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { data: photos, isLoading } = useListPhotos();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const deletePhotoMutation = useDeletePhoto();

  const confirmDelete = () => {
    if (deletePhotoId === null) return;
    deletePhotoMutation.mutate(
      { id: deletePhotoId },
      {
        onSuccess: () => {
          toast({ title: "Đã xóa ảnh" });
          queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
          setDeletePhotoId(null);
        },
        onError: () => {
          toast({ title: "Lỗi", description: "Không thể xóa ảnh.", variant: "destructive" });
          setDeletePhotoId(null);
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-3">Thư Viện Ảnh</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Nơi lưu giữ những khoảnh khắc quý giá nhất của tuổi học trò.
            Từng bức ảnh là một câu chuyện, một mảnh ghép của thanh xuân.
          </p>
        </div>

        {user && (
          <div className="shrink-0 flex flex-col items-end gap-2">
            <PhotoUploadDialog />
            {!user.isAdmin && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ảnh cần được admin duyệt trước khi hiển thị
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted/40 rounded-sm animate-pulse"></div>
          ))}
        </div>
      ) : photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={i}
              isAdmin={!!user?.isAdmin}
              onDelete={setDeletePhotoId}
              isDeleting={deletePhotoMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-xl border border-dashed border-border/60 shadow-sm">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/40">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif text-foreground mb-2">Cuốn album còn trống</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Chưa có khoảnh khắc nào được chia sẻ.
            {user
              ? " Hãy là người đầu tiên tải lên một kỷ niệm!"
              : " Hãy đăng nhập để đóng góp những bức ảnh của bạn."}
          </p>
          {user ? (
            <PhotoUploadDialog />
          ) : (
            <Button variant="outline" onClick={() => (window.location.href = "/login")}>
              Đăng nhập ngay
            </Button>
          )}
        </div>
      )}

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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
