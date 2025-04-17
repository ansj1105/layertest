import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminContentManager({ onLogout }) {
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const fetchContentFiles = async () => {
    const res = await axios.get("http://localhost:4000/api/content-files");
    setBanners(res.data.filter((f) => f.type === "banner"));
    setVideos(res.data.filter((f) => f.type === "video"));
  };

  useEffect(() => {
    fetchContentFiles();
  }, []);

  const upload = async (type) => {
    const formData = new FormData();
    if (type === "banner" && bannerFile) formData.append("banner", bannerFile);
    if (type === "video" && videoFile) formData.append("video", videoFile);

    await axios.post(`http://localhost:4000/api/upload/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setBannerFile(null);
    setVideoFile(null);
    fetchContentFiles();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <AdminNav onLogout={onLogout} />

      <h2 className="text-2xl font-bold mb-4">🎛 콘텐츠 업로드</h2>

      {/* 배너 업로드 */}
      <div>
        <h3 className="font-semibold">🖼 배너 이미지</h3>
        <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
        <button onClick={() => upload("banner")} className="ml-2 bg-blue-500 text-white px-4 py-1 rounded">업로드</button>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          {banners.map((b) => (
            <li key={b.id}>✔️ {b.file_path}</li>
          ))}
        </ul>
      </div>

      {/* 비디오 업로드 */}
      <div>
        <h3 className="font-semibold">🎥 동영상</h3>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        <button onClick={() => upload("video")} className="ml-2 bg-green-500 text-white px-4 py-1 rounded">업로드</button>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          {videos.map((v) => (
            <li key={v.id}>🎬 {v.file_path}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
