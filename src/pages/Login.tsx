import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

// Register GSAP plugins
gsap.registerPlugin(MorphSVGPlugin);

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Cat Barista Character with Yeti Animation ────────────────────────────────
const CatBarista: React.FC<{
  pupilOffset: { x: number; y: number };
  isCovering: boolean;
}> = ({ pupilOffset, isCovering }) => {

  const pawLeftY = isCovering ? 30 : 0;
  const pawRightY = isCovering ? 30 : 0;

  return (
    <svg viewBox="0 0 240 160" width="100%" height="100%" style={{overflow:'visible'}}>

      <defs>
        <radialGradient id="fur" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e9e1d2"/>
          <stop offset="100%" stopColor="#c9b89a"/>
        </radialGradient>

        <radialGradient id="inner" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f5ede0"/>
          <stop offset="100%" stopColor="#e3d3bb"/>
        </radialGradient>

        <filter id="shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      <g filter="url(#shadow)">

        {/* head */}
        <ellipse cx="120" cy="90" rx="70" ry="64" fill="url(#fur)" />

        {/* ears */}
        <polygon points="60,48 45,18 82,42" fill="url(#fur)" />
        <polygon points="180,48 195,18 158,42" fill="url(#fur)" />

        {/* inner ears */}
        <polygon points="62,46 53,26 75,41" fill="#e8a090" opacity=".6"/>
        <polygon points="178,46 187,26 165,41" fill="#e8a090" opacity=".6"/>

        {/* face patch */}
        <ellipse cx="120" cy="108" rx="34" ry="26" fill="url(#inner)" />

        {/* eyes */}
        {!isCovering && (
        <>
          <ellipse cx="95" cy="82" rx="15" ry="16" fill="white"/>
          <ellipse cx="145" cy="82" rx="15" ry="16" fill="white"/>

          <circle cx={95 + pupilOffset.x} cy={82 + pupilOffset.y} r="8" fill="#1f2418"/>
          <circle cx={145 + pupilOffset.x} cy={82 + pupilOffset.y} r="8" fill="#1f2418"/>

          <circle cx={98 + pupilOffset.x * .4} cy={78 + pupilOffset.y * .4} r="3" fill="white"/>
          <circle cx={148 + pupilOffset.x * .4} cy={78 + pupilOffset.y * .4} r="3" fill="white"/>
        </>
        )}

        {/* closed eyes when covering */}
        {isCovering && (
        <>
          <path d="M80 82 Q95 74 110 82" stroke="#5a6a48" strokeWidth="3" fill="none"/>
          <path d="M130 82 Q145 74 160 82" stroke="#5a6a48" strokeWidth="3" fill="none"/>
        </>
        )}

        {/* nose */}
        <polygon points="120,100 114,107 126,107" fill="#d08878"/>

        {/* friendly smile */}
        <path d="M110 112 Q120 120 130 112" stroke="#b06858" strokeWidth="2.5" fill="none"/>

      </g>

      {/* paws resting on card */}
      <g transform={`translate(0 ${pawLeftY})`} style={{transition:'transform .4s ease'}}>
        <circle cx="85" cy="140" r="16" fill="url(#fur)" />
      </g>

      <g transform={`translate(0 ${pawRightY})`} style={{transition:'transform .4s ease'}}>
        <circle cx="155" cy="140" r="16" fill="url(#fur)" />
      </g>

    </svg>
  );
};

// ─── SVG Icons (sama seperti sebelumnya) ─────────────────────────────────────
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  const currentOffset = useRef({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>();

  const animatePupil = useCallback(() => {
    const dx = targetOffset.current.x - currentOffset.current.x;
    const dy = targetOffset.current.y - currentOffset.current.y;
    if (Math.abs(dx) > 0.04 || Math.abs(dy) > 0.04) {
      currentOffset.current.x += dx * 0.09;
      currentOffset.current.y += dy * 0.09;
      setPupilOffset({ x: currentOffset.current.x, y: currentOffset.current.y });
      animFrameRef.current = requestAnimationFrame(animatePupil);
    } else {
      currentOffset.current = { ...targetOffset.current };
      setPupilOffset({ ...targetOffset.current });
    }
  }, []);

  const updatePupil = useCallback((text: string) => {
  const ratio = Math.min(text.length / 24, 1)

  targetOffset.current = {
    x: -4 + ratio * 8,
    y: 0
  }

  cancelAnimationFrame(animFrameRef.current!)
  animFrameRef.current = requestAnimationFrame(animatePupil)
}, [animatePupil]);

  const resetPupil = useCallback(() => {
    targetOffset.current = { x: 0, y: 0 };
    cancelAnimationFrame(animFrameRef.current!);
    animFrameRef.current = requestAnimationFrame(animatePupil);
  }, [animatePupil]);

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current!), []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { ref: emailFormRef, onChange: emailOnChange, ...emailRest } = register('email');

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      setIsSuccess(true);
      toast.success('Login berhasil!');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch {
      toast.error('Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 40px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflow: 'hidden',
    }}>

      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('https://res.cloudinary.com/doafwrddd/image/upload/v1772881408/002883500_1732602759-fnb-apa_vts0bs.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(6px) brightness(0.65) saturate(0.85)',
        transform: 'scale(1.06)',
        zIndex: 0,
      }} />

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(30,40,20,0.55) 0%, rgba(60,75,40,0.4) 50%, rgba(20,30,15,0.6) 100%)',
        zIndex: 1,
      }} />

      {/* Card container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', zIndex: 2 }}>

        {/* Cat peeking from top */}
        <div style={{
          position: 'absolute',
          top: '-72px',
          left: '50%',
          transform: `translateX(-50%) ${isPasswordFocused ? 'translateY(12px)' : isSuccess ? 'translateY(-8px) rotate(3deg)' : 'translateY(0)'}`,
          transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 10,
          width: '200px',
        }}>
          <CatBarista
            pupilOffset={isPasswordFocused ? { x: 0, y: 0 } : pupilOffset}
            isCovering={isPasswordFocused}
            isHappy={isSuccess}
            emailValue={emailValue}
            isEmailFocused={emailFocused && !isPasswordFocused}
          />

          {isPasswordFocused && (
            <div style={{
              position: 'absolute', top: '16px', right: '-88px',
              background: 'white', borderRadius: '12px 12px 12px 4px',
              padding: '7px 12px', fontSize: '12px', fontWeight: '600',
              color: '#4a5a38', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              zIndex: 20, border: '1px solid rgba(107,125,88,0.15)',
            }}>
              🐾 Ga liat, janji!
            </div>
          )}
          {isSuccess && (
            <div style={{
              position: 'absolute', top: '16px', right: '-96px',
              background: '#5a7040', borderRadius: '12px 12px 12px 4px',
              padding: '7px 12px', fontSize: '12px', fontWeight: '600',
              color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              zIndex: 20,
            }}>
              ☕ Nyam nyam~
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.93)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '64px 40px 40px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.6)',
          position: 'relative', zIndex: 2,
        }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="https://res.cloudinary.com/doafwrddd/image/upload/v1772867278/MODU_jdtl6j.png"
              alt="MODU"
              style={{ height: '26px', objectFit: 'contain', marginBottom: '8px' }}
            />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2e3828', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Selamat Datang Kembali
            </h2>
            <p style={{ color: '#8a9278', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <LeafIcon /> Manage bisnis kamu hari ini
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: emailFocused ? '#5a7040' : '#9a9888',
                  transition: 'color 0.2s', display: 'flex', alignItems: 'center',
                }}>
                  <EmailIcon />
                </span>
                <input
                  type="email"
                  placeholder="admin@warung.com"
                  style={{
                    ...inputStyle(!!errors.email),
                    paddingLeft: '42px',
                    borderColor: emailFocused ? '#7a9060' : errors.email ? '#d07060' : '#ddd8cc',
                    boxShadow: emailFocused ? '0 0 0 3px rgba(107,125,88,0.12)' : 'none',
                  }}
                  {...emailRest}
                  ref={emailFormRef}
                  onChange={(e) => { 
                    emailOnChange(e); 
                    setEmailValue(e.target.value);
                    updatePupil(e.target.value); 
                  }}
                  onFocus={(e) => { 
                    setEmailFocused(true); 
                    updatePupil(e.target.value);
                  }}
                  onBlur={() => { 
                    setEmailFocused(false); 
                    resetPupil();
                  }}
                />
              </div>
              {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: passwordFocused ? '#5a7040' : '#9a9888',
                  transition: 'color 0.2s', display: 'flex', alignItems: 'center',
                }}>
                  <LockIcon />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{
                    ...inputStyle(!!errors.password),
                    paddingLeft: '42px',
                    borderColor: passwordFocused ? '#7a9060' : errors.password ? '#d07060' : '#ddd8cc',
                    boxShadow: passwordFocused ? '0 0 0 3px rgba(107,125,88,0.12)' : 'none',
                  }}
                  {...register('password')}
                  onFocus={() => { 
                    setPasswordFocused(true); 
                    setIsPasswordFocused(true); 
                  }}
                  onBlur={() => { 
                    setPasswordFocused(false); 
                    setIsPasswordFocused(false); 
                  }}
                />
              </div>
              {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%', padding: '13px 20px',
                background: isSuccess
                  ? '#5a7040'
                  : isLoading ? '#b8c4a8'
                  : 'linear-gradient(135deg, #5a7040 0%, #7a9060 100%)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(90,112,64,0.4)',
                letterSpacing: '0.01em', transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {isLoading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Masuk...
                </>
              ) : isSuccess ? (
                <><CheckIcon /> Berhasil!</>
              ) : (
                <>Masuk <ArrowIcon /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d8d4c8)' }} />
            <span style={{ fontSize: '11px', color: '#b0a898', fontWeight: '500' }}>atau</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #d8d4c8)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#8a9278', margin: 0 }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{
              color: '#5a7040', fontWeight: '700', textDecoration: 'none',
              borderBottom: '1.5px solid rgba(90,112,64,0.3)', paddingBottom: '1px',
            }}>
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.6)',
          marginTop: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <LeafIcon /> MODU · Manage Your Business
        </p>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
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
  color: '#5a6848', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
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
  marginTop: '5px', display: 'flex',
  alignItems: 'center', gap: '4px',
};