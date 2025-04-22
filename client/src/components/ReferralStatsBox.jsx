export default function ReferralStatsBox({ stats }) {
  if (!stats) {
    return (
      <div className="p-4 bg-gray-100 rounded shadow mb-6 text-center text-gray-500">
        📡 통계 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded shadow mb-6">
      <div>
        <h4 className="text-sm text-gray-600">총 팀 수익</h4>
        <p className="text-lg font-bold text-green-700">{stats.totalEarnings} USDT</p>
      </div>
      <div>
        <h4 className="text-sm text-gray-600">오늘 수입</h4>
        <p className="text-lg font-bold text-blue-700">{stats.todayEarnings} USDT</p>
      </div>
      <div>
        <h4 className="text-sm text-gray-600">총 팀원 수</h4>
        <p className="text-lg font-bold">{stats.totalMembers} 명</p>
      </div>
      <div>
        <h4 className="text-sm text-gray-600">오늘 가입 팀원</h4>
        <p className="text-lg font-bold">{stats.todayJoined} 명</p>
      </div>
    </div>
  );
}
