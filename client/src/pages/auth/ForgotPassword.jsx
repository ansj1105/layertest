import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setResult(`토큰: ${res.data.token}`); // 실제 서비스라면 링크로 전송
    } catch (err) {
      setResult(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">비밀번호 찾기</h2>
      <input
        type="email"
        placeholder="가입한 이메일"
        className="border px-3 py-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">토큰 요청</button>
      {result && <p>{result}</p>}
    </div>
  );
}
