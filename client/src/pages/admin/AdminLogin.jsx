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
    await axios.post("/api/auth/admin-login", form, { withCredentials: true });
    // 전체 페이지 리로드 → 세션 쿠키가 살아 있으므로 AdminApp이 admin 상태를 받아 옵니다
          // 2) 세션 정보 조회
          const res = await axios.get("/api/auth/admin/me");
          const user = res.data.user;
    window.location.href = "/admin.html#/dashboard";
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
