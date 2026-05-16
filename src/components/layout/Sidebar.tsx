import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
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
const IconPromo = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconStock = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconMargins = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
// Hamburger → X morph
const IconHamburger = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Sidebar Context ───────────────────────────────────────────────────────────
// Shared state antara Sidebar dan MobileHeader
interface SidebarCtx { isOpen: boolean; toggle: () => void; close: () => void; }
const SidebarContext = createContext<SidebarCtx>({ isOpen: false, toggle: () => {}, close: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(v => !v);
  const close  = () => setIsOpen(false);

  // Tutup saat resize ke desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const LOGO_TEXT = "https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png";

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  cream: '#f4f0e8', orange: '#e8622a', orangeLight: '#fff3ee',
};

interface NavItem {
  name: string;
  href: string;
  Icon: React.FC<{ active: boolean }>;
  adminOnly: boolean;
  enhanced?: boolean;
  accent?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard',  href: '/dashboard', Icon: IconDashboard, adminOnly: false },
  { name: 'Kasir',      href: '/order',     Icon: IconKasir,     adminOnly: false },
  { name: 'Menu',       href: '/menu',      Icon: IconMenu,      adminOnly: false },
  { name: 'Laporan',    href: '/reports',   Icon: IconReport,    adminOnly: true  },
  { name: 'Riwayat',    href: '/history',   Icon: IconHistory,   adminOnly: false },
  { name: 'Promo',      href: '/promos',    Icon: IconPromo,     adminOnly: true  },
  { name: 'Pengaturan', href: '/settings',  Icon: IconSettings,  adminOnly: true  },
  { name: 'Stok Bahan', href: '/stock',     Icon: IconStock,     adminOnly: true, enhanced: true },
  { name: 'Margin',     href: '/margins',   Icon: IconMargins,   adminOnly: true, enhanced: true },
];

// ── Single nav link ───────────────────────────────────────────────────────────
const SidebarLink: React.FC<{ item: NavItem; isActive: boolean; onClick?: () => void }> = ({ item, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const accent      = item.accent || C.primary;
  const accentLight = item.accent ? C.orangeLight : C.primaryLight;
  const accentDark  = item.accent ? C.orange : C.primaryDark;

  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
        background: isActive ? accentLight : hovered ? '#f5f2ed' : 'transparent',
        color: isActive ? accentDark : hovered ? C.text : C.sub,
        fontWeight: isActive ? '700' : '500',
        fontSize: '13px', transition: 'all 0.15s ease',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: '3px', borderRadius: '0 2px 2px 0',
          background: accent,
        }} />
      )}
      <span style={{ color: isActive ? accent : 'inherit', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <item.Icon active={isActive} />
      </span>
      {item.name}
      {isActive && (
        <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: accent, opacity: 0.5 }} />
      )}
    </NavLink>
  );
};

// ── Sidebar inner content (shared between desktop & drawer) ───────────────────
const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { isAdmin, tenant, user, logout, enhancedMode } = useAuth();
  const location = useLocation();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const visible = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.enhanced && !enhancedMode) return false;
    return true;
  });
  const mainItems     = visible.filter(i => !i.enhanced);
  const enhancedItems = visible.filter(i => i.enhanced);

  return (
    <>
      {/* Store info card */}
      <div style={{
        margin: '12px 12px 4px',
        background: 'linear-gradient(135deg, #3d5e3c, #5B8C5A)',
        borderRadius: '12px', padding: '12px 14px',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
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

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        <p style={{ fontSize: '10px', fontWeight: '700', color: '#b0a898', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px', margin: 0 }}>
          Menu Utama
        </p>
        {mainItems.map(item => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return <SidebarLink key={item.href} item={item} isActive={isActive} onClick={onNavigate} />;
        })}

        {enhancedItems.length > 0 && (
          <>
            <div style={{ margin: '10px 10px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#b0a898', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Enhanced</p>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ fontSize: '9px', background: C.orange + '22', color: C.orange, fontWeight: '800', padding: '1px 6px', borderRadius: '100px' }}>⚡</span>
            </div>
            {enhancedItems.map(item => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              const itemWithAccent = item.href === '/margins' ? { ...item, accent: C.orange } : item;
              return <SidebarLink key={item.href} item={itemWithAccent} isActive={isActive} onClick={onNavigate} />;
            })}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: C.cream, marginBottom: '6px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, #7aae78)`,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', flexShrink: 0,
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
    </>
  );
};

// ── Main Sidebar export ───────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP SIDEBAR — always visible ≥ 768px
      ═══════════════════════════════════════════ */}
      <aside className="sidebar-desktop">
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
        }}>
          <img src={LOGO_TEXT} alt="MODU" style={{ height: '18px', objectFit: 'contain' }} />
        </div>

        <SidebarContent />
      </aside>

      {/* ═══════════════════════════════════════════
          MOBILE BACKDROP
      ═══════════════════════════════════════════ */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop--visible' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ═══════════════════════════════════════════
          MOBILE DRAWER — slides in from left
      ═══════════════════════════════════════════ */}
      <aside className={`sidebar-drawer ${isOpen ? 'sidebar-drawer--open' : ''}`}>
        {/* Drawer header with logo + close */}
        <div style={{
          padding: '16px 16px 14px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <img src={LOGO_TEXT} alt="MODU" style={{ height: '16px', objectFit: 'contain' }} />
          <button
            onClick={close}
            aria-label="Tutup menu"
            style={{
              background: '#f5f2ed', border: 'none', borderRadius: '9px',
              width: '34px', height: '34px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.sub, transition: 'background 0.15s',
            }}
          >
            <IconClose />
          </button>
        </div>

        <SidebarContent onNavigate={close} />
      </aside>

      {/* ── Styles ── */}
      <style>{`
        @keyframes backdropIn  { from{opacity:0} to{opacity:1} }
        @keyframes drawerSlide { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        /* ── Desktop sidebar ── */
        .sidebar-desktop {
          width: 232px;
          min-height: 100vh;
          background: white;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid ${C.border};
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* ── Backdrop ── */
        .sidebar-backdrop {
          display: none;
          position: fixed; inset: 0; z-index: 49;
          background: rgba(30,26,20,0.45);
          backdrop-filter: blur(3px);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .sidebar-backdrop--visible {
          opacity: 1;
        }

        /* ── Drawer ── */
        .sidebar-drawer {
          display: none;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 272px;
          z-index: 50;
          background: white;
          flex-direction: column;
          box-shadow: 4px 0 32px rgba(0,0,0,0.18);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.32, 0, 0.16, 1);
        }
        .sidebar-drawer--open {
          transform: translateX(0);
        }

        /* ── Mobile breakpoint ── */
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-drawer  { display: flex; }
          .sidebar-backdrop { display: none; }
          .sidebar-backdrop--visible { display: block; }
        }

        /* ── Tablet: show desktop sidebar as narrower icon rail, or full ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-desktop { width: 200px; }
        }
      `}</style>
    </>
  );
};

