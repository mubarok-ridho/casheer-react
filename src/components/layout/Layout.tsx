import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from './Header';
import { SidebarProvider, Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Unauthenticated: render halaman login/etc tanpa chrome
  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .layout-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f4f0e8;
          font-family: 'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* Header spans full width at top */
        .layout-header {
          /* Header is sticky internally — just needs to sit above the body row */
          position: relative;
          z-index: 40;
        }

        /* Body row: sidebar + main side by side */
        .layout-body {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* Main content area */
        .layout-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 28px 32px 48px;
        }

        /* ── Tablet (768 – 1023px) ── */
        @media (max-width: 1023px) {
          .layout-main { padding: 22px 24px 40px; }
        }

        /* ── Mobile (< 768px) ── */
        @media (max-width: 767px) {
          .layout-main { padding: 16px 14px 40px; }

          /* On mobile: sidebar is a fixed drawer (handled inside Sidebar.tsx),
             so layout-body doesn't need to reserve sidebar width */
          .layout-body { overflow: visible; }
        }
      `}</style>

      <div className="layout-root">
        {/* Sticky header — contains hamburger on mobile */}
        <div className="layout-header">
          <Header />
        </div>

        <div className="layout-body">
          {/* Desktop sidebar | Mobile drawer (self-managed inside Sidebar) */}
          <Sidebar />

          {/* Page content */}
          <main className="layout-main">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};