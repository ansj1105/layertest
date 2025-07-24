// 📁 src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // AdminLogin.jsx
  const handleLogin = async () => {
    try {
      // ✅ 기존 세션 파괴
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      // ✅ 세션 파괴 완료 대기 (1초)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ✅ 관리자 로그인
      await axios.post("/api/auth/admin-login", form, { withCredentials: true });

      // ✅ 세션 저장 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ 강제 리로드로 대시보드 이동
      setTimeout(() => window.location.href = "/admin.html#/dashboard", 200);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">Admin Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        className="border px-4 py-2 rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="border px-4 py-2 rounded w-full"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
