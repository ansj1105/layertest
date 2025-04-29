// 📁 src/pages/FundingPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FundingPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    financeBalance: 0,
    todayProjectIncome: 0,
    totalProjectIncome: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChargeModal, setShowChargeModal] = useState(false);

  // 금융 지갑 요약 API 호출
  const fetchFinanceSummary = async () => {
    const res = await axios.get(
      "http://54.85.128.211:4000/api/wallet/finance-summary",
      { withCredentials: true }
    );
    // { success: true, data: { financeBalance, todayProjectIncome, totalProjectIncome } }
    return res.data.data;
  };

  // 펀딩 프로젝트 목록 API 호출
  const fetchProjects = async () => {
    const res = await axios.get(
      "http://54.85.128.211:4000/api/wallet/projects",
      { withCredentials: true }
    );
    // 응답이 [ { id, name, minAmount, maxAmount, dailyRate, cycle, startDate, endDate, … }, … ]
    return res.data;
  };

  // 처음 로드 시 요약+목록 병렬 호출
  useEffect(() => {
    const load = async () => {
      try {
        const [fin, projs] = await Promise.all([
          fetchFinanceSummary(),
          fetchProjects(),
        ]);
        setSummary(fin);
        setProjects(projs);
      } catch (err) {
        console.error("데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">로딩 중...</div>
    );
  }

  // 숫자 변환 및 기본값
  const financeBalance     = Number(summary.financeBalance)     || 0;
  const todayProjectIncome = Number(summary.todayProjectIncome) || 0;
  const totalProjectIncome = Number(summary.totalProjectIncome) || 0;

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* ─── 상단 헤더 ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-white text-xl">
          ←
        </button>
        <h2 className="text-lg font-semibold">재무 관리</h2>
        <button className="text-white text-xl">?</button>
      </div>

      {/* ─── 금융 지갑 카드 ─────────────────────────────── */}
      <div className="bg-[#3b2b15] rounded-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">금융 지갑 잔액</div>
            <div className="text-2xl font-bold">
              {financeBalance.toFixed(6)} USDT
            </div>
          </div>
          <button
            onClick={() => navigate("/wallet/detail")}
            className="px-3 py-1 border border-gray-600 rounded"
          >
            세부 &gt;
          </button>
        </div>

        <div className="flex justify-around mt-4 text-sm">
          <button className="px-4 py-1 border border-yellow-500 rounded">
            입금 신청
          </button>
          <button
            className="px-4 py-1 border border-yellow-500 rounded"
            onClick={() => navigate("/withdraw")}
          >
            출금 신청
          </button>
          <button
            className="px-4 py-1 border border-yellow-500 rounded"
            onClick={() => setShowChargeModal(true)}
          >
            재충전
          </button>
        </div>

        {showChargeModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1c1c1c] w-80 rounded-lg text-white p-4 relative">
              <h2 className="text-center text-lg font-bold mb-4">
                충전 방법
              </h2>
              <div
                className="flex items-center justify-between bg-[#333] px-4 py-3 rounded mb-2 cursor-pointer"
                onClick={() =>
                  alert("USDT 충전은 지정된 금융 지갑 주소로 송금해 주세요.")
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-300 font-bold">$</span> USDT
                </div>
                <span>&gt;</span>
              </div>
              <button
                onClick={() => setShowChargeModal(false)}
                className="absolute top-3 right-3 text-gray-400"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm mt-4 text-green-400">
          <div>
            <div className="text-gray-400">오늘 펀딩 수익</div>
            <div>{todayProjectIncome.toFixed(6)} USDT</div>
          </div>
          <div>
            <div className="text-gray-400">누적 펀딩 수익</div>
            <div>{totalProjectIncome.toFixed(6)} USDT</div>
          </div>
        </div>

        <button
          onClick={() => navigate("/wallet/orders")}
          className="w-full mt-4 bg-yellow-500 text-black py-2 rounded font-semibold"
        >
          전체 거래 내역
        </button>
      </div>

      {/* ─── 펀딩 프로젝트 목록 ──────────────────────────── */}
      <div className="space-y-4">
        {projects.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            현재 진행 중인 펀딩 프로젝트가 없습니다.
          </p>
        )}
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-[#3b2b15] rounded-md p-4"
          >
            <h3 className="text-lg font-bold mb-2">{proj.name}</h3>
            <p className="text-sm text-gray-300 mb-1">
              참여 가능: {proj.minAmount} ~ {proj.maxAmount} USDT
            </p>
            <p className="text-sm text-gray-300 mb-1">
              일일 수익률: {proj.dailyRate}%
            </p>
            <p className="text-sm text-gray-300 mb-4">
              기간: {proj.cycle}일 (
              ~{new Date(proj.endDate).toLocaleDateString()})
            </p>
            <button
              onClick={() => navigate(`/funding/${proj.id}`)}
              className="w-full bg-yellow-500 text-black py-2 rounded font-semibold"
            >
              신청하러 가기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
