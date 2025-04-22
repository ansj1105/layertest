import AdminNav from '../../components/admin/AdminNav';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function AdminUserLevelPage({ onLogout }) {
  const [levels, setLevels] = useState([]);
  const [editedLevels, setEditedLevels] = useState({});

  const fetchLevels = async () => {
    const res = await axios.get("http://localhost:4000/api/admin/vip-levels");
    setLevels(res.data.data);
  };

  const handleChange = (level, field, value) => {
    setEditedLevels(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value
      }
    }));
  };

  const saveChanges = async (level) => {
    const updateData = editedLevels[level];
    if (!updateData) return;

    await axios.put(`http://localhost:4000/api/admin/vip-levels/${level}`, updateData);
    await fetchLevels();
    setEditedLevels(prev => {
      const newData = { ...prev };
      delete newData[level];
      return newData;
    });
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">레벨업 시스템 관리</h2>
        <table className="w-full bg-white shadow text-sm">
          <thead className="bg-green-100">
            <tr>
              <th className="p-2">레벨</th>
              <th className="p-2">일일 거래</th>
              <th className="p-2">수수료 (%)</th>
              <th className="p-2">최대 투자</th>
              <th className="p-2">최대 수수료</th>
              <th className="p-2">최소 보유</th>
              <th className="p-2">발기인 A/B/C</th>
              <th className="p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => {
              const edit = editedLevels[l.level] || {};
              return (
                <tr key={l.level} className="text-center border-t">
                  <td>{l.level}</td>
                  <td>
                    <input
                      type="number"
                      className="border p-1 w-14"
                      defaultValue={l.daily_trade_limit}
                      onChange={(e) => handleChange(l.level, 'daily_trade_limit', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="border p-1 w-20"
                      defaultValue={`${l.commission_min}~${l.commission_max}`}
                      onChange={(e) => {
                        const [min, max] = e.target.value.split('~').map(Number);
                        handleChange(l.level, 'commission_min', min);
                        handleChange(l.level, 'commission_max', max);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="border p-1 w-28"
                      defaultValue={l.max_investment}
                      onChange={(e) => handleChange(l.level, 'max_investment', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="border p-1 w-20"
                      defaultValue={l.daily_commission_max}
                      onChange={(e) => handleChange(l.level, 'daily_commission_max', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="border p-1 w-28"
                      defaultValue={l.min_holdings}
                      onChange={(e) => handleChange(l.level, 'min_holdings', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="border p-1 w-20"
                      defaultValue={`${l.min_A}/${l.min_B}/${l.min_C}`}
                      onChange={(e) => {
                        const [a, b, c] = e.target.value.split('/').map(Number);
                        handleChange(l.level, 'min_A', a);
                        handleChange(l.level, 'min_B', b);
                        handleChange(l.level, 'min_C', c);
                      }}
                    />
                  </td>
                  <td>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => saveChanges(l.level)}
                    >
                      저장
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
