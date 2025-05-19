import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

// 허용 확장자 목록
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
const VIDEO_EXTS = ['.mp4', '.mov'];
const PDF_EXTS = ['.pdf'];

export default function AdminContentManager({ onLogout }) {
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // 서버에서 현재 파일 목록 가져오기
  const fetchContentFiles = async () => {
    try {
      const res = await axios.get('/api/content-files');
      setBanners(res.data.filter(f => f.type === 'banner'));
      setVideos(res.data.filter(f => f.type === 'video'));
      setPdfs(res.data.filter(f => f.type === 'pdf'));
    } catch (err) {
      console.error('콘텐츠 로딩 실패', err);
    }
  };

  useEffect(() => {
    fetchContentFiles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/content-files/${id}`);
      fetchContentFiles();
    } catch {
      alert('삭제 실패');
    }
  };

  // 파일 확장자 검증
  const validateFile = (file, type) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (type === 'banner' && !IMAGE_EXTS.includes(ext)) {
      alert('올바르지 않은 이미지 파일 형식입니다. jpg, jpeg, png만 허용됩니다.');
      return false;
    }
    if (type === 'video' && !VIDEO_EXTS.includes(ext)) {
      alert('올바르지 않은 동영상 파일 형식입니다. mp4, mov만 허용됩니다.');
      return false;
    }
    if (type === 'pdf' && !PDF_EXTS.includes(ext)) {
      alert('올바르지 않은 PDF 파일 형식입니다. pdf만 허용됩니다.');
      return false;
    }
    return true;
  };

  // 업로드 전 유효성 검사 & 전송
  const upload = async (type) => {
    if (type === 'banner') {
      if (!bannerFile) {
        alert('업로드할 배너 이미지를 선택해주세요.');
        return;
      }
      if (!validateFile(bannerFile, 'banner')) {
        setBannerFile(null);
        return;
      }
      if (banners.length >= 4) {
        alert('배너는 최대 4개까지만 업로드 가능합니다.');
        return;
      }
    }
    if (type === 'video') {
      if (!videoFile) {
        alert('업로드할 동영상을 선택해주세요.');
        return;
      }
      if (!validateFile(videoFile, 'video')) {
        setVideoFile(null);
        return;
      }
      if (videos.length >= 1) {
        alert('동영상은 최대 1개까지만 업로드 가능합니다.');
        return;
      }
    }
    if (type === 'pdf') {
      if (!pdfFile) {
        alert('업로드할 PDF 파일을 선택해주세요.');
        return;
      }
      if (!validateFile(pdfFile, 'pdf')) {
        setPdfFile(null);
        return;
      }
      if (pdfs.length >= 1) {
        alert('PDF는 최대 1개까지만 업로드 가능합니다.');
        return;
      }
    }

    const formData = new FormData();
    if (type === 'banner') formData.append('banner', bannerFile);
    if (type === 'video') formData.append('video', videoFile);
    if (type === 'pdf') formData.append('pdf', pdfFile);

    try {
      await axios.post(`/api/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerFile(null);
      setVideoFile(null);
      setPdfFile(null);
      fetchContentFiles();
    } catch (err) {
      alert('업로드 실패');
      console.error(err);
    }
  };

  return (
    <div className="ml-64 min-h-screen bg-gray-100">
      <AdminNav onLogout={onLogout} />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">🎛 콘텐츠 업로드 관리</h2>

        {/* 배너 섹션 */}
        <section className="mb-12">
          <h3 className="font-semibold mb-2">🖼 배너 이미지 (최대 4개)</h3>
          <div className="flex items-center mb-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setBannerFile(file);
              }}
            />
            <span className="ml-4 text-sm text-gray-700">{bannerFile?.name || '선택된 파일 없음'}</span>
            <button
              onClick={() => upload('banner')}
              disabled={!bannerFile || banners.length >= 4}
              className="ml-4 bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            >
              업로드
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-4">
            {banners.length > 0 ? banners.map((b) => (
              <li key={b.id} className="flex flex-col items-center bg-white p-2 rounded shadow">
                <img
                  src={`http://localhost:4000${b.file_path}`}
                  alt="banner-thumb"
                  className="h-24 w-full object-cover rounded mb-2"
                />
                <span className="text-xs text-gray-600 mb-2">{b.file_path.split('/').pop()}</span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  삭제
                </button>
              </li>
            )) : (
              <p className="col-span-2 text-gray-500">등록된 배너가 없습니다.</p>
            )}
          </ul>
        </section>

        {/* 동영상 섹션 */}
        <section className="mb-12">
          <h3 className="font-semibold mb-2">🎥 동영상 (최대 1개)</h3>
          <div className="flex items-center mb-2">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setVideoFile(file);
              }}
            />
            <span className="ml-4 text-sm text-gray-700">{videoFile?.name || '선택된 파일 없음'}</span>
            <button
              onClick={() => upload('video')}
              disabled={!videoFile || videos.length >= 1}
              className="ml-4 bg-green-500 text-white px-4 py-1 rounded disabled:opacity-50"
            >
              업로드
            </button>
          </div>
          <div>
            {videos.length > 0 ? videos.map((v) => (
              <div key={v.id} className="mb-6 bg-white p-4 rounded shadow">
                <video
                  controls
                  className="w-full max-w-lg rounded mb-2"
                  src={`http://localhost:4000${v.file_path}`}
                />
                <span className="block text-xs text-gray-600 mb-2">{v.file_path.split('/').pop()}</span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  삭제
                </button>
              </div>
            )) : (
              <p className="text-gray-500">등록된 동영상이 없습니다.</p>
            )}
          </div>
        </section>

        {/* PDF 섹션 */}
        <section>
          <h3 className="font-semibold mb-2">📄 PDF 문서 백서등록 (최대 1개)</h3>
          <div className="flex items-center mb-2">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setPdfFile(file);
              }}
            />
            <span className="ml-4 text-sm text-gray-700">{pdfFile?.name || '선택된 파일 없음'}</span>
            <button
              onClick={() => upload('pdf')}
              disabled={!pdfFile || pdfs.length >= 1}
              className="ml-4 bg-purple-500 text-white px-4 py-1 rounded disabled:opacity-50"
            >
              업로드
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pdfs.length > 0 ? pdfs.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">PDF 문서</span>
                  <a
                    href={`http://localhost:4000${p.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    보기
                  </a>
                </div>
                <span className="block text-xs text-gray-600 mb-2">{p.file_path.split('/').pop()}</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  삭제
                </button>
              </div>
            )) : (
              <p className="text-gray-500">등록된 PDF가 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
