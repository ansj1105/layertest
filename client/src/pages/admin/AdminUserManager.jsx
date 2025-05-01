import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav'; // ✅ 네비게이션 컴포넌트 import

export default function AdminUserManager({ onLogout }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get('http://54.85.128.211:4000/api/admin/users');
    setUsers(res.data);
  };

  const toggleStatus = async (id, currentStatus) => {
    await axios.patch(`http://54.85.128.211:4000/api/admin/users/${id}/status`, { is_active: !currentStatus });
    fetchUsers();
  };

  const toggleBlock = async (id, currentStatus) => {
    await axios.patch(`http://54.85.128.211:4000/api/admin/users/${id}/block`, { is_blocked: !currentStatus });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ 관리자 네비게이션 바 */}
      <AdminNav onLogout={onLogout} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">👥 사용자 관리</h1>
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
            {users.map(u => (
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
