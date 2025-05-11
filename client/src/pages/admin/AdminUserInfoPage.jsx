import AdminNav from '../../components/admin/AdminNav';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function AdminUserManager({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);

  const fetchUsers = async () => {
<<<<<<< HEAD
    const res = await axios.get('http://54.85.128.211:4000/api/admin/users');
=======
    const res = await axios.get('/api/admin/users');
>>>>>>> main
    setUsers(res.data);
  };

  const toggleStatus = async (id, currentStatus) => {
<<<<<<< HEAD
    await axios.patch(`http://54.85.128.211:4000/api/admin/users/${id}/status`, { is_active: !currentStatus });
=======
    await axios.patch(`/api/admin/users/${id}/status`, { is_active: !currentStatus });
>>>>>>> main
    fetchUsers();
  };

  const toggleBlock = async (id, currentStatus) => {
<<<<<<< HEAD
    await axios.patch(`http://54.85.128.211:4000/api/admin/users/${id}/block`, { is_blocked: !currentStatus });
=======
    await axios.patch(`/api/admin/users/${id}/block`, { is_blocked: !currentStatus });
>>>>>>> main
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (showInactiveOnly && u.is_active) return false;
    if (showBlockedOnly && !u.is_blocked) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">👥 사용자 관리</h1>

        {/* ✅ 필터 버튼 영역 */}
        <div className="mb-4 space-x-4">
          <button
            onClick={() => setShowInactiveOnly(!showInactiveOnly)}
            className={`px-4 py-2 rounded ${
              showInactiveOnly ? 'bg-yellow-500 text-white' : 'bg-gray-200'
            }`}
          >
            {showInactiveOnly ? '🔎 비활성만 보기 중' : '비활성 계정만 보기'}
          </button>

          <button
            onClick={() => setShowBlockedOnly(!showBlockedOnly)}
            className={`px-4 py-2 rounded ${
              showBlockedOnly ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
          >
            {showBlockedOnly ? '🔎 차단만 보기 중' : '차단 계정만 보기'}
          </button>
        </div>

        {/* ✅ 사용자 테이블 */}
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">이메일</th>
              <th className="p-2">가입일</th>
              <th className="p-2">활성</th>
              <th className="p-2">차단</th>
              <th className="p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="text-center border-t">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-2">{u.is_active ? '✅' : '❌'}</td>
                <td className="p-2">{u.is_blocked ? '⛔' : '✅'}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => toggleStatus(u.id, u.is_active)}
                  >
                    상태변경
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => toggleBlock(u.id, u.is_blocked)}
                  >
                    {u.is_blocked ? '차단 해제' : '차단'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
