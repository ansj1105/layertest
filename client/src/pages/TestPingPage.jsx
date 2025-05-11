import React, { useState } from 'react';
import axios from 'axios';

export default function TestPingPage() {
  const [localRes, setLocalRes] = useState("");
  const [serverRes, setServerRes] = useState("");

  const handleLocalPing = async () => {
    try {
<<<<<<< HEAD
      const res = await axios.get("http://54.85.128.211:4000/api/ping", {
=======
      const res = await axios.get("/api/ping", {
>>>>>>> main
        withCredentials: true,  
      });
      setLocalRes(res.data.message);
    } catch (err) {
      setLocalRes("❌ 요청 실패");
      console.error("Local 요청 에러:", err);
    }
  };

  const handleServerPing = async () => {
    try {
<<<<<<< HEAD
      const res = await axios.get(`http://54.85.128.211:4000/api/ping`, {
=======
      const res = await axios.get(`/api/ping`, {
>>>>>>> main
        withCredentials: true,
      });
      setServerRes(res.data.message);
    } catch (err) {
      setServerRes("❌ 요청 실패");
      console.error("Server 요청 에러:", err);
    }
  };

  return (
    <div className="text-center mt-10 space-y-6">
      <h1 className="text-2xl font-bold mb-4">API Ping 테스트</h1>

      <div className="space-y-2">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleLocalPing}
        >
          localhost:4000에 Ping
        </button>
        <p className="text-lg">{localRes}</p>
      </div>

      <div className="space-y-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleServerPing}
        >
          54.85.128.211:4000에 Ping
        </button>
        <p className="text-lg">{serverRes}</p>
      </div>
    </div>
  );
}
