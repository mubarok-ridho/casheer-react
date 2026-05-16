import React, { useState, useEffect, useRef, useCallback } from 'react';

import Lottie from 'lottie-react';
import loadkucing from '../assets/loadkucing.json';
import { useParams } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuImage    { id: number; image_url: string; is_primary: boolean; }
interface MenuVariation { id: number; name: string; option: string; price: number; }
interface Category     { id: number; name: string; }
interface MenuItem {
  id: number; name: string; description: string;
  base_price: number; prep_time: number; is_available: boolean;
  category: Category | null; images: MenuImage[]; variations: MenuVariation[];
}
interface PromoItem { id: number; menu_id: number; quantity: number; menu: MenuItem; }
interface Promo {
  id: number; name: string; description: string;
  promo_price: number; image_url: string; unavailable_reason?: string;
  is_active: boolean; start_at: string; end_at: string | null;
  items: PromoItem[];
}
interface TenantInfo { store_name: string; logo_url: string; store_address?: string; }

const API = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const TagIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ClockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapPinIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronDownIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const GiftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const UtensilsIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const SparkleIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>;


const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ─── Countdown ────────────────────────────────────────────────────────────────
const Countdown: React.FC<{ endAt: string }> = ({ endAt }) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [endAt]);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', marginRight: 2, fontWeight: 600 }}>⏱ Berakhir dalam</span>
      {t.d > 0 && <TimeBox val={pad(t.d)} lbl="hari" />}
      <TimeBox val={pad(t.h)} lbl="jam" />
      <Sep /><TimeBox val={pad(t.m)} lbl="mnt" />
      <Sep /><TimeBox val={pad(t.s)} lbl="dtk" />
    </div>
  );
};
const TimeBox: React.FC<{ val: string; lbl: string }> = ({ val, lbl }) => (
  <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: 6, padding: '3px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 34 }}>
    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{val}</span>
    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1, marginTop: 1 }}>{lbl}</span>
  </div>
);
const Sep = () => <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 800, fontSize: 14 }}>:</span>;