// ── MobileHeader — pasang ini di bagian atas layout untuk mobile ───────────────
// Tampilannya hanya muncul di < 768px. Di atas 768px otomatis tersembunyi via CSS.
export const MobileHeader: React.FC = () => {
  const { isOpen, toggle } = useSidebar();
  const { tenant } = useAuth();
  const location = useLocation();

  // Nama halaman aktif
  const currentPage = navItems.find(
    item => location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  );

  return (
    <>
      <header className="mobile-header">
        {/* Hamburger */}
        <button
          onClick={toggle}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          className={`mobile-header-burger ${isOpen ? 'mobile-header-burger--open' : ''}`}
        >
          <span className="burger-icon burger-icon--ham"><IconHamburger /></span>
          <span className="burger-icon burger-icon--x"><IconClose /></span>
        </button>

        {/* Center: logo or page name */}
        <div className="mobile-header-center">
          <img src="https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png" alt="MODU" style={{ height: '16px', objectFit: 'contain' }} />
        </div>

        {/* Right: store initial badge */}
        <div className="mobile-header-store">
          <div className="mobile-header-store-dot" />
          <span className="mobile-header-store-name">
            {(tenant?.store_name || tenant?.name || 'Toko').slice(0, 10)}
          </span>
        </div>
      </header>

      <style>{`
        .mobile-header {
          display: none;
        }

        @media (max-width: 767px) {
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 14px;
            background: white;
            border-bottom: 1px solid rgba(0,0,0,0.07);
            position: sticky;
            top: 0;
            z-index: 40;
            font-family: 'DM Sans', 'Segoe UI', sans-serif;
            flex-shrink: 0;
          }
        }

        /* Burger button */
        .mobile-header-burger {
          width: 38px; height: 38px;
          border-radius: 10px; border: 1.5px solid rgba(0,0,0,0.08);
          background: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #2a2420; transition: background 0.15s, border-color 0.15s;
          position: relative; overflow: hidden;
        }
        .mobile-header-burger:hover { background: #f5f2ed; }
        .mobile-header-burger--open {
          background: #ebf4eb;
          border-color: rgba(91,140,90,0.3);
          color: #5B8C5A;
        }

        /* Icon morph — ham shows by default, x shows when open */
        .burger-icon {
          position: absolute;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.18s, transform 0.18s;
        }
        .burger-icon--ham { opacity: 1; transform: scale(1) rotate(0deg); }
        .burger-icon--x   { opacity: 0; transform: scale(0.6) rotate(-45deg); }

        .mobile-header-burger--open .burger-icon--ham {
          opacity: 0; transform: scale(0.6) rotate(45deg);
        }
        .mobile-header-burger--open .burger-icon--x {
          opacity: 1; transform: scale(1) rotate(0deg);
        }

        /* Center */
        .mobile-header-center {
          display: flex; align-items: center; gap: 6px;
        }
        .mobile-header-page {
          font-size: 14px; font-weight: 700; color: #2a2420;
        }

        /* Store badge */
        .mobile-header-store {
          display: flex; align-items: center; gap: 5px;
          background: #f4f0e8; border-radius: 100px;
          padding: 5px 10px; max-width: 120px;
        }
        .mobile-header-store-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #5B8C5A; flex-shrink: 0;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .mobile-header-store-name {
          font-size: 11px; font-weight: 700; color: #5B8C5A;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
      `}</style>
    </>
  );
};