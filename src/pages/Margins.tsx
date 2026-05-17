import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import loadkucing from '../assets/loadkucing.json';
import { marginsApi, settingsApi } from '../api/ingredient';
import { MarginSummary, MenuMargin } from '../types';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

// ── Icons ─────────────────────────────────────────────────────────────────────
const LockIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const KeyIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const RevenueIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const CogsIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ProfitIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const MarginIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const ChevronIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const TrendUpIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  orange: '#e8622a', orangeLight: '#fff3ee',
  text: '#1e1a14', sub: '#8a8278',
  red: '#E8604A', redLight: '#fdecea',
  bg: '#f4f0e8', card: '#ffffff',
  border: 'rgba(0,0,0,0.07)',
};

const SESSION_KEY = 'margins_unlocked';

// ── Lock Screen ───────────────────────────────────────────────────────────────
const LockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSubmit = async () => {
    if (!pw) return;
    setLoading(true); setError('');
    const ok = await settingsApi.verifyMarginsPassword(pw);
    setLoading(false);
    if (ok) { sessionStorage.setItem(SESSION_KEY, '1'); onUnlock(); }
    else { setError('Password salah, coba lagi'); setPw(''); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');
        @keyframes mg-pop { from{opacity:0;transform:scale(.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'white', borderRadius: '28px', padding: '40px 32px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', animation: 'mg-pop 0.3s cubic-bezier(0.34,1.1,0.64,1)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.primaryLight, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🔐</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: C.text, fontFamily: "'Sora', sans-serif" }}>Halaman Terkunci</h2>
          <p style={{ margin: '0 0 28px', fontSize: '13px', color: C.sub, lineHeight: 1.55 }}>Masukkan password untuk melihat data margin & keuntungan</p>
          <input
            ref={inputRef} type="password" value={pw}
            onChange={e => { setPw(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            style={{ width: '100%', padding: '13px 16px', borderRadius: '13px', boxSizing: 'border-box', border: `1.5px solid ${error ? C.red : '#e8e4dc'}`, fontSize: '18px', textAlign: 'center', outline: 'none', fontFamily: 'inherit', letterSpacing: '0.18em', background: '#faf9f6', transition: 'border-color 0.2s' }}
          />
          {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.red, fontWeight: '600' }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading || !pw} style={{ width: '100%', padding: '14px', marginTop: '14px', border: 'none', borderRadius: '13px', background: pw && !loading ? `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})` : '#d0ccc6', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !pw ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: pw ? '0 4px 16px rgba(91,140,90,0.3)' : 'none', transition: 'all 0.2s' }}>
            {loading ? 'Memverifikasi...' : 'Buka'}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Change Password Modal ─────────────────────────────────────────────────────
const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!oldPw) { toast.error('Masukkan password lama'); return; }
    if (newPw.length < 4) { toast.error('Password baru minimal 4 karakter'); return; }
    if (newPw !== confirmPw) { toast.error('Konfirmasi password tidak cocok'); return; }
    setSaving(true);
    const ok = await settingsApi.verifyMarginsPassword(oldPw);
    if (!ok) { toast.error('Password lama salah'); setSaving(false); return; }
    try { await settingsApi.setMarginsPassword(newPw); toast.success('Password berhasil diubah'); onClose(); }
    catch { toast.error('Gagal mengubah password'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'white', borderRadius: '22px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '800', color: C.text }}>🔑 Ganti Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[['Password Lama', oldPw, setOldPw, 'Password saat ini'], ['Password Baru', newPw, setNewPw, 'Min. 4 karakter'], ['Konfirmasi', confirmPw, setConfirmPw, 'Ulangi password baru']].map(([label, val, setter, ph]: any) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.sub, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <input type="password" value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8e4dc', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1.5px solid #e8e4dc', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', color: C.sub }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '10px', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card Mobile ──────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string; bg: string; highlight?: boolean }> = ({ icon, label, value, sub, color, bg, highlight }) => (
  <div className={`mg-stat-card ${highlight ? 'mg-stat-card--highlight' : ''}`} style={{ background: highlight ? `linear-gradient(135deg, ${color}22, ${color}11)` : bg, borderColor: highlight ? color + '44' : 'rgba(0,0,0,0.06)' }}>
    <div className="mg-stat-icon" style={{ background: color + '22', color }}>{icon}</div>
    <p className="mg-stat-label" style={{ color: C.sub }}>{label}</p>
    <p className="mg-stat-value" style={{ color }}>{value}</p>
    {sub && <p className="mg-stat-sub">{sub}</p>}
  </div>
);

// ── Menu Row Card (mobile-friendly) ──────────────────────────────────────────
const MenuRow: React.FC<{ row: MenuMargin; rank: number }> = ({ row, rank }) => {
  const [open, setOpen] = useState(false);
  const mc = row.margin_pct >= 50 ? C.primary : row.margin_pct >= 25 ? C.orange : C.red;
  const isTop = rank <= 3;

  return (
    <div className="mg-menu-row" onClick={() => setOpen(o => !o)}>
      {/* Header row */}
      <div className="mg-menu-row-header">
        <div className="mg-menu-row-left">
          <div className="mg-rank-badge" style={{ background: isTop ? mc + '20' : '#f5f2ed', color: isTop ? mc : C.sub }}>
            {rank}
          </div>
          <div>
            <p className="mg-menu-name">{row.menu_name}</p>
            <p className="mg-menu-sub">{row.qty_sold}x terjual · {formatCurrency(row.revenue)}</p>
          </div>
        </div>
        <div className="mg-menu-row-right">
          <span className="mg-margin-pill" style={{ background: mc + '18', color: mc }}>
            {row.margin_pct.toFixed(1)}%
          </span>
          <span className="mg-chevron" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronIcon />
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="mg-menu-detail">
          <div className="mg-detail-bar">
            <div style={{ height: '6px', borderRadius: '3px', background: '#f0ede8', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (row.cogs / row.revenue) * 100)}%`, background: `linear-gradient(90deg, ${C.orange}, #f5a623)`, borderRadius: '3px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
          <div className="mg-detail-grid">
            {[
              { label: 'Revenue', value: formatCurrency(row.revenue), color: C.primary },
              { label: 'COGS', value: formatCurrency(row.cogs), color: C.orange },
              { label: 'Profit', value: formatCurrency(row.profit), color: row.profit >= 0 ? C.primary : C.red },
              { label: 'Qty', value: `${row.qty_sold}x`, color: C.sub },
            ].map(d => (
              <div key={d.label} className="mg-detail-item">
                <p className="mg-detail-label">{d.label}</p>
                <p className="mg-detail-value" style={{ color: d.color }}>{d.value}</p>
              </div>
            ))}
          </div>
          {row.cogs === 0 && (
            <p style={{ margin: '10px 0 0', fontSize: '11px', color: C.sub, background: '#f9f8f5', borderRadius: '8px', padding: '7px 10px' }}>
              💡 Belum ada bahan baku yang terdaftar
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
export const Margins: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [summary, setSummary] = useState<MarginSummary | null>(null);
  const [breakdown, setBreakdown] = useState<MenuMargin[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  useEffect(() => { if (unlocked) load(); }, [unlocked, days]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([marginsApi.getSummary(days), marginsApi.getMenuBreakdown(days)]);
      setSummary(s); setBreakdown(b);
    } catch { toast.error('Gagal memuat data margin'); }
    finally { setLoading(false); }
  };

  const handleLock = () => { sessionStorage.removeItem(SESSION_KEY); setUnlocked(false); };

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes mg-fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mg-blink   { 0%,80%,100%{opacity:0} 40%{opacity:1} }

        .mg-root { display:flex; flex-direction:column; gap:16px; font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; color:${C.text}; animation:mg-fade-up 0.3s ease; }

        /* ── Header ── */
        .mg-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .mg-title { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:${C.text}; letter-spacing:-0.03em; margin:0 0 4px; }
        .mg-subtitle { font-size:12px; color:${C.sub}; margin:0; }
        .mg-header-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .mg-select {
          padding:8px 12px; border-radius:10px; border:1.5px solid #e8e4dc;
          font-size:13px; font-weight:700; background:white; outline:none; cursor:pointer;
          font-family:inherit; color:${C.text};
        }
        .mg-btn-icon {
          display:flex; align-items:center; gap:6px;
          padding:8px 14px; border:1.5px solid #e8e4dc; border-radius:10px;
          background:white; cursor:pointer; font-size:12px; font-weight:700;
          color:${C.sub}; font-family:inherit; transition:all 0.15s; white-space:nowrap;
        }
        .mg-btn-icon:hover { background:#f5f2ed; border-color:#d0ccc6; }

        /* ── Stat grid ── */
        .mg-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .mg-stat-card {
          border-radius:18px; padding:16px; border:1.5px solid rgba(0,0,0,0.06);
          display:flex; flex-direction:column; gap:6px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05); transition:transform 0.2s;
        }
        .mg-stat-card:hover { transform:translateY(-2px); }
        .mg-stat-card--highlight { border-width:2px; }
        .mg-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .mg-stat-label { font-size:10px; font-weight:700; color:${C.sub}; text-transform:uppercase; letter-spacing:0.07em; margin:4px 0 0; }
        .mg-stat-value { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; letter-spacing:-0.03em; margin:0; line-height:1; }
        .mg-stat-sub { font-size:10.5px; color:${C.sub}; margin:0; }

        /* ── Revenue bar ── */
        .mg-rev-card { background:white; border-radius:18px; padding:18px; border:1.5px solid rgba(0,0,0,0.06); box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .mg-rev-title { font-size:11px; font-weight:700; color:${C.sub}; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 10px; }
        .mg-rev-numbers { display:flex; justify-content:space-between; margin-bottom:10px; }
        .mg-rev-num { display:flex; flex-direction:column; gap:2px; }
        .mg-rev-num-label { font-size:10px; color:${C.sub}; font-weight:600; }
        .mg-rev-num-value { font-size:15px; font-weight:800; }

        /* ── Menu breakdown ── */
        .mg-breakdown-card { background:white; border-radius:18px; overflow:hidden; border:1.5px solid rgba(0,0,0,0.06); box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .mg-breakdown-header { padding:16px 18px; border-bottom:1px solid #f0ede8; display:flex; align-items:center; justify-content:space-between; }
        .mg-breakdown-title { font-size:14px; font-weight:700; color:${C.text}; margin:0; }
        .mg-breakdown-count { font-size:11px; color:${C.sub}; background:#f5f2ed; border-radius:20px; padding:3px 10px; font-weight:700; }

        .mg-menu-row { padding:14px 18px; border-bottom:1px solid #f5f2ed; cursor:pointer; transition:background 0.12s; user-select:none; }
        .mg-menu-row:last-child { border-bottom:none; }
        .mg-menu-row:hover { background:#faf9f6; }
        .mg-menu-row:active { background:#f5f2ed; }
        .mg-menu-row-header { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .mg-menu-row-left { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
        .mg-menu-row-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .mg-rank-badge { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
        .mg-menu-name { font-size:13px; font-weight:700; color:${C.text}; margin:0 0 2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .mg-menu-sub { font-size:11px; color:${C.sub}; margin:0; }
        .mg-margin-pill { font-size:12px; font-weight:800; padding:4px 10px; border-radius:20px; }
        .mg-chevron { color:${C.sub}; display:flex; transition:transform 0.2s; }

        .mg-menu-detail { margin-top:12px; padding-top:12px; border-top:1px dashed #e8e4dc; }
        .mg-detail-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .mg-detail-item { background:#f9f8f5; border-radius:10px; padding:10px 12px; }
        .mg-detail-label { font-size:10px; font-weight:700; color:${C.sub}; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 3px; }
        .mg-detail-value { font-size:14px; font-weight:800; margin:0; }

        /* ── Loading ── */
        .mg-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:8px; }
        .mg-blink-dots { display:flex; gap:5px; }
        .mg-blink-dots span { width:6px; height:6px; border-radius:50%; background:${C.primary}; opacity:0; animation:mg-blink 1.4s ease-in-out infinite; }
        .mg-blink-dots span:nth-child(2){animation-delay:.2s}
        .mg-blink-dots span:nth-child(3){animation-delay:.4s}

        /* ── Empty ── */
        .mg-empty { text-align:center; padding:48px 24px; background:white; border-radius:18px; border:1.5px dashed #d8d4cc; }

        /* ── Desktop overrides ── */
        @media (min-width: 768px) {
          .mg-root { gap:20px; }
          .mg-title { font-size:26px; }
          .mg-stats { grid-template-columns:repeat(4,1fr); gap:14px; }
          .mg-stat-card { padding:20px 22px; border-radius:20px; }
          .mg-stat-value { font-size:22px; }
          .mg-stat-icon { width:42px; height:42px; border-radius:12px; }
          /* Desktop: table layout for breakdown */
          .mg-menu-row { cursor:default; }
          .mg-menu-row:hover { background:#faf9f6; }
        }

        @media (max-width: 479px) {
          .mg-header { flex-direction:column; }
          .mg-header-actions { width:100%; justify-content:space-between; }
          .mg-select { flex:1; }
          .mg-stats { gap:8px; }
          .mg-stat-card { padding:13px 14px; border-radius:16px; }
          .mg-stat-value { font-size:15px; }
          .mg-stat-icon { width:30px; height:30px; border-radius:8px; }
          .mg-stat-label { font-size:9px; }
        }
      `}</style>

      <div className="mg-root">
        {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

        {/* ── Header ── */}
        <div className="mg-header">
          <div>
            <h1 className="mg-title">Margin & Keuntungan</h1>
            <p className="mg-subtitle">COGS, revenue, dan profit bersih per menu</p>
          </div>
          <div className="mg-header-actions">
            <select value={days} onChange={e => setDays(Number(e.target.value))} className="mg-select">
              <option value={7}>7 hari</option>
              <option value={30}>30 hari</option>
              <option value={60}>60 hari</option>
              <option value={90}>90 hari</option>
            </select>
            <button onClick={() => setShowChangePw(true)} className="mg-btn-icon"><KeyIcon /> <span>Password</span></button>
            <button onClick={handleLock} className="mg-btn-icon"><LockIcon /></button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="mg-loading">
            <Lottie animationData={loadkucing} loop autoplay style={{ width: 180, height: 180 }} />
            <p style={{ fontSize: '14px', fontWeight: '700', color: C.sub, margin: 0 }}>Memuat data margin...</p>
            <div className="mg-blink-dots"><span /><span /><span /></div>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Stat Cards ── */}
            {summary && (
              <div className="mg-stats">
                <StatCard icon={<RevenueIcon />} label="Revenue" value={formatCurrency(summary.total_revenue)} sub={`${days} hari`} color={C.primary} bg={C.primaryLight} />
                <StatCard icon={<CogsIcon />} label="COGS" value={formatCurrency(summary.total_cogs)} sub="modal bahan" color={C.orange} bg={C.orangeLight} />
                <StatCard icon={<ProfitIcon />} label="Profit" value={formatCurrency(summary.net_profit)} sub="revenue − cogs" color={summary.net_profit >= 0 ? C.primary : C.red} bg={summary.net_profit >= 0 ? C.primaryLight : '#fff0ee'} highlight />
                <StatCard icon={<MarginIcon />} label="Margin" value={`${summary.margin_pct.toFixed(1)}%`} sub="rata-rata" color={summary.margin_pct >= 50 ? C.primary : summary.margin_pct >= 25 ? C.orange : C.red} bg={summary.margin_pct >= 50 ? C.primaryLight : summary.margin_pct >= 25 ? C.orangeLight : '#fff0ee'} highlight />
              </div>
            )}

            {/* ── Revenue Composition Bar ── */}
            {summary && summary.total_revenue > 0 && (
              <div className="mg-rev-card">
                <p className="mg-rev-title">Komposisi Revenue</p>
                <div className="mg-rev-numbers">
                  <div className="mg-rev-num">
                    <span className="mg-rev-num-label">COGS</span>
                    <span className="mg-rev-num-value" style={{ color: C.orange }}>{formatCurrency(summary.total_cogs)}</span>
                  </div>
                  <div className="mg-rev-num" style={{ textAlign: 'right' }}>
                    <span className="mg-rev-num-label">Profit</span>
                    <span className="mg-rev-num-value" style={{ color: C.primary }}>{formatCurrency(summary.net_profit)}</span>
                  </div>
                </div>
                <div style={{ height: '12px', borderRadius: '6px', background: '#f0ede8', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${Math.min(100, (summary.total_cogs / summary.total_revenue) * 100)}%`, background: `linear-gradient(90deg, ${C.orange}, #f5a623)`, transition: 'width 0.6s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', color: 'white', minWidth: summary.total_cogs > 0 ? '36px' : '0' }}>
                    {((summary.total_cogs / summary.total_revenue) * 100).toFixed(0)}%
                  </div>
                  <div style={{ flex: 1, background: `linear-gradient(90deg, ${C.primary}, #7aae78)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', color: 'white' }}>
                    {summary.margin_pct.toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* ── Breakdown per Menu ── */}
            {breakdown.length === 0 ? (
              <div className="mg-empty">
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📊</div>
                <p style={{ margin: 0, fontWeight: 700, color: C.text }}>Belum ada data penjualan</p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: C.sub }}>Pastikan menu sudah punya bahan baku terdaftar</p>
              </div>
            ) : (
              <div className="mg-breakdown-card">
                <div className="mg-breakdown-header">
                  <p className="mg-breakdown-title">Breakdown per Menu</p>
                  <span className="mg-breakdown-count">{breakdown.length} menu</span>
                </div>
                {breakdown.map((row, idx) => (
                  <MenuRow key={row.menu_id} row={row} rank={idx + 1} />
                ))}
              </div>
            )}

            {breakdown.some(r => r.cogs === 0) && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.sub, textAlign: 'center' }}>
                💡 Menu dengan COGS = 0 belum punya bahan baku terdaftar
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};
