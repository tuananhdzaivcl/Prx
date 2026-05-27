import { useState, useEffect } from "react";

interface AlbumCoverProps {
  onOpen: () => void;
}

export function AlbumCover({ onOpen }: AlbumCoverProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      setIsDone(true);
      onOpen();
    }, 1400);
  };

  return (
    <div className={`album-cover-scene ${isDone ? "hidden" : ""}`}>
      <div className="album-cover-bg" />
      <div className={`album-book-wrapper ${isOpening ? "opening" : ""}`}>
        {/* Book spine */}
        <div className="album-spine">
          <span className="album-spine-text">Kỷ Niệm</span>
        </div>

        {/* Book front cover */}
        <div
          className={`album-cover-front ${isOpening ? "open" : ""}`}
          onClick={handleOpen}
        >
          <div className="album-cover-inner">
            {/* Decorative photo grid on cover */}
            <div className="album-cover-photos">
              <div className="album-cover-photo photo-1" />
              <div className="album-cover-photo photo-2" />
              <div className="album-cover-photo photo-3" />
              <div className="album-cover-photo photo-4" />
            </div>

            <div className="album-cover-title">
              <div className="album-cover-year">2025 – 2026</div>
              <h1 className="album-cover-name">Kỷ Niệm<br />Lớp 9A2</h1>
              <div className="album-cover-subtitle">Thanh Xuân Còn Mãi</div>
              <div className={`album-cover-hint ${isOpening ? "opening-hint" : ""}`}>
                {isOpening ? "Đang mở album..." : "Chạm để mở"}
              </div>
            </div>

            {/* Corner decoration */}
            <div className="album-corner album-corner-tl" />
            <div className="album-corner album-corner-tr" />
            <div className="album-corner album-corner-bl" />
            <div className="album-corner album-corner-br" />
          </div>
        </div>

        {/* Book back/pages */}
        <div className="album-pages">
          <div className="album-page" />
          <div className="album-page" />
          <div className="album-page" />
        </div>
      </div>

      <p className="album-cover-tap-hint">
        {isOpening ? "" : "Nhấn vào album để xem kỷ niệm"}
      </p>
    </div>
  );
}
