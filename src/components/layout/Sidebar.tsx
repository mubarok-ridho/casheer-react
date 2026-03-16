import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconDashboard = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const IconKasir = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    {active && <rect x="6" y="7" width="4" height="3" rx="0.5" fill="currentColor" stroke="none" />}
    {active && <rect x="14" y="7" width="4" height="3" rx="0.5" fill="currentColor" stroke="none" />}
    {!active && <rect x="6" y="7" width="4" height="3" rx="0.5" />}
    {!active && <rect x="14" y="7" width="4" height="3" rx="0.5" />}
  </svg>
);
const IconMenu = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);
const IconReport = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    {active && <><rect x="4.5" y="12.5" width="3" height="8" rx="0.5" fill="currentColor" stroke="none" /><rect x="10.5" y="2.5" width="3" height="18" rx="0.5" fill="currentColor" stroke="none" /><rect x="16.5" y="8.5" width="3" height="12" rx="0.5" fill="currentColor" stroke="none" /></>}
  </svg>
);
const IconSettings = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconHistory = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconAdmin = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1l3.22 6.636L22 8.955l-5 4.918 1.18 6.943L12 17.77l-6.18 3.046L7 13.873 2 8.955l6.78-1.319z" />
  </svg>
);

// ── Logo images ────────────────────────────────────────────────────────────────
const LOGO_ICON = "https://res.cloudinary.com/doafwrddd/image/upload/v1772867262/modulog_fc2q8c.png";
const LOGO_TEXT = "https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png";

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  cream: '#f4f0e8',
};

const navItems = [
  { name: 'Dashboard', href: '/dashboard', Icon: IconDashboard, adminOnly: false },
  { name: 'Kasir', href: '/order', Icon: IconKasir, adminOnly: false },
  { name: 'Menu', href: '/menu', Icon: IconMenu, adminOnly: false },
  { name: 'Laporan', href: '/reports', Icon: IconReport, adminOnly: true },
  { name: 'Riwayat', href: '/history', Icon: IconHistory, adminOnly: false },
  { name: 'Pengaturan', href: '/settings', Icon: IconSettings, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { isAdmin, tenant, user, logout } = useAuth();
  const location = useLocation();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const visible = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside style={{
      width: '232px', minHeight: 'calc(100vh - 0px)',
      background: 'white', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${C.border}`,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        {/* <img src={LOGO_ICON} alt="MODU" style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} /> */}
        <img src={LOGO_TEXT} alt="MODU" style={{ height: '18px', objectFit: 'contain' }} />
      </div>

      {/* ── Store info ── */}
      <div style={{
        margin: '12px 12px 4px',
        background: 'linear-gradient(135deg, #3d5e3c, #5B8C5A)',
        borderRadius: '12px', padding: '12px 14px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Toko Aktif
        </p>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tenant?.store_name || tenant?.name || 'Less Sugar Cafe'}
        </p>
        {isAdmin && (
          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '2px 8px' }}>
            <span style={{ color: '#ffd700' }}><IconAdmin /></span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: '0.04em' }}>Admin</span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* Group label */}
        <p style={{ fontSize: '10px', fontWeight: '700', color: '#b0a898', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px', margin: 0 }}>
          Menu Utama
        </p>

        {visible.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <NavLink
              key={item.name}
              to={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                background: isActive ? C.primaryLight : 'transparent',
                color: isActive ? C.primaryDark : C.sub,
                fontWeight: isActive ? '700' : '500',
                fontSize: '13px', transition: 'all 0.15s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '#f5f2ed'; (e.currentTarget as HTMLAnchorElement).style.color = C.text; }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = C.sub; } }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '3px', borderRadius: '0 2px 2px 0',
                  background: C.primary,
                }} />
              )}
              <span style={{ color: isActive ? C.primary : 'inherit', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <item.Icon active={isActive} />
              </span>
              {item.name}
              {/* Dot for active */}
              {isActive && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: C.primary, opacity: 0.5 }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User + Logout ── */}
      <div style={{ padding: '10px', borderTop: `1px solid ${C.border}` }}>
        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: C.cream, marginBottom: '6px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, #7aae78)`,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', flexShrink: 0,
            fontFamily: "'Playfair Display', serif",
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: C.sub, fontWeight: '500' }}>
              {isAdmin ? 'Administrator' : 'Kasir'}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: logoutHovered ? '#fdecea' : 'transparent',
            color: logoutHovered ? '#E8604A' : C.sub,
            fontSize: '12px', fontWeight: '600', transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}>
          <IconLogout />
          Keluar
        </button>
      </div>
    </aside>
  );
};