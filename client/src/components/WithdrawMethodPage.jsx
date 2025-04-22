// 출금 세부 정보 입력
export default function WithdrawMethodPage() {
    return (
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">USDT 출금</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm">출금 주소</label>
            <input className="w-full p-2 bg-[#2f1f10] rounded text-white" />
          </div>
          <div>
            <label className="block text-sm">출금 수량</label>
            <input className="w-full p-2 bg-[#2f1f10] rounded text-white" />
          </div>
          <button className="w-full py-2 bg-yellow-500 text-black rounded">제출</button>
        </div>
      </div>
    );
  }
  