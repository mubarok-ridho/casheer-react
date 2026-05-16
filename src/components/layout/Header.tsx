import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from './Sidebar';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IcoSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IcoLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IcoStore = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoHamburger = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IcoClose = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

const LOGO_URL = "https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png";

// ── Component ─────────────────────────────────────────────────────────────────
export const Header: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleSettings = () => { setDropOpen(false); navigate('/settings'); };

  const storeName    = (tenant as any)?.store_name ?? (tenant as any)?.name ?? 'Less Sugar Cafe';
  const userName     = (user as any)?.name ?? (user as any)?.email?.split('@')[0] ?? 'User';
  const userEmail    = (user as any)?.email ?? '';
  const isAdmin      = (user as any)?.role === 'admin';
  const initial      = userName[0].toUpperCase();
  const storeInitial = storeName[0].toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Root ── */
        .hdr-root {
          position: sticky; top: 0; z-index: 40;
          background: rgba(247, 243, 235, 0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
        }
        .hdr-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 58px; gap: 12px;
        }

        /* ── LEFT ── */
        .hdr-left { display: flex; align-items: center; gap: 12px; min-width: 0; }

        /* Hamburger — only on mobile */
        .hdr-burger {
          display: none;
          width: 38px; height: 38px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: white; cursor: pointer;
          align-items: center; justify-content: center;
          color: #2a2420; transition: background 0.15s, border-color 0.15s;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .hdr-burger:hover { background: #f5f2ed; }
        .hdr-burger--open {
          background: #ebf4eb;
          border-color: rgba(91,140,90,0.3);
          color: #5B8C5A;
        }
        .hdr-burger-icon {
          position: absolute;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.18s, transform 0.2s;
        }
        .hdr-burger-icon--ham { opacity: 1; transform: scale(1) rotate(0deg); }
        .hdr-burger-icon--x   { opacity: 0; transform: scale(0.6) rotate(-45deg); }
        .hdr-burger--open .hdr-burger-icon--ham { opacity: 0; transform: scale(0.6) rotate(45deg); }
        .hdr-burger--open .hdr-burger-icon--x   { opacity: 1; transform: scale(1) rotate(0deg); }

        /* Store logo */
        .hdr-store-logo-wrap { position: relative; flex-shrink: 0; }
        .hdr-store-logo {
          width: 38px; height: 38px; border-radius: 10px;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .hdr-store-logo-fallback {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #3d5e3c, #5B8C5A);
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: 'Sora', serif;
          font-size: 16px; font-weight: 800;
          border: 1.5px solid rgba(255,255,255,0.15);
          box-shadow: 0 2px 8px rgba(91,140,90,0.3);
        }
        .hdr-store-pip {
          position: absolute; bottom: -2px; right: -2px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #5B8C5A; border: 2px solid #f7f3eb;
          display: flex; align-items: center; justify-content: center;
          color: white;
        }

        /* Store text info */
        .hdr-store-info { line-height: 1; min-width: 0; }
        .hdr-store-name {
          font-size: 14px; font-weight: 700; color: #2a2420;
          margin: 0 0 3px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .hdr-store-meta {
          font-size: 11px; color: #8a8278; margin: 0;
          display: flex; align-items: center; gap: 4px;
        }
        .hdr-meta-sep { opacity: 0.4; }
        .hdr-role-pill {
          display: inline-flex; align-items: center;
          padding: 1px 7px; border-radius: 100px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .hdr-role-admin { background: rgba(212,135,42,0.12); color: #b36d18; }
        .hdr-role-kasir { background: rgba(91,140,90,0.12);  color: #3d6b3c; }

        /* Mobile logo (shown only on mobile in place of store info) */
        .hdr-mobile-logo {
          display: none;
        }

        /* ── RIGHT ── */
        .hdr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* User button */
        .hdr-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px 6px 6px; border-radius: 100px;
          background: white; border: 1.5px solid rgba(0,0,0,0.08);
          cursor: pointer; transition: all 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #2a2420;
        }
        .hdr-user-btn:hover {
          border-color: rgba(91,140,90,0.35);
          box-shadow: 0 2px 10px rgba(91,140,90,0.12);
        }
        .hdr-user-btn.open {
          border-color: rgba(91,140,90,0.4);
          background: #f0f7f0;
        }
        .hdr-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #3d5e3c, #6aaa68);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 800; color: white;
          flex-shrink: 0;
        }
        .hdr-user-name {
          font-size: 13px; font-weight: 600; color: #2a2420;
          white-space: nowrap; max-width: 120px;
          overflow: hidden; text-overflow: ellipsis;
        }
        .hdr-chevron { color: #8a8278; }

        /* Dropdown */
        .hdr-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 210px; background: white;
          border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          animation: hdrDropIn 0.18s ease;
          z-index: 50;
        }
        @keyframes hdrDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hdr-drop-header {
          padding: 13px 14px 11px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          background: #faf9f6;
        }
        .hdr-drop-uname  { font-size: 13px; font-weight: 700; color: #2a2420; margin: 0 0 2px; }
        .hdr-drop-email  { font-size: 11px; color: #8a8278; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-drop-body   { padding: 6px; }
        .hdr-drop-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 10px; border-radius: 10px;
          border: none; background: none; cursor: pointer;
          font-size: 13px; font-weight: 500; text-align: left;
          transition: background 0.14s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #2a2420;
        }
        .hdr-drop-item:hover { background: #f5f2ed; }
        .hdr-drop-item.danger { color: #d94f38; }
        .hdr-drop-item.danger:hover { background: #fdecea; }
        .hdr-drop-divider { height: 1px; background: rgba(0,0,0,0.06); margin: 4px 6px; }

        /* ── MOBILE BREAKPOINT ── */
        @media (max-width: 767px) {
          .hdr-inner { padding: 0 14px; }

          /* Show hamburger */
          .hdr-burger { display: flex; }

          /* Hide store logo + info block on mobile */
          .hdr-store-logo-wrap { display: none; }
          .hdr-store-info { display: none; }

          /* Show MODU logo on mobile center-left */
          .hdr-mobile-logo { display: flex; align-items: center; }

          /* Shrink user name on mobile */
          .hdr-user-name { max-width: 72px; }
        }

        @media (max-width: 360px) {
          .hdr-user-name { display: none; }
          .hdr-chevron   { display: none; }
        }
      `}</style>

      <header className="hdr-root">
        <div className="hdr-inner">

          {/* ── LEFT ── */}
          <div className="hdr-left">
            {/* Hamburger — mobile only, talks to SidebarContext */}
            <button
              className={`hdr-burger ${isOpen ? 'hdr-burger--open' : ''}`}
              onClick={toggle}
              aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            >
              <span className="hdr-burger-icon hdr-burger-icon--ham"><IcoHamburger /></span>
              <span className="hdr-burger-icon hdr-burger-icon--x"><IcoClose /></span>
            </button>

            {/* MODU logo — mobile only (shown instead of store info) */}
            <div className="hdr-mobile-logo">
              <img src={LOGO_URL} alt="MODU" style={{ height: '15px', objectFit: 'contain' }} />
            </div>

            {/* Store logo + info — desktop only */}
            <div className="hdr-store-logo-wrap">
              {(tenant as any)?.logo_url ? (
                <img src={(tenant as any).logo_url} alt={storeName} className="hdr-store-logo" />
              ) : (
                <div className="hdr-store-logo-fallback">{storeInitial}</div>
              )}
              <div className="hdr-store-pip"><IcoStore /></div>
            </div>

            <div className="hdr-store-info">
              <p className="hdr-store-name">{storeName}</p>
              <p className="hdr-store-meta">
                <span>{userName}</span>
                <span className="hdr-meta-sep">·</span>
                <span className={`hdr-role-pill ${isAdmin ? 'hdr-role-admin' : 'hdr-role-kasir'}`}>
                  {isAdmin ? 'Admin' : 'Kasir'}
                </span>
              </p>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="hdr-right">
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                className={`hdr-user-btn${dropOpen ? ' open' : ''}`}
                onClick={() => setDropOpen(v => !v)}
              >
                <div className="hdr-avatar">{initial}</div>
                <span className="hdr-user-name">{userName}</span>
                <span className="hdr-chevron"><IcoChevron open={dropOpen} /></span>
              </button>

              {dropOpen && (
                <div className="hdr-dropdown">
                  <div className="hdr-drop-header">
                    <p className="hdr-drop-uname">{userName}</p>
                    {userEmail && <p className="hdr-drop-email">{userEmail}</p>}
                  </div>
                  <div className="hdr-drop-body">
                    {isAdmin && (
                      <>
                        <button className="hdr-drop-item" onClick={handleSettings}>
                          <IcoSettings /> Pengaturan
                        </button>
                        <div className="hdr-drop-divider" />
                      </>
                    )}
                    <button className="hdr-drop-item danger" onClick={handleLogout}>
                      <IcoLogout /> Keluar dari akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
};