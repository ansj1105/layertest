import { useState } from 'react';
import axios from 'axios';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState('');

  const handleReset = async () => {
    try {
      const res = await axios.post("http://54.85.128.211:4000/api/auth/reset-password", { token, newPassword });
      setResult(res.data.message);
    } catch (err) {
      setResult(err.response?.data?.error || "실패");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">비밀번호 재설정</h2>
      <input
        type="text"
        placeholder="토큰"
        className="border px-3 py-2 w-full"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input
        type="password"
        placeholder="새 비밀번호"
        className="border px-3 py-2 w-full"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset} className="bg-green-600 text-white px-4 py-2 rounded">변경</button>
      {result && <p>{result}</p>}
    </div>
  );
}
