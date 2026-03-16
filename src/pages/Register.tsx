import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import PitikAnim from '../assets/Pitik.json';

const registerSchema = z.object({
  store_name: z.string().min(3, 'Nama toko minimal 3 karakter'),
  admin_name: z.string().min(3, 'Nama admin minimal 3 karakter'),
  admin_email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string().min(6, 'Password minimal 6 karakter'),
  license_key: z.string().min(1, 'License key diperlukan'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const StoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const KeyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const LeafIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Field wrapper with icon ──────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ label, icon, error, children }) => (
  <div>
    <label style={labelStyle}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#5a6848' }}>
        {icon} {label}
      </span>
    </label>
    {children}
    {error && (
      <span style={errorStyle}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        {error}
      </span>
    )}
  </div>
);

// ─── Register Page ────────────────────────────────────────────────────────────
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authApi.register({
        store_name: data.store_name,
        admin_name: data.admin_name,
        admin_email: data.admin_email,
        password: data.password,
        license_key: data.license_key,
      });
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch {
      toast.error('Registrasi gagal. Periksa kembali data dan license key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #f7f4ee 0%, #eee8da 40%, #e4ddd0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,125,88,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,163,130,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '880px', display: 'flex', gap: '28px', alignItems: 'stretch' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          flex: '0 0 320px',
          background: 'linear-gradient(160deg, #3d4a2e 0%, #5a7040 55%, #7a9060 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(61,74,46,0.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          {/* Logo */}
          <img
            src="https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png"
            alt="MODU"
            style={{ height: '32px', objectFit: 'contain', marginBottom: '4px', filter: 'brightness(0) invert(1)' }}
          />

          {/* Lottie */}
          <div style={{ width: '200px', height: '200px', margin: '8px 0' }}>
            <Lottie animationData={PitikAnim} loop={true} />
          </div>

          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.4 }}>
            Selamat Datang di MODU!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>
            Manage Your Business,<br />Grow With MODU 🌱
          </p>

          {/* Feature list */}
          {[
            { icon: <StoreIcon />, text: 'Kelola menu & stok' },
            { icon: <ShieldCheckIcon />, text: 'Laporan real-time' },
            { icon: <LeafIcon />, text: 'Ramah & mudah dipakai' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px 14px',
              marginBottom: '8px', width: '100%',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>{item.text}</span>
            </div>
          ))}

          {/* License tag */}
          <div style={{
            marginTop: '16px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '8px 16px',
            fontSize: '12px', color: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <KeyIcon /> Butuh license key untuk akses  
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(60,70,45,0.1)',
          border: '1px solid rgba(200,210,180,0.35)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#2e3828', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Ayo berkembang bersama MODU!
          </h1>
          <p style={{ color: '#8a9278', fontSize: '13px', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LeafIcon /> Isi data di bawah buat mulai pake MODU
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Nama Usaha Kamu" icon={<StoreIcon />} error={errors.store_name?.message}>
                <input placeholder="PT Pencari Cinta Sejati" style={inputStyle(!!errors.store_name)} {...register('store_name')} />
              </Field>
              <Field label="Nama Admin" icon={<UserIcon />} error={errors.admin_name?.message}>
                <input placeholder="Pria Solo" style={inputStyle(!!errors.admin_name)} {...register('admin_name')} />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email" icon={<EmailIcon />} error={errors.admin_email?.message}>
              <input type="email" placeholder="admin@warmindo.com" style={inputStyle(!!errors.admin_email)} {...register('admin_email')} />
            </Field>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Password" icon={<LockIcon />} error={errors.password?.message}>
                <input type="password" placeholder="••••••" style={inputStyle(!!errors.password)} {...register('password')} />
              </Field>
              <Field label="Konfirmasi Password" icon={<ShieldCheckIcon />} error={errors.confirm_password?.message}>
                <input type="password" placeholder="••••••" style={inputStyle(!!errors.confirm_password)} {...register('confirm_password')} />
              </Field>
            </div>

            {/* License Key */}
            <Field label="License Key" icon={<KeyIcon />} error={errors.license_key?.message}>
              <input
                placeholder="MODU-XXXX-XXXX-XXXX"
                style={{
                  ...inputStyle(!!errors.license_key),
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
                  background: errors.license_key ? '#fdf5f3' : '#f5f8f2',
                  borderColor: errors.license_key ? '#d07060' : '#c8d4b8',
                }}
                {...register('license_key')}
              />
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px', width: '100%', padding: '13px 20px',
                background: isLoading
                  ? '#b8c4a8'
                  : 'linear-gradient(135deg, #3d4a2e 0%, #5a7040 55%, #7a9060 100%)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(61,74,46,0.35)',
                letterSpacing: '0.01em',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {isLoading ? <><SpinnerIcon /> Mendaftarkan...</> : <>Daftar Sekarang <ArrowRightIcon /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d8d4c8)' }} />
            <span style={{ fontSize: '11px', color: '#b0a898', fontWeight: '500' }}>atau</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #d8d4c8)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8a9278', margin: 0 }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{
              color: '#5a7040', fontWeight: '700', textDecoration: 'none',
              borderBottom: '1.5px solid rgba(90,112,64,0.3)', paddingBottom: '1px',
            }}>
              Login di sini
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px', fontWeight: '600',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${hasError ? '#d07060' : '#ddd8cc'}`,
  borderRadius: '10px',
  fontSize: '14px', color: '#2e3828',
  background: hasError ? '#fdf5f3' : '#faf9f6',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
});

const errorStyle: React.CSSProperties = {
  fontSize: '11px', color: '#c06050',
  marginTop: '5px',
  display: 'flex', alignItems: 'center', gap: '4px',
};