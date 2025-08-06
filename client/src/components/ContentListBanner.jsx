import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import AdvancedLoadingSpinner from './AdvancedLoadingSpinner';
import '../styles/ContentListBanner.css';

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
            <div className="banner-loading">
                <AdvancedLoadingSpinner text="Loading banners..." />
            </div>
        );
    }

    if (!banners || banners.length === 0) {
        return (
            <div className="banner-empty">
                <p>업로드된 배너가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            {/* 배너 슬라이더: 반응형 높이 설정 */}
            <div className="banner-container">
                <Slider
                    dots
                    infinite
                    autoplay
                    autoplaySpeed={3000}
                    arrows={false} // 화살표 제거
                    // 슬라이드가 바뀔 때마다 호출
                    afterChange={idx => setCurrentSlide(idx)}
                    // 각 dot 렌더링 (작은 크기)
                    customPaging={i => (
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${currentSlide === i ? 'bg-white' : 'bg-gray-400'}`}
                        />
                    )}
                    // dots를 이미지 하단에 절대 위치
                    appendDots={dots => (
                        <div>
                            <ul className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
                                {dots}
                            </ul>
                        </div>
                    )}
                    // 반응형 설정 추가
                    responsive={[
                        {
                            breakpoint: 1024,
                            settings: {
                                dots: true,
                                infinite: true,
                                autoplay: true,
                                autoplaySpeed: 3000,
                                arrows: false
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                dots: true,
                                infinite: true,
                                autoplay: true,
                                autoplaySpeed: 3000,
                                arrows: false
                            }
                        },
                        {
                            breakpoint: 480,
                            settings: {
                                dots: true,
                                infinite: true,
                                autoplay: true,
                                autoplaySpeed: 3000,
                                arrows: false
                            }
                        }
                    ]}
                >
                    {banners.map((banner, idx) => (
                        <div key={idx} className="h-[120px] sm:h-[150px] md:h-[170px] lg:h-[200px] overflow-hidden rounded">
                            <img
                                src={`${API_HOST}${banner.file_path}`}
                                alt={`banner-${idx}`}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
});

export default ContentListBanner; 