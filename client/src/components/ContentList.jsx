import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

export default function ContentList() {
  const [banners, setBanners] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="w-full max-w-4xl space-y-8 text-white text-center">
      {noContent ? (
        <p className="text-gray-400">업로드된 파일이 없습니다.</p>
      ) : (
        <>
          {/* 배너 슬라이더 */}
          {banners.length > 0 && (
            <Slider dots autoplay autoplaySpeed={3000} infinite>
              {banners.map((banner, idx) => (
                <div key={idx}>
                  <img
                    src={`http://54.85.128.211:4000${banner.file_path}`}
                    alt={`banner-${idx}`}
                    className="w-full h-64 object-cover rounded"
                  />
                </div>
              ))}
            </Slider>
          )}

          {/* 동영상 */}
          {video && (
            <div className="w-full aspect-video">
              <video controls className="w-full h-full rounded shadow">
                <source src={`http://54.85.128.211:4000${video}`} type="video/mp4" />
                브라우저가 video 태그를 지원하지 않습니다.
              </video>
            </div>
          )}
        </>
      )}
    </div>
  );
}
