import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPhotosQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function PhotoUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải ảnh lên");
      }

      toast({
        title: "Tải ảnh thành công",
        description: "Bức ảnh của bạn đã được thêm vào kỷ niệm.",
      });

      queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
      setOpen(false);
      clearFile();
      setCaption("");
    } catch (error) {
      toast({
        title: "Tải ảnh thất bại",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        clearFile();
        setCaption("");
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Đóng góp kỷ niệm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#fdfbf7]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Thêm kỷ niệm mới</DialogTitle>
          <DialogDescription>
            Chia sẻ những khoảnh khắc đáng nhớ của bạn với cả lớp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          {!file ? (
            <div 
              className="border-2 border-dashed border-primary/20 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <ImagePlus className="w-6 h-6" />
              </div>
              <p className="font-medium text-foreground mb-1">Nhấn để chọn ảnh</p>
              <p className="text-sm text-muted-foreground">Hỗ trợ JPG, PNG, WEBP</p>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <div className="relative group rounded-md overflow-hidden bg-black/5">
              <img 
                src={preview!} 
                alt="Preview" 
                className="w-full max-h-[300px] object-contain mx-auto" 
              />
              <button 
                onClick={clearFile}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {file && (
            <div className="space-y-2">
              <Label htmlFor="caption">Lời tựa (không bắt buộc)</Label>
              <Textarea 
                id="caption" 
                placeholder="Câu chuyện đằng sau bức ảnh này là gì?" 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="resize-none h-24 bg-white"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Hủy
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              "Đăng ảnh"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
