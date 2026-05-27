import { useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Image as ImageIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: stats, isLoading } = useGetStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#fffaf0] to-[#fdfbf7] py-20 lg:py-32">
        <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('/images/memories_1.jpg')", backgroundSize: "cover", backgroundPosition: "center", filter: "sepia(0.6) blur(4px)" }}></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 drop-shadow-sm">
              Kỷ Niệm Lớp 9A2
              <span className="block text-2xl md:text-3xl text-secondary mt-3 font-normal italic">Thanh Xuân Còn Mãi</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-10 font-medium">
              Có những khoảnh khắc, dù năm tháng qua đi, vẫn khắc sâu trong trái tim mỗi người. Tuổi học trò của chúng ta — những buổi sáng đến lớp còn ngái ngủ, những trận cười bất tận trên hành lang, những trang vở chi chít chữ và những ánh mắt lén nhìn nhau — tất cả đã trở thành một phần không thể thiếu trong câu chuyện cuộc đời. Lớp 9A2, dù bây giờ mỗi người một ngả, nhưng mái trường ấy, cái khoảnh sân đó, những người bạn này — mãi mãi là nhà.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/gallery">
                <Button size="lg" className="rounded-full px-8 gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Xem thư viện ảnh <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-white border-y border-border/40 shadow-sm relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40 text-center">
            <div className="px-4">
              <div className="flex items-center justify-center text-primary mb-2">
                <ImageIcon className="w-8 h-8 opacity-80" />
              </div>
              <div className="text-4xl font-serif font-bold text-foreground mb-1">
                {isLoading ? "-" : stats?.totalPhotos || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Khoảnh khắc</div>
            </div>
            <div className="px-4">
              <div className="flex items-center justify-center text-primary mb-2">
                <Users className="w-8 h-8 opacity-80" />
              </div>
              <div className="text-4xl font-serif font-bold text-foreground mb-1">
                {isLoading ? "-" : stats?.totalMembers || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Thành viên</div>
            </div>
            <div className="px-4 col-span-2 flex flex-col justify-center items-center">
              <h3 className="text-xl font-serif text-secondary mb-2">Bạn có nhớ?</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Mỗi bức ảnh là một mảnh ghép của thanh xuân không bao giờ phai nhạt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Photos Gallery */}
      <section className="w-full py-24 bg-[#fdfbf7]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Những Kỷ Niệm Gần Đây</h2>
            <div className="w-24 h-1 bg-primary/30 mx-auto rounded-full"></div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-muted/50 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-4">
              {stats?.recentPhotos?.length ? (
                stats.recentPhotos.map((photo, i) => (
                  <div 
                    key={photo.id} 
                    className="photo-frame animate-float-up"
                    style={{ 
                      '--rotation': `${i % 2 === 0 ? '-2deg' : '2deg'}`,
                      animationDelay: `${i * 150}ms`
                    } as React.CSSProperties}
                  >
                    <div className="aspect-square overflow-hidden mb-4 bg-muted/20">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || "Kỷ niệm lớp 9A2"} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    {photo.caption && (
                      <p className="text-center font-serif text-foreground/80 italic text-sm mb-2 px-2 line-clamp-2">
                        "{photo.caption}"
                      </p>
                    )}
                    <p className="text-center text-xs text-muted-foreground">
                      Đăng bởi <span className="font-medium">{photo.uploaderName}</span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Chưa có hình ảnh nào. Hãy là người đầu tiên chia sẻ kỷ niệm!</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-16">
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
                Khám phá toàn bộ album
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
