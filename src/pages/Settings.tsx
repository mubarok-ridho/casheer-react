import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../api/report';
import { settingsApi } from '../api/ingredient';
import { Card } from '../components/common/Card';
import { StoreSettings as StoreSettingsComp } from '../components/settings/StoreSettings';
import { PrinterSettings } from '../components/settings/PrinterSettings';
import { TemplateSettings } from '../components/settings/TemplateSettings';
import { ReceiptTemplate, StoreSettings as StoreSettingsType } from '../types';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import toast from 'react-hot-toast';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconStore = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconPrinter = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const IconTemplate = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconZap = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconLockBig = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconShield = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  orange: '#e8622a', orangeLight: '#fff3ee',
  red: '#E8604A', redLight: '#fdecea',
  accent: '#E8A23A', accentLight: '#fff8e8',
  blue: '#4AA8D8', blueLight: '#e8f5fb',
};

// ── Password field with show/hide ─────────────────────────────────────────────
const PasswordField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="st-input"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: C.sub,
          display: 'flex', alignItems: 'center', padding: 2,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = C.text}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = C.sub}
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
};

// ── Enhanced Onboarding Popup ─────────────────────────────────────────────────
const EnhancedOnboardingPopup: React.FC<{
  onStart: () => void;
  onCancel: () => void;
}> = ({ onStart, onCancel }) => (
  <div className="st-popup-overlay">
    <div className="st-popup-card">
      {/* Decorative top */}
      <div className="st-popup-header">
        <div className="st-popup-header-deco" />
        <div className="st-popup-icon-wrap">
          <IconZap />
        </div>
        <div className="st-popup-header-deco2" />
      </div>

      <div className="st-popup-body">
        <h2 className="st-popup-title">Aktifkan Enhanced Mode?</h2>
        <p className="st-popup-desc">
          Enhanced Mode mengaktifkan <strong>manajemen stok bahan baku</strong> dan <strong>kalkulasi COGS & margin keuntungan</strong> untuk setiap menu.
        </p>

        <div className="st-popup-features">
          {[
            { icon: '📦', label: 'Manajemen Stok Bahan Baku' },
            { icon: '💰', label: 'Kalkulasi COGS & Margin' },
            { icon: '📊', label: 'Halaman Analitik Margin' },
          ].map((f, i) => (
            <div key={i} className="st-popup-feature">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <div className="st-popup-warning">
          <IconWarning />
          <span>Kamu perlu melengkapi bahan baku untuk setiap menu yang sudah ada.</span>
        </div>

        <div className="st-popup-actions">
          <button onClick={onCancel} className="st-btn-cancel st-btn-cancel--lg">
            Nanti Dulu
          </button>
          <button onClick={onStart} className="st-btn-primary st-btn-primary--lg">
            Mulai Setup <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ icon, iconBg, iconColor, title, subtitle, children, action }) => (
  <div className="st-section-card">
    <div className="st-section-header">
      <div className="st-section-title-group">
        <div className="st-section-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <div>
          <h3 className="st-section-title">{title}</h3>
          {subtitle && <p className="st-section-sub">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="st-section-action">{action}</div>}
    </div>
    <div className="st-section-body">{children}</div>
  </div>
);

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle: React.FC<{ on: boolean; onClick: () => void; disabled?: boolean }> = ({ on, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`st-toggle ${on ? 'st-toggle--on' : ''}`}
    style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
    aria-label={on ? 'Nonaktifkan' : 'Aktifkan'}
  >
    <div className="st-toggle-thumb" />
  </button>
);

// ── Enhanced Settings Tab ─────────────────────────────────────────────────────
const EnhancedSettings: React.FC = () => {
  const { refreshSettings } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Fetch logic — UNTOUCHED ──────────────────────────────────────────────────
  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
      const pwSet = await checkPasswordSet();
      setHasPassword(pwSet);
    } catch {
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordSet = async (): Promise<boolean> => {
    try {
      await settingsApi.verifyMarginsPassword('__check__');
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.error || '';
      if (msg.includes('belum diset')) return false;
      return true;
    }
  };

  const handleToggleEnhanced = async () => {
    if (!settings) return;
    if (!settings.enhanced_mode) {
      setShowOnboarding(true);
    } else {
      setSaving(true);
      try {
        const updated = await settingsApi.update({ ...settings, enhanced_mode: false });
        setSettings(updated);
        await refreshSettings();
        toast.success('Enhanced Mode dinonaktifkan');
      } catch {
        toast.error('Gagal mengubah pengaturan');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleOnboardingStart = async () => {
    if (!settings) return;
    setShowOnboarding(false);
    setSaving(true);
    try {
      const updated = await settingsApi.update({ ...settings, enhanced_mode: true });
      setSettings(updated);
      await refreshSettings();
      toast.success('Enhanced Mode aktif!');
      navigate('/menu?onboarding=enhanced');
    } catch {
      toast.error('Gagal mengaktifkan Enhanced Mode');
    } finally {
      setSaving(false);
    }
  };

  const handleOnboardingCancel = () => { setShowOnboarding(false); };

  const handleSaveLowStock = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      toast.success('Pengaturan disimpan');
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 4) { toast.error('Password minimal 4 karakter'); return; }
    if (newPassword !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }
    setSavingPw(true);
    try {
      await settingsApi.setMarginsPassword(newPassword);
      toast.success('Password margin berhasil diset');
      setNewPassword(''); setConfirmPassword('');
      setHasPassword(true);
    } catch {
      toast.error('Gagal menyimpan password');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return (
    <div className="st-tab-loading">
      <Lottie animationData={lottieTree} loop autoplay style={{ width: 120, height: 120 }} />
      <p className="st-tab-loading-text">Memuat pengaturan...</p>
      <div className="st-dots"><span/><span/><span/></div>
    </div>
  );

  if (!settings) return null;

  return (
    <>
      {showOnboarding && (
        <EnhancedOnboardingPopup onStart={handleOnboardingStart} onCancel={handleOnboardingCancel} />
      )}

      <div className="st-enhanced-root">

        {/* ── Enhanced Mode Toggle ── */}
        <SectionCard
          icon={<IconZap />}
          iconBg={settings.enhanced_mode ? '#fff0e5' : '#f5f2ed'}
          iconColor={settings.enhanced_mode ? C.orange : C.sub}
          title="Enhanced Mode"
          subtitle="Aktifkan fitur manajemen stok bahan baku, kalkulasi COGS, dan halaman margin."
          action={<Toggle on={settings.enhanced_mode} onClick={handleToggleEnhanced} disabled={saving} />}
        >
          {settings.enhanced_mode ? (
            <div className="st-enhanced-active-banner">
              <div className="st-enhanced-active-dot" />
              <div>
                <p className="st-enhanced-active-title">Enhanced Mode Aktif</p>
                <p className="st-enhanced-active-sub">Stok Bahan & Margin tersedia di sidebar navigasi</p>
              </div>
              <div className="st-enhanced-active-features">
                {['Stok Bahan', 'COGS', 'Margin'].map((f, i) => (
                  <span key={i} className="st-feature-pill">
                    <IconCheck /> {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="st-enhanced-off-note">
              <IconWarning />
              <span>Enhanced Mode nonaktif. Aktifkan untuk membuka fitur stok dan margin.</span>
            </div>
          )}
        </SectionCard>

        {/* ── Low Stock Threshold ── */}
        {settings.enhanced_mode && (
          <SectionCard
            icon={<IconSettings />}
            iconBg={C.blueLight}
            iconColor={C.blue}
            title="Threshold Stok Rendah"
            subtitle="Default batas peringatan stok rendah. Bisa di-override per bahan baku."
          >
            <div className="st-low-stock-row">
              <div className="st-input-group">
                <input
                  type="number"
                  value={settings.low_stock_alert}
                  onChange={e => setSettings(s => s ? { ...s, low_stock_alert: parseInt(e.target.value) || 0 } : s)}
                  min="1"
                  className="st-input st-input--number"
                  style={{ maxWidth: 100 }}
                />
                <span className="st-input-unit">unit</span>
              </div>
              <button onClick={handleSaveLowStock} disabled={saving} className="st-btn-primary">
                {saving ? (
                  <><Lottie animationData={lottieTree} loop autoplay style={{ width: 16, height: 16 }} /> Menyimpan...</>
                ) : (
                  <><IconCheck /> Simpan</>
                )}
              </button>
            </div>
            <p className="st-field-hint">
              Bahan baku dengan stok di bawah nilai ini akan ditampilkan sebagai peringatan.
            </p>
          </SectionCard>
        )}

        {/* ── Password Margins ── */}
        {settings.enhanced_mode && !hasPassword && (
          <SectionCard
            icon={<IconLock />}
            iconBg={C.accentLight}
            iconColor={C.accent}
            title="Set Password Halaman Margin"
            subtitle="Halaman Margin dilindungi password khusus owner."
          >
            <div className="st-password-note">
              <span className="st-password-note-icon">ℹ️</span>
              <span>Setelah di-set, pengaturan ini disembunyikan dan hanya bisa diubah dari dalam halaman Margin.</span>
            </div>
            <div className="st-password-form">
              <PasswordField
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Password baru (min. 4 karakter)"
              />
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Konfirmasi password"
              />
              <button onClick={handleSetPassword} disabled={savingPw} className="st-btn-primary">
                {savingPw ? (
                  <><Lottie animationData={lottieTree} loop autoplay style={{ width: 16, height: 16 }} /> Menyimpan...</>
                ) : (
                  <><IconLock /> Set Password</>
                )}
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── Password Already Set ── */}
        {settings.enhanced_mode && hasPassword && (
          <div className="st-pw-set-card">
            <div className="st-pw-set-icon">
              <IconLockBig />
            </div>
            <div className="st-pw-set-info">
              <p className="st-pw-set-title">Password Margin Sudah Diset</p>
              <p className="st-pw-set-sub">
                Untuk mengubah password, buka halaman <strong>Margin</strong> → unlock → pilih "Ganti Password"
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ── Tab configuration ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'store',     label: 'Toko',        icon: <IconStore />,    color: '#5B8C5A', bg: '#ebf4eb' },
  { key: 'printer',   label: 'Printer',     icon: <IconPrinter />,  color: '#4AA8D8', bg: '#e8f5fb' },
  { key: 'templates', label: 'Template',    icon: <IconTemplate />, color: '#9B6DD4', bg: '#f2ecfb' },
  { key: 'enhanced',  label: 'Enhanced',    icon: <IconZap />,      color: '#e8622a', bg: '#fff3ee' },
] as const;

// ── Main Settings Page ────────────────────────────────────────────────────────
export const Settings: React.FC = () => {
  const { isAdmin, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'store' | 'printer' | 'templates' | 'enhanced'>('store');
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch logic — UNTOUCHED ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'templates') loadTemplates();
  }, [activeTab]);

  const loadTemplates = async () => {
    try {
      const data = await reportApi.getTemplates();
      setTemplates(data);
    } catch {
      toast.error('Gagal memuat template');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return (
    <div className="st-no-access">
      <div className="st-no-access-icon"><IconShield /></div>
      <h2 className="st-no-access-title">Akses Ditolak</h2>
      <p className="st-no-access-sub">Anda tidak memiliki akses ke halaman pengaturan</p>
    </div>
  );

  const currentTab = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="st-root">

      {/* ── HERO HEADER ── */}
      <div className="st-hero">
        <div className="st-hero-bg" />
        <div className="st-hero-content">
          <div className="st-hero-eyebrow">
            <IconSettings />
            <span>Konfigurasi</span>
          </div>
          <h1 className="st-title">Pengaturan</h1>
          <p className="st-subtitle">Kelola konfigurasi toko dan preferensi sistem</p>
        </div>

        {/* Active tab indicator */}
        <div className="st-hero-active-tab" style={{ background: currentTab.bg, borderColor: `${currentTab.color}30` }}>
          <div style={{ color: currentTab.color }}>{currentTab.icon}</div>
          <span style={{ color: currentTab.color, fontWeight: 700, fontSize: 13 }}>{currentTab.label}</span>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div className="st-tab-nav-wrap">
        <div className="st-tab-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`st-tab-btn ${activeTab === tab.key ? 'st-tab-btn--active' : ''}`}
              style={activeTab === tab.key ? {
                background: tab.bg,
                color: tab.color,
                borderColor: `${tab.color}30`,
              } : {}}
            >
              <span className="st-tab-icon" style={{ color: activeTab === tab.key ? tab.color : C.sub }}>
                {tab.icon}
              </span>
              <span className="st-tab-label">{tab.label}</span>
              {tab.key === 'enhanced' && (
                <span className="st-tab-zap-badge">⚡</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="st-tab-content">
        {activeTab === 'store'     && <StoreSettingsComp />}
        {activeTab === 'printer'   && <PrinterSettings />}
        {activeTab === 'templates' && (
          <TemplateSettings
            storeName={tenant?.store_name}
            logoUrl={tenant?.logo_url}
            templates={templates}
            onRefresh={loadTemplates}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'enhanced'  && <EnhancedSettings />}
      </div>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }

        @keyframes st-fade-up  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes st-card-in  { from{opacity:0;transform:scale(.9) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes st-blink    { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes st-pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── ROOT ── */
        .st-root {
          display: flex; flex-direction: column; gap: 20px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          animation: st-fade-up 0.35s ease;
        }

        /* ── HERO ── */
        .st-hero {
          background: white; border-radius: 22px; padding: 22px 24px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .st-hero-bg {
          position: absolute; top: 0; right: 0; bottom: 0; width: 35%;
          background: linear-gradient(135deg, transparent, rgba(91,140,90,0.04) 50%, rgba(91,140,90,0.07));
          pointer-events: none;
        }
        .st-hero-bg::after {
          content: ''; position: absolute; top: -30px; right: -30px;
          width: 140px; height: 140px; border-radius: 50%;
          border: 30px solid rgba(91,140,90,0.05);
        }
        .st-hero-content { position: relative; }
        .st-hero-eyebrow {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: ${C.primary};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
        }
        .st-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 800; color: #1a1612;
          letter-spacing: -0.04em; line-height: 1; margin-bottom: 4px;
        }
        .st-subtitle { font-size: 13px; color: ${C.sub}; }
        .st-hero-active-tab {
          display: flex; align-items: center; gap: 8px;
          border-radius: 12px; padding: 10px 16px;
          border: 1.5px solid; flex-shrink: 0; position: relative;
        }

        /* ── TAB NAV ── */
        .st-tab-nav-wrap {
          background: white; border-radius: 18px; padding: 8px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        }
        .st-tab-nav {
          display: flex; gap: 4px;
        }
        .st-tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 12px; border-radius: 12px; border: 1.5px solid transparent;
          cursor: pointer; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent; color: ${C.sub};
          transition: all 0.18s ease;
        }
        .st-tab-btn:hover { background: #f5f2ed; color: ${C.text}; }
        .st-tab-btn--active {
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .st-tab-icon { display: flex; align-items: center; flex-shrink: 0; }
        .st-tab-label { }
        .st-tab-zap-badge {
          font-size: 10px; margin-left: 2px;
        }

        /* ── TAB CONTENT ── */
        .st-tab-content { }

        /* ── TAB LOADING ── */
        .st-tab-loading {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 24px; gap: 8px;
        }
        .st-tab-loading-text { font-size: 14px; font-weight: 600; color: ${C.sub}; }
        .st-dots { display: flex; gap: 5px; }
        .st-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: st-blink 1.4s ease-in-out infinite;
        }
        .st-dots span:nth-child(2){animation-delay:.2s}
        .st-dots span:nth-child(3){animation-delay:.4s}

        /* ── NO ACCESS ── */
        .st-no-access {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 60vh; gap: 12px; text-align: center;
        }
        .st-no-access-icon { color: #d0c8be; }
        .st-no-access-title { font-size: 18px; font-weight: 700; color: ${C.text}; }
        .st-no-access-sub { font-size: 13px; color: ${C.sub}; }

        /* ── SECTION CARD ── */
        .st-section-card {
          background: white; border-radius: 20px; padding: 22px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .st-section-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 14px; margin-bottom: 18px;
        }
        .st-section-title-group { display: flex; align-items: flex-start; gap: 12px; flex: 1; }
        .st-section-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .st-section-title { font-size: 15px; font-weight: 700; color: ${C.text}; line-height: 1; margin-bottom: 4px; }
        .st-section-sub { font-size: 12px; color: ${C.sub}; line-height: 1.45; }
        .st-section-action { flex-shrink: 0; }
        .st-section-body { }

        /* ── TOGGLE ── */
        .st-toggle {
          position: relative; width: 52px; height: 28px;
          border-radius: 14px; border: none;
          background: #d0ccc6;
          transition: background 0.22s;
          flex-shrink: 0;
        }
        .st-toggle--on { background: ${C.primary}; box-shadow: 0 2px 8px rgba(91,140,90,0.4); }
        .st-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 22px; height: 22px; border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: left 0.22s cubic-bezier(0.34,1.1,0.64,1);
        }
        .st-toggle--on .st-toggle-thumb { left: 27px; }

        /* ── ENHANCED CONTENT ── */
        .st-enhanced-root { display: flex; flex-direction: column; gap: 16px; }

        .st-enhanced-active-banner {
          display: flex; align-items: center; gap: 12px;
          background: ${C.primaryLight}; border-radius: 12px; padding: 14px 16px;
          border: 1px solid rgba(91,140,90,0.2);
          flex-wrap: wrap;
        }
        .st-enhanced-active-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${C.primary}; flex-shrink: 0;
          animation: st-pulse 2s ease-in-out infinite;
        }
        .st-enhanced-active-title { font-size: 13px; font-weight: 700; color: ${C.primaryDark}; }
        .st-enhanced-active-sub { font-size: 11.5px; color: ${C.primary}; margin-top: 2px; }
        .st-enhanced-active-features {
          display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto;
        }
        .st-feature-pill {
          display: flex; align-items: center; gap: 4px;
          background: white; color: ${C.primary};
          border: 1px solid rgba(91,140,90,0.25);
          border-radius: 20px; padding: 3px 10px;
          font-size: 11px; font-weight: 700;
        }

        .st-enhanced-off-note {
          display: flex; align-items: center; gap: 8px;
          background: #f9f8f5; border-radius: 10px; padding: 12px 14px;
          font-size: 12.5px; color: ${C.sub}; border: 1px solid #f0ede8;
        }
        .st-enhanced-off-note svg { color: ${C.accent}; flex-shrink: 0; }

        /* Low stock */
        .st-low-stock-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
        .st-input-group { display: flex; align-items: center; gap: 8px; }
        .st-input-unit { font-size: 13px; color: ${C.sub}; font-weight: 500; }
        .st-field-hint { font-size: 12px; color: ${C.sub}; }

        /* Password */
        .st-password-note {
          display: flex; align-items: flex-start; gap: 8px;
          background: ${C.accentLight}; border-radius: 10px; padding: 11px 13px;
          font-size: 12.5px; color: #8a6010; margin-bottom: 14px;
          border: 1px solid rgba(232,162,58,0.2);
        }
        .st-password-note-icon { flex-shrink: 0; font-size: 14px; }
        .st-password-form { display: flex; flex-direction: column; gap: 10px; max-width: 340px; }

        /* Password already set */
        .st-pw-set-card {
          display: flex; align-items: center; gap: 16px;
          background: #faf9f6; border-radius: 18px; padding: 20px 22px;
          border: 1.5px dashed #e8e4dc;
        }
        .st-pw-set-icon { color: ${C.sub}; flex-shrink: 0; }
        .st-pw-set-title { font-size: 14px; font-weight: 700; color: ${C.text}; margin-bottom: 4px; }
        .st-pw-set-sub { font-size: 12px; color: ${C.sub}; }

        /* ── INPUTS ── */
        .st-input {
          width: 100%; padding: 10px 12px; border-radius: 10px;
          border: 1.5px solid #e8e4dc; font-size: 13px; color: ${C.text};
          background: #faf9f6; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .st-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(91,140,90,0.1); }
        .st-input--number { text-align: center; }

        /* ── BUTTONS ── */
        .st-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary});
          color: white; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(91,140,90,0.28);
          transition: all 0.2s; white-space: nowrap;
        }
        .st-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,140,90,0.35); }
        .st-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .st-btn-primary--lg { padding: 13px 24px; font-size: 14px; border-radius: 12px; flex: 2; justify-content: center; }

        .st-btn-cancel {
          padding: 10px 20px; border-radius: 11px;
          border: 1.5px solid #e8e4dc; background: white; color: ${C.sub};
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s;
        }
        .st-btn-cancel:hover { background: #f5f2ed; color: ${C.text}; }
        .st-btn-cancel--lg { padding: 13px 24px; font-size: 14px; border-radius: 12px; flex: 1; }

        /* ── ONBOARDING POPUP ── */
        .st-popup-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; padding: 20px;
        }
        .st-popup-card {
          background: white; border-radius: 24px;
          width: 100%; max-width: 460px;
          box-shadow: 0 28px 72px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: st-card-in 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .st-popup-header {
          background: linear-gradient(135deg, #2d3d26, #3d5438, #5B8C5A);
          padding: 32px; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .st-popup-header-deco {
          position: absolute; top: -30px; right: -30px;
          width: 120px; height: 120px; border-radius: 50%;
          background: rgba(255,255,255,0.07);
        }
        .st-popup-header-deco2 {
          position: absolute; bottom: -20px; left: -20px;
          width: 90px; height: 90px; border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .st-popup-icon-wrap {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          color: #ffd166; position: relative; z-index: 1;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .st-popup-icon-wrap svg { width: 32px; height: 32px; }
        .st-popup-body { padding: 28px 28px 32px; }
        .st-popup-title {
          font-family: 'Sora', sans-serif;
          font-size: 20px; font-weight: 800; color: ${C.text};
          letter-spacing: -0.03em; margin-bottom: 10px; text-align: center;
        }
        .st-popup-desc {
          font-size: 14px; color: ${C.sub}; line-height: 1.65;
          text-align: center; margin-bottom: 18px;
        }
        .st-popup-features {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
        }
        .st-popup-feature {
          display: flex; align-items: center; gap: 10px;
          background: ${C.primaryLight}; border-radius: 10px; padding: 10px 14px;
          font-size: 13px; font-weight: 600; color: ${C.primaryDark};
          border: 1px solid rgba(91,140,90,0.15);
        }
        .st-popup-warning {
          display: flex; align-items: center; gap: 8px;
          background: ${C.accentLight}; border-radius: 10px; padding: 11px 14px;
          font-size: 12.5px; color: #8a6010; font-weight: 600;
          margin-bottom: 22px; border: 1px solid rgba(232,162,58,0.2);
        }
        .st-popup-warning svg { color: ${C.accent}; flex-shrink: 0; }
        .st-popup-actions { display: flex; gap: 10px; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1024px) {
          .st-tab-label { font-size: 12px; }
          .st-hero { flex-direction: column; align-items: flex-start; gap: 14px; }
          .st-hero-active-tab { align-self: flex-start; }
        }
        @media (max-width: 767px) {
          .st-root { gap: 14px; }
          .st-hero { padding: 16px 18px; border-radius: 18px; }
          .st-title { font-size: 20px; }
          .st-tab-nav-wrap { padding: 6px; border-radius: 16px; }
          .st-tab-btn { padding: 9px 8px; font-size: 12px; border-radius: 10px; }
          .st-tab-label { display: none; }
          .st-tab-btn { flex-direction: column; gap: 3px; }
          .st-tab-icon { }
          .st-section-card { padding: 16px 18px; border-radius: 16px; }
          .st-section-header { flex-direction: column; gap: 12px; }
          .st-section-action { align-self: flex-end; }
          .st-enhanced-active-banner { flex-direction: column; align-items: flex-start; }
          .st-enhanced-active-features { margin-left: 0; }
          .st-popup-card { border-radius: 20px; }
          .st-popup-body { padding: 22px 20px 26px; }
          .st-popup-actions { flex-direction: column; }
          .st-btn-primary--lg, .st-btn-cancel--lg { flex: none; width: 100%; }
        }
        @media (max-width: 479px) {
          .st-hero { padding: 14px 16px; border-radius: 16px; }
          .st-title { font-size: 18px; }
          .st-tab-btn { padding: 8px 6px; }
          .st-section-card { padding: 14px 16px; border-radius: 14px; }
          .st-low-stock-row { flex-direction: column; align-items: flex-start; }
          .st-password-form { max-width: 100%; }
          .st-pw-set-card { flex-direction: column; text-align: center; }
        }

        /* Tablet landscape */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .st-hero { flex-direction: row; }
          .st-tab-label { display: inline; }
          .st-tab-btn { flex-direction: row; }
        }
      `}</style>
    </div>
  );
};