// ─── Image Swiper ──────────────────────────────────────────────────────────────
const ImageSwiper: React.FC<{ images: MenuImage[]; height?: number }> = ({ images, height = 280 }) => {
  const [idx, setIdx] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; dragging.current = true; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (!dragging.current) return; dragging.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  };
  const onMouseDown  = (e: React.MouseEvent) => { startX.current = e.clientX; dragging.current = true; };
  const onMouseUp    = (e: React.MouseEvent) => {
    if (!dragging.current) return; dragging.current = false;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  };

  if (images.length === 0) return (
    <div style={{ height, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🍽️</div>
  );

  return (
    <div
      style={{ position: 'relative', height, overflow: 'hidden', cursor: images.length > 1 ? 'grab' : 'default', userSelect: 'none' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp}
    >
      {/* Slides */}
      <div style={{ display: 'flex', height: '100%', transition: 'transform 0.35s cubic-bezier(0.32,0,0.16,1)', transform: `translateX(-${idx * 100}%)` }}>
        {images.map((img, i) => (
          <div key={img.id} style={{ minWidth: '100%', height: '100%', flexShrink: 0 }}>
            <img src={img.image_url} alt="" draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {/* Arrows — only if >1 image */}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            zIndex: 2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            zIndex: 2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Dot indicators */}
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5, zIndex: 2 }}>
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} style={{
                width: i === idx ? 18 : 6, height: 6, borderRadius: 100,
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }} />
            ))}
          </div>
        </>
      )}

      {/* Image count badge */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          color: 'white', fontSize: 11, fontWeight: 700,
          padding: '3px 9px', borderRadius: 20, zIndex: 2,
        }}>
          {idx + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

// ─── Menu Card (customer-facing) ──────────────────────────────────────────────
const MenuCard: React.FC<{ item: MenuItem; onClick: () => void }> = ({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const primary = item.images?.find(i => i.is_primary) ?? item.images?.[0];

  return (
    <div
      onClick={item.is_available ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden', cursor: item.is_available ? 'pointer' : 'not-allowed',
        boxShadow: hovered ? '0 12px 36px rgba(0,0,0,0.13)' : '0 2px 12px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Image */}
      <div style={{ height: 150, overflow: 'hidden', background: 'linear-gradient(135deg,#f0f4ef,#e4ece4)', position: 'relative' }}>
        {primary ? (
          <img src={primary.image_url} alt={item.name} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.35s ease' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>🍽️</div>
        )}

        {/* Multi-image indicator */}
        {item.images?.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            color: 'white', fontSize: 10, fontWeight: 700,
            padding: '2px 7px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            {item.images.length}
          </div>
        )}

        {/* Variation badge */}
        {item.variations?.length > 0 && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(33,112,147,0.88)', backdropFilter: 'blur(4px)',
            color: 'white', fontSize: 10, fontWeight: 700,
            padding: '3px 8px', borderRadius: 20,
          }}>
            {item.variations.length} variasi
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1612', marginBottom: 4, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </div>
        {item.description && (
          <div style={{ fontSize: 12, color: '#8a8278', lineHeight: 1.45, marginBottom: 8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#5B8C5A' }}>{fmt(item.base_price)}</div>
          {item.prep_time > 0 && (
            <div style={{ fontSize: 11, color: '#b0a898', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {item.prep_time}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Menu Detail Modal ────────────────────────────────────────────────────────
const MenuDetailModal: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
  // Group variations by name
  const grouped = item.variations?.reduce((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {} as Record<string, MenuVariation[]>) ?? {};

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto',
          animation: 'pmSlideUp .3s cubic-bezier(0.23,1,0.32,1)',
          scrollbarWidth: 'none',
        }}
      >
        {/* Image swiper */}
        <div style={{ position: 'relative' }}>
          <ImageSwiper images={item.images ?? []} height={280} />
          {/* Close button floating on image */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {/* Category pill on image */}
          {item.category && (
            <div style={{
              position: 'absolute', top: 14, left: 14, zIndex: 10,
              background: 'rgba(91,140,90,0.9)', backdropFilter: 'blur(4px)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 20,
            }}>
              {item.category.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 40px' }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1612', margin: '0 0 6px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {item.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#5B8C5A', letterSpacing: '-0.03em' }}>
                {fmt(item.base_price)}
              </span>
              {item.prep_time > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#8a8278', fontWeight: 600,
                  background: '#f5f2ed', borderRadius: 20, padding: '4px 10px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {item.prep_time} menit
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.65, margin: '0 0 20px' }}>
              {item.description}
            </p>
          )}

          {/* Separator */}
          {Object.keys(grouped).length > 0 && (
            <div style={{ height: 1, background: 'linear-gradient(to right, #f0ede8, transparent)', marginBottom: 20 }} />
          )}

          {/* Variations */}
          {Object.entries(grouped).map(([groupName, opts]) => (
            <div key={groupName} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#b0a898', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {groupName}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {opts.map(v => (
                  <div key={v.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#faf9f6', borderRadius: 12, padding: '11px 14px',
                    border: '1px solid #f0ede8',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1612' }}>{v.option}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#5B8C5A' }}>
                      {v.price > 0 ? `+${fmt(v.price)}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Promo Card ───────────────────────────────────────────────────────────────
const PromoCard: React.FC<{ promo: Promo; onClick: () => void }> = ({ promo, onClick }) => {
  const originalTotal = promo.items?.reduce((s, i) => s + (i.menu?.base_price ?? 0) * i.quantity, 0) ?? 0;
  const savingsPct = originalTotal > 0 ? Math.round(((originalTotal - promo.promo_price) / originalTotal) * 100) : 0;
  const isUnavailable = !!promo.unavailable_reason;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #c94f1a, #e8622a, #f5a623)',
        borderRadius: 22, overflow: 'hidden',
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
        opacity: isUnavailable ? 0.8 : 1,
        boxShadow: hovered ? '0 16px 48px rgba(232,98,42,.45)' : '0 6px 28px rgba(232,98,42,.3)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s ease', position: 'relative',
      }}
    >
      {/* Shine */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.12) 50%, transparent 65%)', animation: 'pmShine 3s ease infinite', pointerEvents: 'none' }} />

      {/* Savings badge */}
      {savingsPct > 0 && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: '#fff', color: '#e8622a', borderRadius: 20, padding: '4px 11px', fontSize: 11, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
          Hemat {savingsPct}%
        </div>
      )}

      {/* Image */}
      <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
        {promo.image_url ? (
          <>
            <img src={promo.image_url} alt={promo.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .75 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(200,70,20,.7))' }} />
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎁</div>
        )}
        {/* Menu thumbnails */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 5 }}>
          {promo.items?.slice(0, 4).map((item, ii) => {
            const img = item.menu?.images?.find(i => i.is_primary) ?? item.menu?.images?.[0];
            return img ? (
              <img key={ii} src={img.image_url} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,.6)' }} />
            ) : (
              <div key={ii} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍽️</div>
            );
          })}
          {(promo.items?.length ?? 0) > 4 && (
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800 }}>+{promo.items.length - 4}</div>
          )}
        </div>
        {/* Unavailable overlay */}
        {isUnavailable && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', fontWeight: '700', backdropFilter: 'blur(6px)', textAlign: 'center', lineHeight: 1.5, maxWidth: '200px' }}>
              🚫 {promo.unavailable_reason}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{promo.name}</div>
        {promo.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginBottom: 8, lineHeight: 1.4 }}>{promo.description}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{fmt(promo.promo_price)}</span>
          {originalTotal > promo.promo_price && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', textDecoration: 'line-through' }}>{fmt(originalTotal)}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginBottom: promo.end_at ? 4 : 0 }}>
          {promo.items?.map(i => `${i.quantity}× ${i.menu?.name ?? '...'}`).join(' · ')}
        </div>
        {promo.end_at && <Countdown endAt={promo.end_at} />}
      </div>
    </div>
  );
};

// ─── Promo Detail Modal ───────────────────────────────────────────────────────
const PromoDetailModal: React.FC<{ promo: Promo; onClose: () => void }> = ({ promo, onClose }) => {
  const originalTotal = promo.items?.reduce((s, i) => s + (i.menu?.base_price ?? 0) * i.quantity, 0) ?? 0;
  const savings = originalTotal - promo.promo_price;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', animation: 'pmSlideUp .3s cubic-bezier(0.23,1,0.32,1)', scrollbarWidth: 'none' }}>
        <div style={{ background: 'linear-gradient(135deg, #c94f1a, #e8622a, #f5a623)', padding: '24px 20px 20px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, border: 'none', background: 'rgba(0,0,0,.25)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, backdropFilter: 'blur(4px)' }}>✕</button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>🎁 Promo Bundle</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>{promo.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{fmt(promo.promo_price)}</span>
            {savings > 0 && <span style={{ background: 'rgba(255,255,255,.25)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>Hemat {fmt(savings)}</span>}
          </div>
          {promo.end_at && <Countdown endAt={promo.end_at} />}
        </div>
        <div style={{ padding: '20px 20px 40px' }}>
          {promo.description && <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.65, margin: '0 0 18px' }}>{promo.description}</p>}
          <div style={{ fontSize: 11, fontWeight: 800, color: '#b0a898', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Isi Bundle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {promo.items?.map(item => {
              const img = item.menu?.images?.find(i => i.is_primary) ?? item.menu?.images?.[0];
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#faf9f6', borderRadius: 14, padding: '11px 14px', border: '1px solid #f0ede8' }}>
                  {img ? <img src={img.image_url} alt={item.menu?.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#e8e4de,#d0ccc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🍽️</div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1612' }}>{item.menu?.name}</div>
                    <div style={{ fontSize: 12, color: '#8a8278', marginTop: 2 }}>{item.quantity}× · {fmt(item.menu?.base_price ?? 0)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {originalTotal > promo.promo_price && (
            <div style={{ marginTop: 18, background: '#fff8e8', border: '1.5px solid rgba(245,166,35,.25)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#a06010' }}>Total hemat kamu</div>
                <div style={{ fontSize: 11, color: '#b0a898', marginTop: 2 }}>dibanding beli satuan</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#e8622a' }}>{fmt(savings)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Public Menu Page ─────────────────────────────────────────────────────────
export const PublicMenu: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [menus,      setMenus]      = useState<MenuItem[]>([]);
  const [promos,     setPromos]     = useState<Promo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenant,     setTenant]     = useState<TenantInfo | null>(null);
  const [activeTab,  setActiveTab]  = useState<number>(0);
  const [selected,   setSelected]   = useState<MenuItem | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/public/menu/${tenantId}`).then(r => r.json()),
      fetch(`${API}/public/promos/${tenantId}`).then(r => r.json()).catch(() => []),
    ]).then(([menuData, promoData]) => {
      setMenus(menuData.menus ?? []);
      setCategories(menuData.categories ?? []);
      setTenant(menuData.tenant ?? null);
      setPromos(Array.isArray(promoData) ? promoData : []);
      setLoading(false);
    }).catch(() => {
      setError('Gagal memuat menu.');
      setLoading(false);
    });
  }, [tenantId]);

  const filtered = menus.filter(m => {
    const matchCat    = activeTab === 0 || m.category?.id === activeTab;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f0e8; font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes pmSlideUp  { from{opacity:0;transform:translateY(32px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pmFadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pmShine    { 0%,100%{opacity:0;transform:translateX(-100%)} 50%{opacity:1;transform:translateX(100%)} }
        @keyframes pmPulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes pmSpin     { to{transform:rotate(360deg)} }
        @keyframes pmBlink    { 0%,80%,100%{opacity:0} 40%{opacity:1} }

        ::-webkit-scrollbar { display: none; }

        .pm-root {
          min-height: 100vh;
          background: #f4f0e8;
          background-image: radial-gradient(ellipse 60% 40% at 80% 10%, rgba(91,140,90,0.08), transparent);
          padding-bottom: 60px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Header ── */
        .pm-header {
          background: linear-gradient(160deg, #1a2b19 0%, #2d4a2c 60%, #3d5e3c 100%);
          padding: 32px 20px 24px;
          position: relative; overflow: hidden;
        }
        .pm-header-deco1 {
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px; border-radius: 50%;
          border: 40px solid rgba(255,255,255,0.04);
        }
        .pm-header-deco2 {
          position: absolute; bottom: -20px; left: 30%;
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(255,255,255,0.03);
        }
        .pm-header-inner {
          max-width: 500px; margin: 0 auto;
          display: flex; align-items: center; gap: 16px;
          position: relative;
        }
        .pm-logo {
          width: 58px; height: 58px; border-radius: 16px;
          object-fit: cover; border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25); flex-shrink: 0;
        }
        .pm-store-name {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 900; color: #fff;
          letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 4px;
        }
        .pm-store-address {
          font-size: 12px; color: rgba(255,255,255,.55); font-weight: 500;
          display: flex; align-items: center; gap: 4px; margin-bottom: 2px;
        }
        .pm-store-hint { font-size: 11px; color: rgba(255,255,255,.38); }
        .pm-online-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #7aee78; margin-right: 5px;
          animation: pmPulse 2s ease-in-out infinite;
        }

        /* ── Body ── */
        .pm-body { max-width: 500px; margin: 0 auto; padding: 0 16px; }

        /* ── Search ── */
        .pm-search-wrap {
          position: relative; margin: 18px 0 14px;
        }
        .pm-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #b0a898; pointer-events: none; transition: color 0.2s;
          display: flex; align-items: center;
        }
        .pm-search {
          width: 100%; padding: 13px 16px 13px 44px;
          border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 14px; font-size: 14px; color: #1a1612;
          background: white; font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .pm-search:focus {
          border-color: #5B8C5A;
          box-shadow: 0 0 0 3px rgba(91,140,90,0.12), 0 2px 10px rgba(0,0,0,0.06);
        }

        /* ── Section labels ── */
        .pm-section-label {
          font-size: 12px; font-weight: 800; letter-spacing: 0.07em;
          text-transform: uppercase; margin-bottom: 12px;
          display: flex; align-items: center; gap: 7px;
        }

        /* ── Category tabs ── */
        .pm-tabs {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
          margin-bottom: 18px; scrollbar-width: none;
        }
        .pm-tab {
          padding: 8px 18px; border-radius: 100px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          white-space: nowrap; transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .pm-tab-active {
          background: #5B8C5A; color: white;
          box-shadow: 0 4px 12px rgba(91,140,90,0.28);
        }
        .pm-tab-inactive {
          background: white; color: #8a8278;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.06);
        }

        /* ── Menu grid ── */
        .pm-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .pm-grid > * { animation: pmFadeUp .3s ease both; }
        .pm-grid > *:nth-child(2) { animation-delay:.04s }
        .pm-grid > *:nth-child(3) { animation-delay:.08s }
        .pm-grid > *:nth-child(4) { animation-delay:.12s }
        .pm-grid > *:nth-child(5) { animation-delay:.16s }
        .pm-grid > *:nth-child(6) { animation-delay:.20s }

        /* ── Loading ── */
        .pm-loading {
          display: flex; flex-direction: column; align-items: center;
          padding: 64px 0; gap: 10px; color: #8a8278; font-size: 14px;
        }
        .pm-spinner {
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid #e8e4de; border-top-color: #5B8C5A;
          animation: pmSpin 0.75s linear infinite;
        }
        .pm-dots { display: flex; gap: 5px; margin-top: 4px; }
        .pm-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #5B8C5A; opacity: 0;
          animation: pmBlink 1.4s ease-in-out infinite;
        }
        .pm-dots span:nth-child(2){animation-delay:.2s}
        .pm-dots span:nth-child(3){animation-delay:.4s}

        /* ── Empty ── */
        .pm-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 64px 24px; gap: 10px; text-align: center;
        }

        /* ── Footer ── */
        .pm-footer {
          text-align: center; margin-top: 40px;
          font-size: 12px; color: #b0a898; font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
      `}</style>

      <div className="pm-root">

        {/* ── Header ── */}
        <div className="pm-header">
          <div className="pm-header-deco1" />
          <div className="pm-header-deco2" />
          <div className="pm-header-inner">
            {tenant?.logo_url && (
              <img src={tenant.logo_url} alt={tenant?.store_name} className="pm-logo" />
            )}
            <div>
              <div className="pm-store-name">{tenant?.store_name ?? 'Menu Kami'}</div>
              {tenant?.store_address && (
                <div className="pm-store-address">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {tenant.store_address}
                </div>
              )}
              <div className="pm-store-hint">
                <span className="pm-online-dot" />
                Tap menu untuk detail & variasi lengkap
              </div>
            </div>
          </div>
        </div>

        <div className="pm-body">
          {/* ── Search ── */}
          <div className="pm-search-wrap">
            <span className="pm-search-icon" style={{ color: searchFocus ? '#5B8C5A' : '#b0a898' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              className="pm-search"
              placeholder="Cari menu favorit kamu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>

          {/* ── Active Promos ── */}
          {!loading && promos.length > 0 && !search && (
            <div style={{ marginBottom: 24 }}>
              <div className="pm-section-label" style={{ color: '#e8622a' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8622a" stroke="none"><path d="M12 2c0 0-4 5-4 9 0 2.21 1.79 4 4 4s4-1.79 4-4C16 7 12 2 12 2z"/></svg>
                Promo Spesial
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {promos.filter(p => !p.unavailable_reason).map(p => (
                  <PromoCard key={p.id} promo={p} onClick={() => setSelectedPromo(p)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Category Tabs ── */}
          {!loading && categories.length > 0 && (
            <div className="pm-tabs">
              <button
                className={`pm-tab ${activeTab === 0 ? 'pm-tab-active' : 'pm-tab-inactive'}`}
                onClick={() => setActiveTab(0)}
              >Semua</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`pm-tab ${activeTab === cat.id ? 'pm-tab-active' : 'pm-tab-inactive'}`}
                  onClick={() => setActiveTab(cat.id)}
                >{cat.name}</button>
              ))}
            </div>
          )}

          {/* ── States ── */}
          {loading && (
            <div className="pm-loading" style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:'12px' }}>
              <Lottie animationData={loadkucing} loop autoplay style={{ width:180,height:180 }} />
              <div className="pm-spinner" />
              <p style={{ fontWeight: 600 }}>Memuat menu...</p>
              <div className="pm-dots"><span/><span/><span/></div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 18, color: '#c06050', marginTop: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>😕</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{error}</div>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="pm-empty">
              <div style={{ fontSize: 44 }}>🍽️</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1612' }}>
                {search ? 'Menu tidak ditemukan' : 'Belum ada menu tersedia'}
              </p>
              <p style={{ fontSize: 13, color: '#8a8278' }}>
                {search ? `Coba kata kunci lain` : 'Pantau terus untuk update menu terbaru'}
              </p>
            </div>
          )}

          {/* ── Grid ── */}
          {!loading && !error && filtered.length > 0 && (
            <>
              {!search && (
                <div className="pm-section-label" style={{ color: '#5B8C5A', marginBottom: 14 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  {activeTab === 0 ? 'Semua Menu' : categories.find(c => c.id === activeTab)?.name ?? 'Menu'}
                  <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#b0a898', fontSize: 11, marginLeft: 2 }}>({filtered.length} item)</span>
                </div>
              )}
              <div className="pm-grid">
                {filtered.map(item => (
                  <MenuCard key={item.id} item={item} onClick={() => setSelected(item)} />
                ))}
              </div>
            </>
          )}

          {/* ── Footer ── */}
          {!loading && (
            <div className="pm-footer">
              🌿 Powered by <strong style={{ color: '#5B8C5A' }}>MODU</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {selected && <MenuDetailModal item={selected} onClose={() => setSelected(null)} />}
      {selectedPromo && <PromoDetailModal promo={selectedPromo} onClose={() => setSelectedPromo(null)} />}
    </>
  );
};