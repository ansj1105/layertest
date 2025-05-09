// 📁 src/components/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Lucide icons
import { Home, Users, BarChart2, Briefcase, FileText } from 'lucide-react';

const navItems = [
  { to: '/',          key: 'bottomNav.home',    icon: Home      },
  { to: '/team',      key: 'bottomNav.team',    icon: Users     },
  { to: '/quant',     key: 'bottomNav.quant',   icon: BarChart2 },
  { to: '/funding',   key: 'bottomNav.funding', icon: Briefcase },
  { to: '/myprofile', key: 'bottomNav.mine',    icon: FileText  },
];

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  // 현재 경로가 basePath 또는 그 하위 경로인지 확인
  const isActivePath = (basePath) => {
    if (basePath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(basePath);
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[500px] h-16 bg-black flex overflow-visible">
      {navItems.map(({ to, key, icon: Icon }) => {
        const isActive = isActivePath(to);
        return (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex items-center justify-center overflow-visible"
          >
            <div className="relative flex flex-col items-center pt-0 overflow-visible">
              {/* active bump */}
              {isActive && (
                <div className="absolute -top-3 w-14 h-8 -z-10 bg-black rounded-t-full" />
              )}

              {/* active icon background */}
              <div className={`${isActive ? 'bg-[#1F6D79]' : ''} rounded-full p-2`}>
                <Icon size={24} className={isActive ? 'text-white' : 'text-gray-400'} />
              </div>

              {/* label */}
              <span className={`mt-0 text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {t(key)}
              </span>
            </div>
          </NavLink>
        );
      })}
    </div>
  );
}
