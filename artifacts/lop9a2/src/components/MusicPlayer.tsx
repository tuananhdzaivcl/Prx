import { useState, useRef, useEffect } from "react";
import { Music, Pause, Play, VolumeX, Volume2, X } from "lucide-react";

const MUSIC_SRC = "/nu-cuoi-18-20.mp3";

export function MusicPlayer() {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(Array(20).fill(8));
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

    // Try immediate autoplay
    audio.play().then(() => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }).catch(() => {
      // Autoplay blocked by browser — wait for first user interaction
      setAutoplayBlocked(true);

      const handleInteraction = () => {
        if (hasInteracted.current) return;
        hasInteracted.current = true;
        audio.play().catch(() => {});
        document.removeEventListener("click", handleInteraction);
        document.removeEventListener("touchstart", handleInteraction);
        document.removeEventListener("keydown", handleInteraction);
      };

      document.addEventListener("click", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("keydown", handleInteraction);
    });

    return () => {
      audio.pause();
      audio.src = "";
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setBarHeights(Array(20).fill(0).map(() => Math.random() * 24 + 8));
        animFrameRef.current = setTimeout(animate, 130);
      };
      animate();
    } else {
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
      setBarHeights(Array(20).fill(8));
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0.5 : 0;
    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    audioRef.current?.pause();
    setIsVisible(false);
  };

  const handleOpen = () => {
    setIsVisible(true);
    audioRef.current?.play();
  };

  return (
    <>
      {!isVisible && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          title="Nghe nhạc kỷ niệm"
        >
          <Music className="w-6 h-6" />
        </button>
      )}

      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border border-border/50 p-4 w-72">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">Nụ Cười 18-20</p>
                <p className="text-xs text-muted-foreground">
                  {autoplayBlocked && !isPlaying ? "Nhấn bất kỳ đâu để phát" : "Doãn Hiếu"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visualizer bars */}
          <div className="flex items-end justify-center gap-0.5 h-10 mb-4 px-1">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${isPlaying ? "bg-primary" : "bg-muted"}`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={togglePlay}
              className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="w-6" />
          </div>
        </div>
      )}
    </>
  );
}
