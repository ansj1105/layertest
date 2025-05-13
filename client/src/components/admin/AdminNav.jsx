import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminNav({ onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuantMenuOpen, setIsQuantMenuOpen] = useState(false);
  const [isRewardMenuOpen, setIsRewardMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isTokenMenuOpen, setIsTokenMenuOpen] = useState(false); // 토큰 메뉴
  const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev);
  const toggleQuantMenu = () => setIsQuantMenuOpen(prev => !prev);
  const toggleRewardMenu = () => setIsRewardMenuOpen(prev => !prev);
  const toggleWalletMenu = () => setIsWalletMenuOpen(prev => !prev);

  return (
    <div className="w-64 h-screen p-4 bg-green-100 border-r-2 border-green-300 fixed top-0 left-0 overflow-y-auto">
      <div className="mb-4 space-y-2">
        <Link
          to="/chat"
          className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          💬 채팅 관리
        </Link>
        <Link
          to="/dashboard"
          className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          📊 대시보드
        </Link>
        <Link
          to="/content"
          className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          🖼️ 콘텐츠 관리
        </Link>

        {/* 사용자 관리 */}
        <div>
          <button
            onClick={toggleUserMenu}
            className="w-full text-left bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            👤 사용자 관리 {isUserMenuOpen ? '▲' : '▼'}
          </button>
          {isUserMenuOpen && (
            <div className="bg-green-200 border-t mt-1">
              <Link to="/users/info" className="block px-4 py-2 hover:bg-green-300">
                사용자 정보 조회 및 수정
              </Link>
              <Link to="/users/level" className="block px-4 py-2 hover:bg-green-300 border-t">
                레벨업 시스템 관리
              </Link>
              <Link to="/users/referral" className="block px-4 py-2 hover:bg-green-300 border-t">
                초대 및 레퍼럴 시스템 관리
              </Link>
            </div>
          )}
        </div>

        {/* 양적거래 관리 */}
        <div>
          <button
            onClick={toggleQuantMenu}
            className="w-full text-left bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            ⚙️ 거래 관리 {isQuantMenuOpen ? '▲' : '▼'}
          </button>
          {isQuantMenuOpen && (
            <div className="bg-orange-100 border-t mt-1">
              <Link to="/quantpage" className="block px-4 py-2 hover:bg-orange-200">
                🔄 리워드 시스템
              </Link>
              <Link to="/quantrank" className="block px-4 py-2 hover:bg-orange-200 border-t">
                📈 팀 리더보드
              </Link>
              <Link to="/wallet-admin" className="block px-4 py-2 hover:bg-orange-200 border-t">
                💼 재무 관리
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/popup"
          className="block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-2"
        >
          📢 팝업 알림 관리
        </Link>
 {/* 토큰 관리 메뉴 */}
 <div className="mt-4">
        <button
          onClick={() => setIsTokenMenuOpen(open => !open)}
          className="w-full text-left bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          🔗 토큰 관리 {isTokenMenuOpen ? "▲" : "▼"}
        </button>
        {isTokenMenuOpen && (
          <div className="bg-yellow-100 border-t mt-1">
            <Link
              to="/token"
              className="block px-4 py-2 hover:bg-yellow-200"
            >
              토큰
            </Link>
            <Link
              to="/tokensales"
              className="block px-4 py-2 hover:bg-yellow-200 border-t"
            >
              토큰 판매 관리
            </Link>
            <Link
              to="/tokenlogs"
              className="block px-4 py-2 hover:bg-yellow-200 border-t"
            >
              토큰 구매/환매 내역
            </Link>
          </div>
        )}
      </div>
        {/* 보상센터 메뉴 */}
        <div>
          <button
            onClick={toggleRewardMenu}
            className="w-full text-left bg-pink-300 text-white px-4 py-2 rounded hover:bg-pink-400"
          >
            🎁 보상센터 {isRewardMenuOpen ? '▲' : '▼'}
          </button>
          {isRewardMenuOpen && (
            <div className="bg-pink-100 border-t">
              <Link to="/invite-rewards" className="block px-4 py-2 hover:bg-pink-200">
                🔗 초대 보상 관리
              </Link>
              <Link to="/admin-rewards" className="block px-4 py-2 hover:bg-pink-200 border-t">
                🙋 가입 보상 관리
              </Link>
            </div>
          )}
        </div>

        {/* 지갑 관리 메뉴 */}
        <div>
          <button
            onClick={toggleWalletMenu}
            className="w-full text-left bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
          >
            💼 지갑 관리 {isWalletMenuOpen ? '▲' : '▼'}
          </button>
          {isWalletMenuOpen && (
            <div className="bg-green-200 border-t">
              <Link to="/wallet-deposits" className="block px-4 py-2 hover:bg-green-300">
                입금 관리
              </Link>
             <Link to="/wallet-withdraw" className="block px-4 py-2 hover:bg-green-300">
                출금 관리
              </Link>
              <Link to="/wallet-withdrawals" className="block px-4 py-2 hover:bg-green-300 border-t">
                지갑 관리
              </Link>
              <Link to="/wallet-settings" className="block px-4 py-2 hover:bg-green-300 border-t">
                출입금 수수료 설정
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4"
        >
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
}