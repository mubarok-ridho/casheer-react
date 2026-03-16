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
  isHappy: boolean;
  emailValue: string;
  isEmailFocused: boolean;
}> = ({ pupilOffset, isCovering, isHappy, emailValue, isEmailFocused }) => {
  
  // Refs for animated elements
  const faceRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGEllipseElement>(null);
  const eyeRRef = useRef<SVGEllipseElement>(null);
  const noseRef = useRef<SVGPolygonElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const mouthBGRef = useRef<SVGPathElement>(null);
  const toothRef = useRef<SVGCircleElement>(null);
  const tongueRef = useRef<SVGEllipseElement>(null);
  const earLRef = useRef<SVGPolygonElement>(null);
  const earRRef = useRef<SVGPolygonElement>(null);
  const whiskersRef = useRef<SVGGElement>(null);
  
  // Mouth states for morphing
  const [mouthStatus, setMouthStatus] = useState<"small" | "medium" | "large">("small");
  
  // Yeti-inspired mouth paths
  const mouthSmallPath = "M 114 107 Q 110 114 104 111 M 126 107 Q 130 114 136 111";
  const mouthMediumPath = "M 114 107 Q 110 116 104 112 M 126 107 Q 130 116 136 112";
  const mouthLargePath = "M 108 113 Q 120 122 132 113";
  
  // Animate based on email input
  useEffect(() => {
    if (!isEmailFocused) {
      // Reset when not focused
      if (mouthStatus !== "small") {
        setMouthStatus("small");
        
        // Animate mouth back to small
        gsap.to([mouthRef.current, mouthBGRef.current], {
          duration: 1,
          attr: { d: mouthSmallPath },
          ease: "expo.out"
        });
        
        // Reset tooth and tongue
        gsap.to(toothRef.current, {
          duration: 1,
          x: 0,
          y: 0,
          ease: "expo.out"
        });
        
        gsap.to(tongueRef.current, {
          duration: 1,
          y: 0,
          ease: "expo.out"
        });
        
        // Reset eyes size
        gsap.to([eyeLRef.current, eyeRRef.current], {
          duration: 1,
          attr: { rx: 13, ry: 14 },
          scale: 1,
          ease: "expo.out"
        });
      }
      return;
    }
    
    const value = emailValue;
    const curEmailIndex = value.length;
    
    if (curEmailIndex > 0) {
      if (mouthStatus === "small") {
        setMouthStatus("medium");
        
        gsap.to([mouthRef.current, mouthBGRef.current], {
          duration: 1,
          attr: { d: mouthMediumPath },
          ease: "expo.out"
        });
        
        gsap.to(toothRef.current, {
          duration: 1,
          x: 0,
          y: 0,
          ease: "expo.out"
        });
        
        gsap.to(tongueRef.current, {
          duration: 1,
          y: 1,
          ease: "expo.out"
        });
        
        gsap.to([eyeLRef.current, eyeRRef.current], {
          duration: 1,
          attr: { rx: 11, ry: 12 },
          scale: 0.85,
          ease: "expo.out"
        });
      }
      
      if (value.includes('@')) {
        if (mouthStatus !== "large") {
          setMouthStatus("large");
          
          gsap.to([mouthRef.current, mouthBGRef.current], {
            duration: 1,
            attr: { d: mouthLargePath },
            ease: "expo.out"
          });
          
          gsap.to(toothRef.current, {
            duration: 1,
            x: 3,
            y: -2,
            ease: "expo.out"
          });
          
          gsap.to(tongueRef.current, {
            duration: 1,
            y: 2,
            ease: "expo.out"
          });
          
          gsap.to([eyeLRef.current, eyeRRef.current], {
            duration: 1,
            attr: { rx: 8.5, ry: 9 },
            scale: 0.65,
            ease: "expo.out",
            transformOrigin: "center center"
          });
        }
      } else if (mouthStatus !== "medium") {
        setMouthStatus("medium");
        
        gsap.to([mouthRef.current, mouthBGRef.current], {
          duration: 1,
          attr: { d: mouthMediumPath },
          ease: "expo.out"
        });
        
        gsap.to(toothRef.current, {
          duration: 1,
          x: 0,
          y: 0,
          ease: "expo.out"
        });
        
        gsap.to(tongueRef.current, {
          duration: 1,
          y: 1,
          ease: "expo.out"
        });
        
        gsap.to([eyeLRef.current, eyeRRef.current], {
          duration: 1,
          attr: { rx: 11, ry: 12 },
          scale: 0.85,
          ease: "expo.out"
        });
      }
    } else {
      if (mouthStatus !== "small") {
        setMouthStatus("small");
        
        gsap.to([mouthRef.current, mouthBGRef.current], {
          duration: 1,
          attr: { d: mouthSmallPath },
          ease: "expo.out"
        });
        
        gsap.to(toothRef.current, {
          duration: 1,
          x: 0,
          y: 0,
          ease: "expo.out"
        });
        
        gsap.to(tongueRef.current, {
          duration: 1,
          y: 0,
          ease: "expo.out"
        });
        
        gsap.to([eyeLRef.current, eyeRRef.current], {
          duration: 1,
          attr: { rx: 13, ry: 14 },
          scale: 1,
          ease: "expo.out"
        });
      }
    }
  }, [emailValue, isEmailFocused, mouthStatus]);
  
  // Animate face based on pupil position (Yeti-style head movement)
  useEffect(() => {
    if (!faceRef.current || isCovering) return;
    
    // Calculate head tilt based on pupil offset
    const headTiltX = pupilOffset.x * 0.3;
    const headTiltY = pupilOffset.y * 0.4;
    const headSkew = pupilOffset.x * 0.5;
    
    gsap.to(faceRef.current, {
      duration: 1,
      x: -headTiltX,
      y: -headTiltY,
      skewX: -headSkew,
      transformOrigin: "center top",
      ease: "expo.out"
    });
    
    // Animate ears
    gsap.to([earLRef.current, earRRef.current], {
      duration: 1,
      x: pupilOffset.x * 0.2,
      y: pupilOffset.y * 0.3,
      rotation: pupilOffset.x * 0.5,
      ease: "expo.out"
    });
    
    // Animate whiskers
    gsap.to(whiskersRef.current, {
      duration: 1,
      x: pupilOffset.x * 0.1,
      y: pupilOffset.y * 0.1,
      skewX: pupilOffset.x * 0.3,
      ease: "expo.out"
    });
    
  }, [pupilOffset, isCovering]);
  
  return (
    <svg viewBox="0 0 240 160" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="catBodyG" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e8dfd0" />
          <stop offset="100%" stopColor="#c8b99a" />
        </radialGradient>
        <radialGradient id="catInnerG" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f5ede0" />
          <stop offset="100%" stopColor="#e0cdb5" />
        </radialGradient>
        <radialGradient id="cheekG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8a090" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8a090" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hatG" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#6b7d58" />
          <stop offset="100%" stopColor="#3d4a2e" />
        </radialGradient>
        <radialGradient id="pawG" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ddd0bb" />
          <stop offset="100%" stopColor="#b8a888" />
        </radialGradient>
        <filter id="catShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(60,70,45,0.22)" />
        </filter>
      </defs>

      <g filter="url(#catShadow)">
        {/* Hat */}
        <ellipse cx="120" cy="28" rx="52" ry="10" fill="#3d4a2e" />
        <rect x="80" y="0" width="80" height="30" rx="6" fill="url(#hatG)" />
        <rect x="80" y="22" width="80" height="8" rx="2" fill="#2c3620" />
        <rect x="84" y="4" width="30" height="14" rx="4" fill="rgba(255,255,255,0.1)" />
        
        {/* Main face group */}
        <g ref={faceRef}>
          <ellipse cx="120" cy="90" rx="72" ry="68" fill="url(#catBodyG)" />
          
          {/* Ears */}
          <polygon ref={earLRef} points="58,48 44,18 80,42" fill="url(#catBodyG)" />
          <polygon points="62,46 52,26 76,42" fill="#e8a090" opacity="0.6" />
          <polygon ref={earRRef} points="182,48 196,18 160,42" fill="url(#catBodyG)" />
          <polygon points="178,46 188,26 164,42" fill="#e8a090" opacity="0.6" />
          
          <ellipse cx="120" cy="108" rx="36" ry="28" fill="url(#catInnerG)" />

          {/* Eyes */}
          {!isCovering && (
            <g>
              <ellipse cx="96" cy="82" rx="15" ry="16" fill="white" />
              <ellipse ref={eyeLRef} cx="96" cy="82" rx="13" ry="14" fill="#7a9e6a" />
              <ellipse cx={96 + pupilOffset.x} cy={82 + pupilOffset.y} rx="7" ry="9" fill="#1a2212" />
              <circle cx={98 + pupilOffset.x * 0.4} cy={78 + pupilOffset.y * 0.4} r="3" fill="white" opacity="0.9" />
              <ellipse cx="96" cy="68" rx="15" ry="7" fill="url(#catBodyG)" />
              
              <ellipse cx="144" cy="82" rx="15" ry="16" fill="white" />
              <ellipse ref={eyeRRef} cx="144" cy="82" rx="13" ry="14" fill="#7a9e6a" />
              <ellipse cx={144 + pupilOffset.x} cy={82 + pupilOffset.y} rx="7" ry="9" fill="#1a2212" />
              <circle cx={146 + pupilOffset.x * 0.4} cy={78 + pupilOffset.y * 0.4} r="3" fill="white" opacity="0.9" />
              <ellipse cx="144" cy="68" rx="15" ry="7" fill="url(#catBodyG)" />
            </g>
          )}

          {/* Covered eyes */}
          {isCovering && (
            <g>
              <path d="M 81 82 Q 96 73 111 82" stroke="#5a6a48" strokeWidth="3" fill="none" strokeLinecap="round" />
              <line x1="86" y1="80" x2="84" y2="74" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
              <line x1="96" y1="76" x2="96" y2="70" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
              <line x1="106" y1="80" x2="108" y2="74" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
              <path d="M 129 82 Q 144 73 159 82" stroke="#5a6a48" strokeWidth="3" fill="none" strokeLinecap="round" />
              <line x1="134" y1="80" x2="132" y2="74" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
              <line x1="144" y1="76" x2="144" y2="70" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
              <line x1="154" y1="80" x2="156" y2="74" stroke="#5a6a48" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Nose */}
          <polygon ref={noseRef} points="120,100 114,107 126,107" fill="#d08878" />

          {/* Mouth and tongue */}
          <path ref={mouthRef} d={isHappy ? "M 108 113 Q 120 122 132 113" : mouthStatus === "small" ? mouthSmallPath : mouthStatus === "medium" ? mouthMediumPath : mouthLargePath} stroke="#b06858" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          {/* Hidden BG path for morphing (same as mouth) */}
          <path ref={mouthBGRef} d={mouthStatus === "small" ? mouthSmallPath : mouthStatus === "medium" ? mouthMediumPath : mouthLargePath} fill="none" opacity="0" />
          
          {/* Tooth */}
          <circle ref={toothRef} cx="120" cy="107" r="2" fill="#ffffff" />
          
          {/* Tongue */}
          {isHappy && (
            <ellipse ref={tongueRef} cx="120" cy="114" rx="6" ry="3" fill="#cc4a6c" opacity="0.8" />
          )}

          {/* Cheeks */}
          <ellipse cx="78" cy="98" rx="16" ry="11" fill="url(#cheekG)" />
          <ellipse cx="162" cy="98" rx="16" ry="11" fill="url(#cheekG)" />
          
          {/* Whiskers group */}
          <g ref={whiskersRef}>
            <line x1="60" y1="100" x2="96" y2="104" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="58" y1="108" x2="96" y2="108" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="60" y1="116" x2="96" y2="112" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="180" y1="100" x2="144" y2="104" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="182" y1="108" x2="144" y2="108" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="180" y1="116" x2="144" y2="112" stroke="#9a8878" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
          </g>
          
          <ellipse cx="120" cy="158" rx="60" ry="22" fill="url(#catBodyG)" />
          <polygon points="108,148 120,154 108,160" fill="#5a7040" />
          <polygon points="132,148 120,154 132,160" fill="#5a7040" />
          <circle cx="120" cy="154" r="4" fill="#3d4a2e" />
        </g>
      </g>

      {/* Covering paw */}
      {isCovering && (
        <g>
          <path d="M 165 155 Q 172 130 162 108 Q 156 94 148 84" stroke="url(#pawG)" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="147" cy="82" r="14" fill="url(#pawG)" />
          <circle cx="138" cy="74" r="7" fill="url(#pawG)" />
          <circle cx="148" cy="70" r="7" fill="url(#pawG)" />
          <circle cx="158" cy="74" r="7" fill="url(#pawG)" />
          <ellipse cx="147" cy="85" rx="8" ry="6" fill="#d4a898" opacity="0.5" />
        </g>
      )}
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