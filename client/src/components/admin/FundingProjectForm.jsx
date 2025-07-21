// 📁 src/components/admin/FundingProjectForm.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function FundingProjectForm({ project, onSaved }) {
  const isEdit = Boolean(project);

  const [form, setForm] = useState({
    name: "",
    description: "",
    minAmount: 0,
    maxAmount: 0,
    targetAmount: 0,
    dailyRate: 0,
    cycle: 1,
    startDate: "",
    endDate: "",
    minParticipants: 1,
    status: "open",
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description || "",
        minAmount: project.min_amount,
        maxAmount: project.max_amount,
        targetAmount: project.target_amount,
        dailyRate: project.daily_rate,
        cycle: project.cycle_days,
        startDate: project.start_date?.slice(0, 10) || "",
        endDate: project.end_date?.slice(0, 10) || "",
        minParticipants: project.min_participants,
        status: project.status,
      });
    }
  }, [project]);

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      // 1) 이름 검증
      if (!form.name.trim()) {
        alert("프로젝트 이름을 입력해주세요.");
        return;
      }

      // 2) 시작일이 오늘 이전인지 체크
      const todayStr = new Date().toISOString().slice(0, 10);
      if (form.startDate < todayStr) {
        alert("주의: 시작일이 오늘보다 이전인 프로젝트는 생성할 수 없습니다.");
        return;
      }

      // 3) 금액 검증
      if (form.minAmount <= 0 || form.maxAmount <= 0 || form.targetAmount <= 0) {
        alert("금액 관련 필드는 모두 0보다 큰 값을 입력해야 합니다.");
        return;
      }

      // 4) 날짜 입력 검증
      if (!form.startDate || !form.endDate) {
        alert("시작일과 마감일을 모두 선택해주세요.");
        return;
      }

      const payload = {
        name: form.name,
        description: form.description,
        minAmount: form.minAmount,
        maxAmount: form.maxAmount,
        targetAmount: form.targetAmount,
        dailyRate: form.dailyRate,
        cycle: form.cycle,
        startDate: form.startDate,
        endDate: form.endDate,
        minParticipants: form.minParticipants,
        status: form.status,
      };

      let res;
      if (isEdit) {
        res = await axios.put(
          `/api/wallet/projects/${project.id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          "/api/wallet/projects",
          payload,
          { withCredentials: true }
        );
      }

      alert(isEdit ? "프로젝트가 수정되었습니다." : "프로젝트가 생성되었습니다.");
      onSaved();
      window.location.reload();
    } catch (err) {
      console.error("프로젝트 저장 중 오류:", err);
      alert("프로젝트 저장 중 오류가 발생했습니다:\n" + (err.response?.data?.error || err.message));
    }
  };

  const labels = {
    name: "프로젝트 이름",
    description: "설명",
    minAmount: "최소 참여 금액",
    maxAmount: "최대 참여 금액",
    targetAmount: "목표 금액",
    dailyRate: "일일 수익률 (%)",
    cycle: "수익 기간 (일)",
    startDate: "시작일",
    endDate: "마감일",
    minParticipants: "최소 참여자 수",
    status: "상태",
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6 max-w-lg">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "프로젝트 수정" : "신규 프로젝트 생성"}
      </h2>

      {Object.entries(form).map(([key, value]) => {
        if (key === "description") {
          return (
            <div key={key} className="mb-4">
              <label className="block mb-1 font-medium">{labels[key]}</label>
              <textarea
                value={value}
                onChange={e => {
                  handleChange(key, e.target.value);
                  if (key === "description") {
                    console.log("입력값:", e.target.value, JSON.stringify(e.target.value));
                  }
                }}
                className="w-full border px-2 py-1 rounded h-24"
              />
            </div>
          );
        }
        if (key === "status") {
          return (
            <div key={key} className="mb-4">
              <label className="block mb-1 font-medium">{labels[key]}</label>
              <select
                value={value}
                onChange={e => handleChange(key, e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </div>
          );
        }
        const type =
          key.includes("Date") ? "date" :
            ["minAmount", "maxAmount", "targetAmount", "dailyRate", "cycle", "minParticipants"].includes(key)
              ? "number" : "text";

        return (
          <div key={key} className="mb-4">
            <label className="block mb-1 font-medium">{labels[key]}</label>
            <input
              type={type}
              value={value}
              onChange={e => handleChange(key, e.target.value)}
              className="w-full border px-2 py-1 rounded"
              min={type === "number" ? 0 : undefined}
            />
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        {isEdit ? "저장하기" : "프로젝트 생성하기"}
      </button>
    </div>
  );
}
