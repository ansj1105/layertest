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
      const pcStep = itemWidth * 0.99;        // PC에서는 덜 이동
      const correction = isMobile ? itemWidth * 0.42 : itemWidth / 2; // 중앙 정렬 보정

      setItemWidthPx(isMobile ? mobileStep : pcStep);
      setOffsetCorrectionPx(correction);
    };

    calculateWidths();
    window.addEventListener('resize', calculateWidths);
    return () => window.removeEventListener('resize', calculateWidths);
  }, []);

  return (
    <div className="nav-body">
      <menu className="menu">
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
          <path d="M3.8,6.6h16.4" />
          <path d="M20.2,12.1H3.8" />
          <path d="M3.8,17.5h16.4" />
        </>
      );
    case 'My team':
      return (
        <>
          <path d="M6.7,4.8h10.7c0.3,0,0.6,0.2,0.7,0.5l2.8,7.3c0,0.1,0,0.2,0,0.3v5.6c0,0.4-0.4,0.8-0.8,0.8H3.8
              C3.4,19.3,3,19,3,18.5v-5.6c0-0.1,0-0.2,0.1-0.3L6,5.3C6.1,5,6.4,4.8,6.7,4.8z" />
          <path d="M3.4,12.9H8l1.6,2.8h4.9l1.5-2.8h4.6" />
        </>
      );
    case 'Quantify':
      return (
        <>
          <path d="M3.4,11.9l8.8,4.4l8.4-4.4" />
          <path d="M3.4,16.2l8.8,4.5l8.4-4.5" />
          <path d="M3.7,7.8l8.6-4.5l8,4.5l-8,4.3L3.7,7.8z" />
        </>
      );
    case 'Funding':
      return (
        <>
          <path d="M5.1,3.9h13.9c0.6,0,1.2,0.5,1.2,1.2v13.9c0,0.6-0.5,1.2-1.2,1.2H5.1c-0.6,0-1.2-0.5-1.2-1.2V5.1
            C3.9,4.4,4.4,3.9,5.1,3.9z" />
          <path d="M4.2,9.3h15.6" />
          <path d="M9.1,9.5v10.3" />
        </>
      );
    case 'Mine':
      return (
        <>
          <path d="M5.1,3.9h13.9c0.6,0,1.2,0.5,1.2,1.2v13.9c0,0.6-0.5,1.2-1.2,1.2H5.1c-0.6,0-1.2-0.5-1.2-1.2V5.1
            C3.9,4.4,4.4,3.9,5.1,3.9z" />
          <path d="M5.5,20l9.9-9.9l4.7,4.7" />
          <path d="M10.4,8.8c0,0.9-0.7,1.6-1.6,1.6c-0.9,0-1.6-0.7-1.6-1.6C7.3,8,8,7.3,8.9,7.3C9.7,7.3,10.4,8,10.4,8.8z" />
        </>
      );
    default:
      return null;
  }
}
