import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/bottomnav.css';

const navItems = [
  { to: '/', key: 'home', label: 'Home' },
  { to: '/team', key: 'team', label: 'My team' },
  { to: '/quant', key: 'quant', label: 'Quantify' },
  { to: '/funding', key: 'funding', label: 'Funding' },
  { to: '/myprofile', key: 'mine', label: 'Mine' },
];

export default function BottomNav() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidthPx, setItemWidthPx] = useState(0);
  const [offsetCorrectionPx, setOffsetCorrectionPx] = useState(0);

  const handleNavClick = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const calculateWidths = () => {
      const container = document.querySelector('.menu');
      const containerWidth = container ? container.offsetWidth : 398;
      const itemWidth = containerWidth / navItems.length;

      const isMobile = window.innerWidth <= 768;

      // ✅ 이동 거리와 보정 값 다르게 설정
      const mobileStep = itemWidth * 0.95;    // 모바일에서는 더 많이 이동
      const pcStep = itemWidth * 1.2;        // PC에서는 덜 이동
      const correction = isMobile ? itemWidth * 0.42 : itemWidth / 2; // 중앙 정렬 보정

      setItemWidthPx(isMobile ? mobileStep : pcStep);
      setOffsetCorrectionPx(correction);
    };

    calculateWidths();
    window.addEventListener('resize', calculateWidths);
    return () => window.removeEventListener('resize', calculateWidths);
  }, []);

  return (
    <div className="nav-body-b">
      <menu className="menu-b">
        {navItems.map(({ to, key, label }, index) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(index)}
            style={{ '--bgColorItem': '#206d7f' }}
          >
            {() => (
              <>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {renderIconPath(label)}
                </svg>
                <span className="menu__label">{t(`bottomNav.${key}`) || label}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* 움직이는 테두리 */}
        <div
          className="menu__border"
          style={{
            transform: `translateX(${activeIndex * itemWidthPx + offsetCorrectionPx}px)`
          }}
        />
      </menu>

      {/* SVG Border Shape */}
      <div className="svg-container">
        <svg viewBox="0 0 202.9 45.5">
          <clipPath
            id="menu"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.0049285362247413 0.021978021978022)"
          >
            <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3
                  c5-2.9,9.2-5.2,15.2-7c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3
                  c8.3,5.5,12.4,8.2,18.1,10.5c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
          </clipPath>
        </svg>
      </div>
    </div>
  );
}

function renderIconPath(label) {
  switch (label) {
    case 'Home':
      return (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </>
      );
    case 'My team':
      return (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'Quantify':
      return (
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      );
    case 'Funding':
      return (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      );
    case 'Mine':
      return (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      );
    default:
      return null;
  }
}
