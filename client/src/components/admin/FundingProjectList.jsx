// 📁 src/components/admin/FundingProjectList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import FundingProjectForm from "./FundingProjectForm";

export default function FundingProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    const url = "http://localhost:4000/api/wallet/projects";
    console.log("[DEBUG] 요청 URL:", url);
    try {
      const res = await axios.get(url, { withCredentials: true });
      console.log("[DEBUG] 응답 데이터:", res.data);
      setProjects(res.data);
    } catch (err) {
      console.error("프로젝트 목록 불러오기 실패:", err);
      if (err.response) {
        console.log("[DEBUG] err.response.status:", err.response.status);
        console.log("[DEBUG] err.response.data:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    const url = `http://localhost:4000/api/wallet/projects/${id}`;
    console.log("[DEBUG] DELETE 요청 URL:", url);
    try {
      await axios.delete(url, { withCredentials: true });
      fetchProjects();
    } catch (err) {
      console.error("프로젝트 삭제 실패:", err);
      if (err.response) {
        console.log("[DEBUG] err.response.status:", err.response.status);
        console.log("[DEBUG] err.response.data:", err.response.data);
      }
    }
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setEditing(true);
  };

  const handleSaved = () => {
    setEditing(false);
    setSelectedProject(null);
    fetchProjects();
  };

  if (loading) {
    return <p className="text-center p-4">로딩 중...</p>;
  }

  return (
    <div className="p-4">
      {editing && (
        <div className="mb-6">
          <FundingProjectForm
            project={selectedProject}
            onSaved={handleSaved}
          />
          <button
            onClick={() => { setEditing(false); setSelectedProject(null); }}
            className="mt-2 text-sm text-gray-500 hover:underline"
          >
            ✕ 편집 취소
          </button>
        </div>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
              <p className="text-sm">최소 참여 금액: <strong>{p.minAmount}</strong> USDT</p>
              <p className="text-sm">최대 참여 금액: <strong>{p.maxAmount}</strong> USDT</p>
              <p className="text-sm">목표 금액: <strong>{p.targetAmount}</strong> USDT</p>
              <p className="text-sm">일일 수익률: <strong>{p.dailyRate}%</strong></p>
              <p className="text-sm">기간: <strong>{p.cycle}일</strong></p>
              <p className="text-sm">
                시작일: <strong>{new Date(p.startDate).toLocaleDateString()}</strong>
              </p>
              <p className="text-sm">
                마감일: <strong>{new Date(p.endDate).toLocaleDateString()}</strong>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleEditClick(p)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-center text-gray-500">등록된 펀딩 프로젝트가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
