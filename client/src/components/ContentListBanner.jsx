import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import AdvancedLoadingSpinner from './AdvancedLoadingSpinner';

const ContentListBanner = React.memo(() => {
    const API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get("/api/content-files");
                const files = res.data;
                setBanners(files.filter(f => f.type === 'banner'));
            } catch (err) {
                console.error("❌ 배너 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <AdvancedLoadingSpinner text="Loading banners..." />
            </div>
        );
    }

    if (!banners || banners.length === 0) {
        return (
            <div className="content-wrapper">
                <p className="text-gray-400">업로드된 배너가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            {/* 배너 슬라이더: h-[170px] 컨테이너 안에서 이미지를 object-cover */}
            <div className="relative w-full h-[170px] rounded overflow-visible">
                <Slider
                    dots
                    infinite
                    autoplay
                    autoplaySpeed={3000}
                    // 슬라이드가 바뀔 때마다 호출
                    afterChange={idx => setCurrentSlide(idx)}
                    // 각 dot 렌더링
                    customPaging={i => (
                        <div
                            className={`w-2 h-2 rounded-full ${currentSlide === i ? 'bg-white' : 'bg-gray-400'}`}
                        />
                    )}
                    // dots를 이미지 위에 절대 위치
                    appendDots={dots => (
                        <div>
                            <ul className="absolute bottom-6 left-0 right-0 flex justify-center space-x-0">
                                {dots}
                            </ul>
                        </div>
                    )}
                >
                    {banners.map((banner, idx) => (
                        <div key={idx} className="h-[170px] overflow-hidden rounded">
                            <img
                                src={`${API_HOST}${banner.file_path}`}
                                alt={`banner-${idx}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
});

export default ContentListBanner; 