import React, { useEffect, useRef, useState } from 'react';

export default function VideoWithPreview({ src }) {
  const videoRef = useRef(null);
  const [thumb, setThumb] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // 1) 메타데이터 로드 후 0.5초 위치로 이동
    const onLoadedMetadata = () => {
      vid.currentTime = 0.5;
    };

    // 2) 0.5초 프레임 로드가 완료되면 썸네일 캡처
    const onSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL());
      vid.pause();
    };

    vid.preload = 'metadata';
    vid.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    vid.addEventListener('seeked', onSeeked, { once: true });
    vid.load();

    return () => {
      vid.removeEventListener('loadedmetadata', onLoadedMetadata);
      vid.removeEventListener('seeked', onSeeked);
    };
  }, [src]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="relative w-full aspect-video">
      {/* 재생 전 커스텀 오버레이: 썸네일이 없어도 보여줌 */}
      {!playing && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 cursor-pointer rounded"
          onClick={handlePlay}
        >
          <svg
            className="w-16 h-16 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      <video
        ref={videoRef}
        poster={thumb || undefined}
        controls={playing}
        className="w-full h-full object-cover rounded shadow"
      >
        <source src={src} type="video/mp4" />
        브라우저가 video 태그를 지원하지 않습니다.
      </video>
    </div>
  );
}
