import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoWithPreview from './VideoWithPreview';
import AdvancedLoadingSpinner from './AdvancedLoadingSpinner';

const ContentListVideo = React.memo(() => {
    const API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get("/api/content-files");
                const files = res.data;
                const videoFile = files.find(f => f.type === 'video');
                setVideo(videoFile?.file_path || null);
            } catch (err) {
                console.error("❌ 비디오 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <AdvancedLoadingSpinner text="Loading video..." />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="content-wrapper">
                <p className="text-gray-400">업로드된 비디오가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            {/* 동영상: VideoWithPreview 컴포넌트 사용 */}
            <div className="w-full aspect-video">
                <VideoWithPreview
                    src={`${API_HOST}${video}`}
                />
            </div>
        </div>
    );
});

export default ContentListVideo; 