import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import loadkucing from '../assets/loadkucing.json';
import { marginsApi, settingsApi } from '../api/ingredient';
import { MarginSummary, MenuMargin } from '../types';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';


// ── SVG Icons ─────────────────────────────────────────────────────────────────
const TrendUpIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDownIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const BarChartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const KeyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const UnlockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const DollarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const PackageIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;

const C = {
  primary: '#5B8C5A', primaryLight: '#ebf4eb',
  orange: '#e8622a', orangeLight: '#fff3ee',
  text: '#2a2420', sub: '#8a8278',
  red: '#E8604A', blue: '#4AA8D8',
};

const SESSION_KEY = 'margins_unlocked';

// ── Lock Screen ───────────────────────────────────────────────────────────────
const LockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!pw) return;
    setLoading(true); setError('');
    const ok = await settingsApi.verifyMarginsPassword(pw);
    setLoading(false);
    if (ok) { sessionStorage.setItem(SESSION_KEY, '1'); onUnlock(); }
    else { setError('Password salah, coba lagi'); setPw(''); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800', color: C.text }}>Halaman Terkunci</h2>
        <p style={{ margin: '0 0 28px', fontSize: '13px', color: C.sub }}>Masukkan password untuk melihat data margin & keuntungan</p>
        <input
          ref={inputRef} type="password" value={pw}
          onChange={e => { setPw(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Password margins"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px', boxSizing: 'border-box',
            border: `1.5px solid ${error ? C.red : '#e8e4dc'}`,
            fontSize: '15px', textAlign: 'center', outline: 'none',
            fontFamily: 'inherit', letterSpacing: '0.1em',
          }}
        />
        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.red, fontWeight: '600' }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading || !pw} style={{
          width: '100%', padding: '13px', marginTop: '16px', border: 'none',
          borderRadius: '12px', background: C.primary, color: 'white',
          fontSize: '14px', fontWeight: '700', cursor: loading || !pw ? 'not-allowed' : 'pointer',
          opacity: loading || !pw ? 0.6 : 1, fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(91,140,90,0.3)',
        }}>
          {loading ? 'Memverifikasi...' : 'Buka'}
        </button>
      </div>
    </div>
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
    // Verifikasi password lama dulu
    const ok = await settingsApi.verifyMarginsPassword(oldPw);
    if (!ok) { toast.error('Password lama salah'); setSaving(false); return; }
    try {
      await settingsApi.setMarginsPassword(newPw);
      toast.success('Password berhasil diubah');
      onClose();
    } catch {
      toast.error('Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: C.text }}>🔑 Ganti Password Margin</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Password Lama', value: oldPw, onChange: setOldPw, placeholder: 'Password saat ini' },
            { label: 'Password Baru', value: newPw, onChange: setNewPw, placeholder: 'Min. 4 karakter' },
            { label: 'Konfirmasi Password Baru', value: confirmPw, onChange: setConfirmPw, placeholder: 'Ulangi password baru' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.sub, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <input
                type="password" value={f.value} onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8e4dc', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1.5px solid #e8e4dc', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '10px', background: C.primary, color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; sub?: string; color?: string; bg?: string }> = ({ label, value, sub, color = C.text, bg = 'white' }) => (
  <div style={{ background: bg, borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color, letterSpacing: '-0.02em' }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>{sub}</p>}
  </div>
);

// ── Main Margins Page ─────────────────────────────────────────────────────────
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
  // inject keyframe
  const styleEl = typeof document !== 'undefined' ? document.getElementById('mg-style') : null;
  if (!styleEl && typeof document !== 'undefined') {
    const s = document.createElement('style');
    s.id = 'mg-style';
    s.textContent = '@keyframes mgBlink { 0%,80%,100%{opacity:0} 40%{opacity:1} }';
    document.head.appendChild(s);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: C.text }}>
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>Margin & Keuntungan</h1>
          <p style={{ margin: 0, fontSize: '13px', color: C.sub }}>Data COGS, revenue, dan profit bersih per menu</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={{
            padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e8e4dc',
            fontSize: '13px', fontWeight: '600', background: 'white', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', color: C.text,
          }}>
            <option value={7}>7 hari</option>
            <option value={30}>30 hari</option>
            <option value={60}>60 hari</option>
            <option value={90}>90 hari</option>
          </select>
          <button onClick={() => setShowChangePw(true)} style={{
            padding: '9px 14px', border: '1.5px solid #e8e4dc', borderRadius: '10px',
            background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            color: C.sub, fontFamily: 'inherit',
          }}><KeyIcon /> Ganti Password</button>
          <button onClick={handleLock} style={{
            padding: '9px 14px', border: '1.5px solid #e8e4dc', borderRadius: '10px',
            background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            color: C.sub, fontFamily: 'inherit',
          }}><LockIcon /> Kunci</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:'8px' }}>
          <Lottie animationData={loadkucing} loop autoplay style={{ width:200,height:200 }} />
          <p style={{ fontSize:'14px',fontWeight:'700',color:C.sub,margin:0 }}>Memuat data margin...</p>
          <div style={{ display:'flex',gap:'5px',marginTop:'4px' }}>
            {[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:'50%',background:C.primary,opacity:0,animation:`mgBlink 1.4s ease-in-out ${i*0.2}s infinite` }}/>)}
          </div>
        </div>
      ) : (
        <>
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              <StatCard label="Total Revenue" value={formatCurrency(summary.total_revenue)} sub={`${days} hari terakhir`} color={C.primary} />
              <StatCard label="Total COGS" value={formatCurrency(summary.total_cogs)} sub="Modal bahan baku" color={C.orange} />
              <StatCard label="Profit Bersih" value={formatCurrency(summary.net_profit)} sub="Revenue − COGS" color={summary.net_profit >= 0 ? C.primary : C.red} bg={summary.net_profit >= 0 ? C.primaryLight : '#fff0ee'} />
              <StatCard label="Margin" value={`${summary.margin_pct.toFixed(1)}%`} sub="Rata-rata keuntungan" color={summary.margin_pct >= 50 ? C.primary : summary.margin_pct >= 25 ? C.orange : C.red} />
            </div>
          )}

          {summary && summary.total_revenue > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: C.sub }}>KOMPOSISI REVENUE</p>
              <div style={{ height: '28px', borderRadius: '8px', overflow: 'hidden', background: '#f0ece4', display: 'flex' }}>
                <div style={{ width: `${(summary.total_cogs / summary.total_revenue) * 100}%`, background: `linear-gradient(90deg, ${C.orange}, #f5a623)`, transition: 'width 0.6s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', minWidth: summary.total_cogs > 0 ? '40px' : '0' }}>
                  {((summary.total_cogs / summary.total_revenue) * 100).toFixed(0)}%
                </div>
                <div style={{ flex: 1, background: `linear-gradient(90deg, ${C.primary}, #7aae78)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white' }}>
                  {summary.margin_pct.toFixed(0)}%
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.sub }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: C.orange }} /> COGS ({formatCurrency(summary.total_cogs)})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.sub }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: C.primary }} /> Profit ({formatCurrency(summary.net_profit)})
                </div>
              </div>
            </div>
          )}

          {breakdown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '16px', color: C.sub }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📊</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Belum ada data penjualan di periode ini</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Pastikan menu sudah punya bahan baku yang terdaftar</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ece4' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.text }}>Breakdown per Menu</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.2fr 1.2fr 1.2fr 100px', padding: '10px 20px', background: '#f9f8f5', fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f0ece4' }}>
                <span>Menu</span><span style={{ textAlign: 'center' }}>Terjual</span><span>Revenue</span><span>COGS</span><span>Profit</span><span style={{ textAlign: 'center' }}>Margin</span>
              </div>
              {breakdown.map((row, idx) => {
                const mc = row.margin_pct >= 50 ? C.primary : row.margin_pct >= 25 ? C.orange : C.red;
                return (
                  <div key={row.menu_id} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.2fr 1.2fr 1.2fr 100px', padding: '14px 20px', alignItems: 'center', borderBottom: idx < breakdown.length - 1 ? '1px solid #f5f2ed' : 'none' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{row.menu_name}</span>
                    <span style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: C.sub }}>{row.qty_sold}x</span>
                    <span style={{ fontSize: '13px' }}>{formatCurrency(row.revenue)}</span>
                    <span style={{ fontSize: '13px', color: C.orange }}>{formatCurrency(row.cogs)}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: row.profit >= 0 ? C.primary : C.red }}>{formatCurrency(row.profit)}</span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: mc + '18', color: mc }}>{row.margin_pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {breakdown.some(r => r.cogs === 0) && (
            <p style={{ margin: '16px 0 0', fontSize: '12px', color: C.sub, textAlign: 'center' }}>
              💡 Menu dengan COGS = 0 berarti belum ada bahan baku yang terdaftar — tambahkan di halaman Menu
            </p>
          )}
        </>
      )}
    </div>
  );
};
