// 📁 src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '첫 장', icon: '🏠' },
  { to: '/team', label: '내 팀', icon: '👥' },
  { to: '/quant', label: '수량화하다', icon: '📈' },
  { to: '/funding', label: '금율 지갑', icon: '💼' },
  { to: '/transactions', label: '내 거', icon: '🧾' },
];

function BottomNav() {
  return (
<div
  className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white flex justify-around items-center border-t border-gray-800 h-16 w-full max-w-[500px]"
>   {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-yellow-400' : 'text-gray-400'
            }`
          }
        >
          <div className="text-xl">{item.icon}</div>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default BottomNav; // ✅ 반드시 있어야 함
