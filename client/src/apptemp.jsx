<div className="bg-black/60 text-white px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 shadow-md">
<div className="flex gap-4 flex-wrap justify-center text-sm md:text-base">
  <Link to="/" className="hover:underline">{t('Wallet')}</Link>
  <Link to="/balance" className="hover:underline">{t('Balance')}</Link>
  <Link to="/transfer" className="hover:underline">{t('Transfer')}</Link>
  <Link to="/transactions" className="hover:underline">{t('Transactions')}</Link>
  <Link to="/register" className="hover:underline">{t('Register')}</Link>
  {!user ? (
    <Link to="/login" className="hover:underline">{t('Login')}</Link>
  ) : (
    <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
  )}
</div>
<div className="text-sm space-x-2 mt-2 md:mt-0">
  🌐
  <button onClick={() => changeLang('ko')} className="hover:underline">한국어</button>
  <button onClick={() => changeLang('en')} className="hover:underline">EN</button>
</div>
</div>
    {/* ✅ 이미지 + 동영상 ContentList 섹션 */}
    <div className="flex justify-center items-center py-6 bg-black/30">
      <ContentList />
    </div>
{/* ✅ 상단 CoinList 섹션 */}
<div className="flex justify-center items-center p-6 backdrop-blur-md bg-black/40">
<CoinList />
</div>

{/* ✅ 메인 콘텐츠 (페이지 라우터) */}
<div className="flex-1 overflow-y-auto p-6 bg-white/80 text-black backdrop-blur-lg">
<Routes>
  <Route path="/" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
  <Route path="/balance" element={<ProtectedRoute><BalancePage /></ProtectedRoute>} />
  <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
  <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/login" element={<LoginPage />} />
    {/* 기존 경로들... */}
<Route path="/messages/notices" element={<SystemNotices />} />
<Route path="/messages/inbox" element={<PersonalMessages />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
</Routes>
</div>

/* ✅ 채팅 */
{user && <UserChat userId={user.id} />}
</div>
</Router>
);
}