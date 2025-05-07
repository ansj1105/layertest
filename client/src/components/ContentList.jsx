import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import VideoWithPreview from './VideoWithPreview';

export default function ContentList() {
  const [banners, setBanners] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  // ← 현재 슬라이드 인덱스
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("http://54.85.128.211:4000/api/content-files");
        const files = res.data;
        setBanners(files.filter(f => f.type === 'banner'));
        const videoFile = files.find(f => f.type === 'video');
        setVideo(videoFile?.file_path || null);
      } catch (err) {
        console.error("❌ 콘텐츠 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) return <p className="text-white text-center">불러오는 중...</p>;

  const noContent = banners.length === 0 && !video;

  return (
    <div className="w-full max-w-4xl mx-auto text-white text-center space-y-8">
      {noContent ? (
        <p className="text-gray-400">업로드된 파일이 없습니다.</p>
      ) : (
        <>
          {/* 배너 슬라이더: h-[170px] 컨테이너 안에서 이미지를 object-cover */}
          {banners.length > 0 && (
            <div className="relative w-full h-[170px] rounded overflow-visible">
            <Slider
              dots
              infinite
              autoplay
              autoplaySpeed={3000}
              // ← 슬라이드가 바뀔 때마다 호출
              afterChange={idx => setCurrentSlide(idx)}
              // ← 각 dot 렌더링
              customPaging={i => (
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === i ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              )}
              // ← dots를 이미지 위에 절대 위치
              appendDots={dots => (
                <div>
                  <ul className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                    {dots}
                  </ul>
                </div>
              )}
            >
              {banners.map((banner, idx) => (
                <div key={idx} className="h-[170px] overflow-hidden rounded">
                  <img
                    src={`http://54.85.128.211:4000${banner.file_path}`}
                    alt={`banner-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>
        )}

          {/* 동영상: VideoWithPreview 컴포넌트 사용 */}
          {video && (
            <div className="w-full aspect-video">
              <VideoWithPreview
                src={`http://54.85.128.211:4000${video}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
