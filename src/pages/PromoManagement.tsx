import React, { useState, useEffect, useRef } from 'react';
import { promoApi, menuApi } from '../api/menu';
import { Menu, MenuVariation } from '../types';
import { formatCurrency } from '../utils/format';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PromoItem {
  menu_id: number;
  variation_id?: number | null;
  quantity: number;
  menu?: Menu;
  variation?: MenuVariation;
}
interface Promo {
  id: number; name: string; description: string;
  promo_price: number; image_url: string;
  is_active: boolean; start_at: string; end_at: string | null;
  start_time: string; end_time: string; // "HH:MM"
  items: PromoItem[];
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const FireIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17h2a2.5 2.5 0 0 0 2.5-2.5c0-1.5-.5-2-1-3l-2-3.5-2 3.5c-.5 1-.9 1.5-.9 3z"/><path d="M12 2C6.5 6.5 5 11 5 14a7 7 0 0 0 14 0c0-5-4-9-7-12z"/></svg>;
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const ClockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const GiftIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const SparkleIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>;
const MinusIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const UploadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const SunIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const ImageIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  orange: '#e8622a', orangeDark: '#c94f1a', orangeLight: '#fff3ee', orangeBorder: 'rgba(232,98,42,.2)',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  red: '#E8604A', redLight: '#fdecea',
  accent: '#E8A23A', accentLight: '#fff8e8',
  blue: '#4AA8D8', blueLight: '#e8f5fb',
};

// ── Overlay ───────────────────────────────────────────────────────────────────
const Overlay: React.FC<{ msg: string }> = ({ msg }) => (
  <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(244,240,232,0.7)',backdropFilter:'blur(8px)' }}>
    <div style={{ background:'white',borderRadius:'24px',padding:'32px 48px',boxShadow:'0 24px 64px rgba(0,0,0,0.12)',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px' }}>
      <Lottie animationData={lottieTree} loop autoplay style={{ width:140,height:140 }} />
      <p style={{ fontSize:'14px',fontWeight:'700',color:C.text }}>{msg}</p>
      <div style={{ display:'flex',gap:'5px' }}>
        {[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:'50%',background:C.primary,opacity:0,animation:`pm-blink 1.4s ease-in-out ${i*0.2}s infinite` }}/>)}
      </div>
    </div>
  </div>
);

// ── Time Slot UI ──────────────────────────────────────────────────────────────
const TIME_PRESETS = [
  { label: '🌅 Pagi', start: '07:00', end: '10:00' },
  { label: '☀️ Siang', start: '11:00', end: '14:00' },
  { label: '🌆 Sore', start: '15:00', end: '18:00' },
  { label: '🌙 Malam', start: '18:00', end: '22:00' },
];

const TimeSlotPicker: React.FC<{
  startTime: string; endTime: string;
  onChange: (start: string, end: string) => void;
}> = ({ startTime, endTime, onChange }) => {
  const [enabled, setEnabled] = useState(!!(startTime && endTime));

  const handleToggle = () => {
    if (enabled) { onChange('', ''); setEnabled(false); }
    else { onChange('08:00', '22:00'); setEnabled(true); }
  };

  // Hitung durasinya
  const getDuration = () => {
    if (!startTime || !endTime) return '';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60); const m = diff % 60;
    return h > 0 ? `${h}j${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
  };

  return (
    <div style={{ border:`1.5px solid ${enabled ? C.orange : '#e8e4dc'}`,borderRadius:'14px',overflow:'hidden',transition:'border-color 0.2s' }}>
      {/* Header toggle */}
      <div
        onClick={handleToggle}
        style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',cursor:'pointer',background:enabled ? C.orangeLight : 'white',transition:'background 0.2s' }}
      >
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <span style={{ fontSize:'16px' }}>🕐</span>
          <div>
            <p style={{ margin:0,fontSize:'13px',fontWeight:'700',color:enabled ? C.orangeDark : C.text }}>Jam Aktif Promo</p>
            <p style={{ margin:0,fontSize:'11px',color:C.sub }}>
              {enabled && startTime && endTime
                ? `${startTime} – ${endTime}${getDuration() ? ` (${getDuration()})` : ''}`
                : 'Sepanjang hari (default)'}
            </p>
          </div>
        </div>
        {/* Toggle switch */}
        <div style={{ width:36,height:20,borderRadius:10,background:enabled ? C.orange : '#d0ccc6',position:'relative',transition:'background 0.2s',flexShrink:0 }}>
          <div style={{ width:16,height:16,borderRadius:'50%',background:'white',position:'absolute',top:2,left:enabled ? 18 : 2,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,.2)' }}/>
        </div>
      </div>

      {/* Content */}
      {enabled && (
        <div style={{ padding:'14px',borderTop:`1px solid ${C.orangeBorder}`,background:'white' }}>
          {/* Presets */}
          <p style={{ margin:'0 0 8px',fontSize:'10px',fontWeight:'700',color:C.sub,textTransform:'uppercase',letterSpacing:'0.06em' }}>Preset Cepat</p>
          <div style={{ display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'14px' }}>
            {TIME_PRESETS.map(p => {
              const active = startTime === p.start && endTime === p.end;
              return (
                <button key={p.label}
                  onClick={() => onChange(p.start, p.end)}
                  style={{ padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:'inherit',
                    background:active ? C.orange : '#f5f2ed',color:active ? 'white' : C.text,
                    boxShadow:active ? '0 2px 8px rgba(232,98,42,0.3)' : 'none',transition:'all 0.15s' }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Manual input */}
          <p style={{ margin:'0 0 8px',fontSize:'10px',fontWeight:'700',color:C.sub,textTransform:'uppercase',letterSpacing:'0.06em' }}>Atau Atur Manual</p>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 4px',fontSize:'11px',color:C.sub,fontWeight:'600' }}>Dari</p>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:C.sub }}><SunIcon /></span>
                <input type="time" value={startTime} onChange={e => onChange(e.target.value, endTime)}
                  style={{ width:'100%',padding:'9px 10px 9px 32px',borderRadius:'10px',border:`1.5px solid ${C.border}`,fontSize:'13px',fontWeight:'700',color:C.text,background:'#faf9f6',fontFamily:'inherit',outline:'none' }} />
              </div>
            </div>
            <div style={{ color:C.sub,fontWeight:'700',marginTop:'16px',flexShrink:0 }}>→</div>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 4px',fontSize:'11px',color:C.sub,fontWeight:'600' }}>Sampai</p>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:C.sub }}><MoonIcon /></span>
                <input type="time" value={endTime} onChange={e => onChange(startTime, e.target.value)}
                  style={{ width:'100%',padding:'9px 10px 9px 32px',borderRadius:'10px',border:`1.5px solid ${C.border}`,fontSize:'13px',fontWeight:'700',color:C.text,background:'#faf9f6',fontFamily:'inherit',outline:'none' }} />
              </div>
            </div>
          </div>

          {/* Visual timeline bar */}
          {startTime && endTime && (
            <div style={{ marginTop:'12px' }}>
              <div style={{ height:'6px',borderRadius:'3px',background:'#f0ede8',position:'relative',overflow:'hidden' }}>
                {(() => {
                  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
                  const total = 24*60; const s = toMin(startTime); const e = toMin(endTime);
                  if (e <= s) return null;
                  return <div style={{ position:'absolute',left:`${(s/total)*100}%`,width:`${((e-s)/total)*100}%`,height:'100%',background:`linear-gradient(90deg,${C.orange},${C.accent})`,borderRadius:'3px' }}/>;
                })()}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',marginTop:'3px',fontSize:'9px',color:C.sub }}>
                {['00','06','12','18','24'].map(h => <span key={h}>{h}:00</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Countdown Badge ───────────────────────────────────────────────────────────
const CountdownBadge: React.FC<{ endAt: string }> = ({ endAt }) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000) });
    };
    calc(); const id = setInterval(calc, 60000); return () => clearInterval(id);
  }, [endAt]);
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'11px',color:C.orange,fontWeight:'700',background:C.orangeLight,padding:'2px 8px',borderRadius:'20px',border:`1px solid ${C.orangeBorder}` }}>
      <ClockIcon />{t.d > 0 ? `${t.d}h ` : ''}{t.h}j {t.m}m lagi
    </span>
  );
};

// ── Promo Card ────────────────────────────────────────────────────────────────
const PromoCard: React.FC<{ promo: Promo; onEdit: ()=>void; onDelete: ()=>void; onToggle: ()=>void }> = ({ promo, onEdit, onDelete, onToggle }) => {
  const originalTotal = promo.items?.reduce((s, i) => {
    const base = (i.menu?.base_price ?? 0) * (i.quantity ?? 1);
    const varPrice = (i.variation?.price ?? 0) * (i.quantity ?? 1);
    return s + base + varPrice;
  }, 0) ?? 0;
  // Kalau ada dynamic variation, harga bisa bertambah saat checkout
  const hasDynamic = promo.items?.some(i => i.addon_mode === 'dynamic');
  const savingsPct = originalTotal > 0 ? Math.round(((originalTotal - promo.promo_price)/originalTotal)*100) : 0;
  const isExpired = promo.end_at ? new Date(promo.end_at) < new Date() : false;
  const active = promo.is_active && !isExpired;
  const hasTimeSlot = !!(promo.start_time && promo.end_time);

  // Cek apakah sekarang dalam jam aktif
  const isInTimeSlot = () => {
    if (!hasTimeSlot) return true;
    const now = new Date();
    const cur = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    return cur >= promo.start_time && cur <= promo.end_time;
  };
  const inSlot = isInTimeSlot();

  return (
    <div style={{ background:'white',borderRadius:'20px',overflow:'hidden',border:`1.5px solid ${active ? C.orangeBorder : 'rgba(0,0,0,0.06)'}`,boxShadow:active ? '0 4px 20px rgba(232,98,42,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',transition:'transform 0.2s,box-shadow 0.2s',opacity:isExpired ? 0.65 : 1 }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 10px 32px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow=active?'0 4px 20px rgba(232,98,42,0.1)':'0 2px 12px rgba(0,0,0,0.05)'; }}
    >
      {/* Image */}
      <div style={{ height:'148px',position:'relative',overflow:'hidden',background:active ? 'linear-gradient(135deg,#c94f1a,#e8622a,#f5a623)' : '#e8e4de' }}>
        {promo.image_url ? <img src={promo.image_url} alt={promo.name} style={{ width:'100%',height:'100%',objectFit:'cover',opacity:0.85 }} /> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px' }}>🎁</div>}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.55))' }} />
        {savingsPct > 0 && <div style={{ position:'absolute',top:10,right:10,background:'white',color:C.orange,borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:'800',display:'flex',alignItems:'center',gap:'4px',boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}><SparkleIcon />Hemat {savingsPct}%</div>}
        <div style={{ position:'absolute',top:10,left:10,borderRadius:'20px',padding:'3px 9px',fontSize:'10px',fontWeight:'800',backdropFilter:'blur(6px)',background:active?'rgba(91,140,90,0.9)':isExpired?'rgba(232,96,74,0.85)':'rgba(0,0,0,0.4)',color:'white' }}>
          {active ? '● Aktif' : isExpired ? '✕ Berakhir' : '○ Nonaktif'}
        </div>
        {/* Time slot badge */}
        {hasTimeSlot && (
          <div style={{ position:'absolute',top:10,left:active ? 70 : 80,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',borderRadius:'20px',padding:'3px 9px',fontSize:'10px',fontWeight:'700',color:inSlot ? '#ffd580' : 'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',gap:'4px' }}>
            <ClockIcon />{promo.start_time}–{promo.end_time}
          </div>
        )}
        <div style={{ position:'absolute',bottom:10,left:14,right:14 }}>
          <p style={{ margin:'0 0 3px',fontSize:'14px',fontWeight:'800',color:'white',textShadow:'0 1px 6px rgba(0,0,0,.5)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{promo.name}</p>
          <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
            <span style={{ fontSize:'16px',fontWeight:'900',color:'white' }}>{formatCurrency(promo.promo_price)}{hasDynamic ? '+' : ''}</span>
            {originalTotal > promo.promo_price && <span style={{ fontSize:'12px',color:'rgba(255,255,255,0.65)',textDecoration:'line-through' }}>{formatCurrency(originalTotal)}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        {promo.description && <p style={{ margin:'0 0 8px',fontSize:'12px',color:C.sub,lineHeight:1.45 }}>{promo.description}</p>}

        {/* Items */}
        <div style={{ marginBottom:'10px',display:'flex',flexDirection:'column',gap:'4px' }}>
          {promo.items?.slice(0,3).map((item,i) => (
            <div key={i} style={{ display:'flex',justifyContent:'space-between',fontSize:'12px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                <div style={{ width:5,height:5,borderRadius:'50%',background:C.orange,flexShrink:0 }} />
                <span style={{ fontWeight:'600',color:C.text }}>
                  {item.quantity}× {item.menu?.name ?? `Menu #${item.menu_id}`}
                  {item.variation && <span style={{ color:C.sub,fontWeight:'400' }}> ({item.variation.option})</span>}
                </span>
              </div>
              <span style={{ color:C.sub }}>{formatCurrency((item.menu?.base_price ?? 0) * item.quantity)}</span>
            </div>
          ))}
          {(promo.items?.length ?? 0) > 3 && <p style={{ fontSize:'11px',color:C.sub,fontStyle:'italic' }}>+{promo.items.length-3} menu lainnya</p>}
        </div>

        {/* Time info */}
        <div style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'11.5px',color:C.sub,marginBottom:'12px',flexWrap:'wrap' }}>
          <ClockIcon />
          {promo.end_at ? `Sampai ${new Date(promo.end_at).toLocaleDateString('id-ID')}` : 'Tanpa batas waktu'}
          {isExpired && <span style={{ color:C.red,fontWeight:'700' }}>· Berakhir</span>}
          {active && promo.end_at && <CountdownBadge endAt={promo.end_at} />}
          {hasTimeSlot && !inSlot && <span style={{ background:'#f5f2ed',borderRadius:'20px',padding:'2px 8px',fontWeight:'700',fontSize:'10px' }}>⏸ Di luar jam aktif</span>}
        </div>

        {/* Actions */}
        <div style={{ display:'flex',gap:'7px' }}>
          <button onClick={onToggle} style={{ flex:1,padding:'8px 0',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',transition:'all 0.15s',background:active?C.redLight:'#ebf4eb',color:active?C.red:C.primaryDark }}>
            {active ? <><XIcon/>Nonaktifkan</> : <><CheckIcon/>Aktifkan</>}
          </button>
          <button onClick={onEdit} style={{ display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'9px',border:'1.5px solid rgba(0,0,0,0.08)',background:'white',color:C.sub,cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:'inherit',transition:'all 0.15s' }}>
            <EditIcon/>Edit
          </button>
          <button onClick={onDelete} style={{ padding:'8px 10px',borderRadius:'9px',border:'none',background:C.redLight,color:C.red,cursor:'pointer',display:'flex',alignItems:'center',transition:'background 0.15s' }}>
            <TrashIcon/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Promo Form ────────────────────────────────────────────────────────────────
const PromoForm: React.FC<{ promo: Promo|null; menus: Menu[]; onSave:(d:any)=>Promise<void>; onCancel:()=>void }> = ({ promo, menus, onSave, onCancel }) => {
  const [name, setName] = useState(promo?.name ?? '');
  const [desc, setDesc] = useState(promo?.description ?? '');
  const [price, setPrice] = useState(promo?.promo_price?.toString() ?? '');
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);
  const [startAt, setStartAt] = useState(promo?.start_at?.slice(0,10) ?? new Date().toISOString().slice(0,10));
  const [endAt, setEndAt] = useState(promo?.end_at?.slice(0,10) ?? '');
  const [startTime, setStartTime] = useState(promo?.start_time ?? '');
  const [endTime, setEndTime] = useState(promo?.end_time ?? '');
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState(promo?.image_url ?? '');
  const [imgHover, setImgHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // items: {menu_id, variation_id (null=pilih nanti / tidak ada), quantity}
  const [items, setItems] = useState<{menu_id:number; variation_id:number|null; addon_mode:string; quantity:number}[]>(
    promo?.items?.map(i => ({ 
      menu_id: i.menu_id, 
      variation_id: i.variation_id ?? null, 
      addon_mode: i.addon_mode ?? '',
      quantity: i.quantity 
    })) ?? []
  );

  const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase()) && !items.find(i => i.menu_id === m.id));

  const addItem = (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    const hasVar = (menu?.variations?.length ?? 0) > 0;
    // Default: tidak ada variasi → addon_mode = ''
    // Kalau ada variasi → default 'dynamic', admin bisa ubah ke 'fixed'
    setItems(p => [...p, { 
      menu_id: menuId, 
      variation_id: null, 
      addon_mode: hasVar ? 'dynamic' : '',
      quantity: 1 
    }]);
    setMenuSearch('');
  };
  const removeItem = (menuId: number) => setItems(p => p.filter(i => i.menu_id !== menuId));
  const setQty = (menuId: number, q: number) => setItems(p => p.map(i => i.menu_id === menuId ? {...i, quantity: Math.max(1,q)} : i));
  const setVariation = (menuId: number, varId: number|null) => 
    setItems(p => p.map(i => i.menu_id === menuId ? {...i, variation_id: varId} : i));
  const setAddonMode = (menuId: number, mode: string) => 
    setItems(p => p.map(i => i.menu_id === menuId ? {...i, addon_mode: mode, variation_id: mode === 'dynamic' ? null : i.variation_id} : i));

  const originalTotal = items.reduce((s, i) => {
    const menu = menus.find(m => m.id === i.menu_id);
    const base = (menu?.base_price ?? 0) * i.quantity;
    const variation = i.addon_mode === 'fixed' && i.variation_id 
      ? menu?.variations?.find(v => v.id === i.variation_id)
      : null;
    const varPrice = (variation?.price ?? 0) * i.quantity;
    return s + base + varPrice;
  }, 0);
  const promoPrice = parseFloat(price || '0');
  const savingsPct = originalTotal > 0 && promoPrice > 0 ? Math.round(((originalTotal-promoPrice)/originalTotal)*100) : 0;

  // Validasi: semua item yang punya variasi harus sudah dipilih
  const invalidItems = items.filter(i => {
    const menu = menus.find(m => m.id === i.menu_id);
    const hasVar = (menu?.variations?.length ?? 0) > 0;
    // Hanya invalid jika mode fixed tapi belum pilih variasi
    return hasVar && i.addon_mode === 'fixed' && i.variation_id === null;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2*1024*1024) { toast.error('Ukuran gambar max 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar yang diperbolehkan'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imagePreview;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', imageFile);
      const API = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/promos/upload-image`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed'); }
      const data = await res.json();
      return data.image_url;
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Nama promo wajib'); return; }
    if (!price || promoPrice <= 0) { toast.error('Harga promo wajib'); return; }
    if (items.length === 0) { toast.error('Minimal 1 menu dalam bundle'); return; }
    if (invalidItems.length > 0) {
      toast.error(`Pilih variasi untuk: ${invalidItems.map(i => menus.find(m=>m.id===i.menu_id)?.name).join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      await onSave({
        name, description: desc, promo_price: promoPrice,
        image_url: imageUrl, is_active: isActive,
        start_at: startAt, end_at: endAt || null,
        start_time: startTime, end_time: endTime,
        items: items.map(i => ({ menu_id:i.menu_id, variation_id:i.variation_id ?? undefined, addon_mode:i.addon_mode, quantity:i.quantity })),
      });
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const isProcessing = saving || uploading;
  const inp = (focused = false): React.CSSProperties => ({ width:'100%',padding:'10px 12px',borderRadius:'10px',border:`1.5px solid ${focused ? C.orange : '#e8e4dc'}`,fontSize:'13px',color:C.text,background:'#faf9f6',fontFamily:'inherit',outline:'none',boxSizing:'border-box' as const,transition:'border-color 0.2s' });
  const lbl: React.CSSProperties = { fontSize:'11px',fontWeight:'700',color:C.sub,textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:'6px',display:'block' };

  return (
    <>
      {isProcessing && <Overlay msg={uploading ? 'Mengupload gambar...' : 'Menyimpan promo...'} />}
      <div style={{ display:'flex',flexDirection:'column',gap:'18px',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        {/* Image upload */}
        <div>
          <label style={lbl}>Gambar / Pamflet <span style={{ fontWeight:400,textTransform:'none' as const }}>(max 2MB)</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}
            style={{ width:'100%',height:'150px',borderRadius:'14px',border:`2px ${imagePreview ? 'solid' : 'dashed'} ${imagePreview ? C.orange : '#d8d4cc'}`,background:imagePreview ? 'transparent' : '#faf9f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',position:'relative',transition:'border-color 0.2s' }}
          >
            {imagePreview
              ? <>
                  <img src={imagePreview} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                  <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.42)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'7px',color:'white',fontWeight:'700',fontSize:'13px',opacity:imgHover?1:0,transition:'opacity 0.2s' }}>
                    <UploadIcon /><span>Ganti Gambar</span>
                  </div>
                </>
              : <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',color:C.sub }}>
                  <ImageIcon />
                  <span style={{ fontSize:'13px',fontWeight:'700' }}>Upload Pamflet Promo</span>
                  <span style={{ fontSize:'11px' }}>JPG, PNG, WebP · Max 2MB</span>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display:'none' }} />
        </div>

        {/* Harga preview */}
        {items.length > 0 && promoPrice > 0 && (
          <div style={{ background:`linear-gradient(135deg,${C.orangeDark},${C.orange},${C.accent})`,borderRadius:'14px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'14px',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,.1) 50%,transparent 65%)',animation:'pm-shine 3s ease infinite',pointerEvents:'none' }}/>
            <div><p style={{ margin:'0 0 2px',fontSize:'10px',color:'rgba(255,255,255,.7)',fontWeight:'600' }}>Harga Bundle</p><p style={{ margin:0,fontSize:'20px',fontWeight:'800',color:'white' }}>{formatCurrency(promoPrice)}</p></div>
            {originalTotal > promoPrice && <>
              <span style={{ color:'rgba(255,255,255,.4)',fontSize:'18px',fontWeight:'600' }}>vs</span>
              <div><p style={{ margin:'0 0 2px',fontSize:'10px',color:'rgba(255,255,255,.7)',fontWeight:'600' }}>Harga Normal</p><p style={{ margin:0,fontSize:'14px',color:'rgba(255,255,255,.65)',textDecoration:'line-through' }}>{formatCurrency(originalTotal)}</p></div>
              <div style={{ marginLeft:'auto',background:'rgba(255,255,255,.22)',color:'white',borderRadius:'20px',padding:'5px 14px',fontSize:'13px',fontWeight:'800',display:'flex',alignItems:'center',gap:'5px' }}><SparkleIcon/>Hemat {savingsPct}%</div>
            </>}
          </div>
        )}

        {/* Basic fields */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Nama Promo *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Paket Hemat Siang" style={inp()} onFocus={e=>(e.target as HTMLInputElement).style.borderColor=C.orange} onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e8e4dc'} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Deskripsi</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Deskripsi singkat..." style={inp()} onFocus={e=>(e.target as HTMLInputElement).style.borderColor=C.orange} onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e8e4dc'} />
          </div>
          <div>
            <label style={lbl}>Harga Bundle (Rp) *</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',fontWeight:'700',color:'#b0a898',pointerEvents:'none' }}>Rp</span>
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" min={0} style={{ ...inp(),paddingLeft:'32px' }} onFocus={e=>(e.target as HTMLInputElement).style.borderColor=C.orange} onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e8e4dc'} />
            </div>
            {originalTotal > 0 && <p style={{ margin:'4px 0 0',fontSize:'11px',color:C.sub }}>Harga normal: {formatCurrency(originalTotal)}</p>}
          </div>
          <div>
            <label style={lbl}>Status</label>
            <div style={{ display:'flex',background:'#f0ede8',borderRadius:'10px',padding:'3px',height:'42px' }}>
              {[['true','Aktif'],['false','Nonaktif']].map(([v,l]) => (
                <button key={v} onClick={()=>setIsActive(v==='true')} style={{ flex:1,border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'12.5px',fontWeight:'700',fontFamily:'inherit',background:String(isActive)===v?'white':'transparent',color:String(isActive)===v?C.text:C.sub,boxShadow:String(isActive)===v?'0 1px 5px rgba(0,0,0,0.1)':'none',transition:'all 0.15s' }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Mulai</label>
            <input type="date" value={startAt} onChange={e=>setStartAt(e.target.value)} style={inp()} />
          </div>
          <div>
            <label style={lbl}>Berakhir <span style={{ fontWeight:400,textTransform:'none' as const,color:'#b0a898' }}>(opsional)</span></label>
            <input type="date" value={endAt} onChange={e=>setEndAt(e.target.value)} style={inp()} />
          </div>
        </div>

        {/* ── Time Slot Picker ── */}
        <TimeSlotPicker startTime={startTime} endTime={endTime} onChange={(s,e)=>{setStartTime(s);setEndTime(e);}} />

        {/* ── Bundle Items ── */}
        <div>
          <label style={lbl}>Menu dalam Bundle *</label>

          {/* Items list */}
          {items.length > 0 && (
            <div style={{ display:'flex',flexDirection:'column',gap:'8px',marginBottom:'10px' }}>
              {items.map(item => {
                const menu = menus.find(m => m.id === item.menu_id);
                const variations = menu?.variations ?? [];
                const hasVariations = variations.length > 0;
                const needsVariation = hasVariations && item.variation_id === null;

                // Group variations by name
                const grouped = variations.reduce((acc, v) => {
                  if (!acc[v.name]) acc[v.name] = [];
                  acc[v.name].push(v);
                  return acc;
                }, {} as Record<string, MenuVariation[]>);

                return (
                  <div key={item.menu_id} style={{ borderRadius:'12px',border:`1.5px solid ${needsVariation ? C.orange : 'rgba(91,140,90,0.2)'}`,overflow:'hidden',transition:'border-color 0.2s' }}>
                    {/* Item header */}
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',background:C.primaryLight,padding:'10px 13px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'9px',flex:1,minWidth:0 }}>
                        <div style={{ width:7,height:7,borderRadius:'50%',background:C.primary,flexShrink:0 }}/>
                        <div>
                          <p style={{ margin:0,fontSize:'13px',fontWeight:'700',color:C.text }}>{menu?.name}</p>
                          <p style={{ margin:0,fontSize:'11px',color:C.sub }}>{formatCurrency(menu?.base_price ?? 0)}</p>
                        </div>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:'10px',flexShrink:0 }}>
                        {/* Qty */}
                        <div style={{ display:'flex',alignItems:'center',gap:'2px',background:'white',borderRadius:'8px',padding:'3px' }}>
                          <button onClick={()=>setQty(item.menu_id,item.quantity-1)} style={{ width:26,height:26,borderRadius:6,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f2ed',color:C.sub,transition:'all 0.12s' }}><MinusIcon/></button>
                          <span style={{ fontSize:'13px',fontWeight:'800',color:C.text,minWidth:'22px',textAlign:'center' }}>{item.quantity}</span>
                          <button onClick={()=>setQty(item.menu_id,item.quantity+1)} style={{ width:26,height:26,borderRadius:6,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f2ed',color:C.sub,transition:'all 0.12s' }}><PlusIcon/></button>
                        </div>
                        <span style={{ fontSize:'12px',fontWeight:'700',color:C.primary,minWidth:'68px',textAlign:'right' }}>{formatCurrency((menu?.base_price??0)*item.quantity)}</span>
                        <button onClick={()=>removeItem(item.menu_id)} style={{ border:'none',background:'none',cursor:'pointer',color:C.red,display:'flex',padding:'3px' }}><TrashIcon/></button>
                      </div>
                    </div>

                    {/* Variation section — hanya jika ada variasi */}
                    {hasVariations && (
                      <div style={{ padding:'10px 13px',background:'white',borderTop:`1px solid rgba(91,140,90,0.1)` }}>
                        
                        {/* Mode toggle: Fixed vs Dynamic */}
                        <div style={{ marginBottom:'10px' }}>
                          <p style={{ margin:'0 0 6px',fontSize:'10px',fontWeight:'700',color:C.sub,textTransform:'uppercase',letterSpacing:'0.05em' }}>Mode Variasi</p>
                          <div style={{ display:'flex',background:'#f0ede8',borderRadius:'9px',padding:'3px',gap:'2px' }}>
                            <button
                              onClick={() => setAddonMode(item.menu_id, 'fixed')}
                              style={{ flex:1,padding:'6px 8px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:'700',fontFamily:'inherit',transition:'all 0.15s',
                                background: item.addon_mode === 'fixed' ? C.primary : 'transparent',
                                color: item.addon_mode === 'fixed' ? 'white' : C.sub,
                                boxShadow: item.addon_mode === 'fixed' ? '0 2px 6px rgba(91,140,90,0.3)' : 'none'
                              }}
                            >
                              🔒 Kunci Variasi
                            </button>
                            <button
                              onClick={() => setAddonMode(item.menu_id, 'dynamic')}
                              style={{ flex:1,padding:'6px 8px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:'700',fontFamily:'inherit',transition:'all 0.15s',
                                background: item.addon_mode === 'dynamic' ? C.orange : 'transparent',
                                color: item.addon_mode === 'dynamic' ? 'white' : C.sub,
                                boxShadow: item.addon_mode === 'dynamic' ? '0 2px 6px rgba(232,98,42,0.3)' : 'none'
                              }}
                            >
                              🎯 Customer Pilih
                            </button>
                          </div>
                          <p style={{ margin:'5px 0 0',fontSize:'10px',color:C.sub,lineHeight:1.4 }}>
                            {item.addon_mode === 'fixed' 
                              ? '🔒 Variasi sudah ditentukan — customer tidak bisa ubah'
                              : '🎯 Customer bebas pilih variasi saat checkout — delta harga ditanggung customer'}
                          </p>
                        </div>

                        {/* Jika fixed: tampilkan picker variasi */}
                        {item.addon_mode === 'fixed' && (
                          <>
                            {needsVariation && (
                              <div style={{ display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px',background:C.orangeLight,borderRadius:'8px',padding:'6px 10px' }}>
                                <span style={{ fontSize:'13px' }}>⚠️</span>
                                <span style={{ fontSize:'11px',fontWeight:'700',color:C.orangeDark }}>Pilih variasi yang akan dikunci</span>
                              </div>
                            )}
                            {Object.entries(grouped).map(([groupName, opts]) => (
                              <div key={groupName} style={{ marginBottom:'6px' }}>
                                <p style={{ margin:'0 0 5px',fontSize:'10px',fontWeight:'700',color:C.sub,textTransform:'uppercase',letterSpacing:'0.05em' }}>{groupName}</p>
                                <div style={{ display:'flex',flexWrap:'wrap',gap:'5px' }}>
                                  {opts.map(v => {
                                    const selected = item.variation_id === v.id;
                                    return (
                                      <button key={v.id} onClick={()=>setVariation(item.menu_id, v.id)}
                                        style={{ padding:'5px 12px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'600',fontFamily:'inherit',
                                          background:selected?C.primary:'#f5f2ed',color:selected?'white':C.text,
                                          border:`1.5px solid ${selected?C.primary:'#e8e4dc'}`,transition:'all 0.15s' }}
                                      >
                                        {v.option}
                                        {v.price > 0 && <span style={{ opacity:0.7,marginLeft:'4px',fontSize:'10px' }}>+{(v.price/1000).toFixed(0)}k</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* Jika dynamic: tampilkan info */}
                        {item.addon_mode === 'dynamic' && (
                          <div style={{ background:'#fff8e8',borderRadius:'9px',padding:'8px 12px',border:'1px solid rgba(232,162,58,0.25)' }}>
                            <p style={{ margin:0,fontSize:'11px',color:'#a06010',fontWeight:'600',lineHeight:1.5 }}>
                              Customer akan pilih dari: {variations.map(v => v.option).join(', ')}
                              {variations.some(v => v.price > 0) && (
                                <span style={{ display:'block',marginTop:'2px',color:C.sub }}>
                                  Delta harga: {variations.filter(v=>v.price>0).map(v=>`+${(v.price/1000).toFixed(0)}k`).join(', ')} (ditanggung customer)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Validasi warning */}
          {invalidItems.length > 0 && (
            <div style={{ background:'#fff3ee',border:`1px solid ${C.orangeBorder}`,borderRadius:'10px',padding:'10px 12px',marginBottom:'10px',fontSize:'12px',color:C.orangeDark,fontWeight:'600' }}>
              ⚠️ Belum pilih variasi untuk: {invalidItems.map(i => menus.find(m=>m.id===i.menu_id)?.name).join(', ')}
            </div>
          )}

          {/* Menu search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',display:'flex',alignItems:'center',color:'#b0a898',pointerEvents:'none' }}><SearchIcon/></span>
            <input value={menuSearch} onChange={e=>setMenuSearch(e.target.value)} placeholder="Cari menu untuk ditambahkan..." style={{ ...inp(),paddingLeft:'36px' }} onFocus={e=>(e.target as HTMLInputElement).style.borderColor=C.orange} onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e8e4dc'} />
            {menuSearch && filteredMenus.length > 0 && (
              <div style={{ position:'absolute',top:'calc(100% + 2px)',left:0,right:0,zIndex:30,background:'white',borderRadius:'12px',border:'1.5px solid #e8e4dc',maxHeight:'200px',overflowY:'auto',boxShadow:'0 10px 32px rgba(0,0,0,0.13)' }}>
                {filteredMenus.slice(0,8).map(m => (
                  <div key={m.id} onClick={()=>addItem(m.id)} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f5f2ed',transition:'background 0.12s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#faf9f6'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='white'}
                  >
                    <div>
                      <span style={{ fontSize:'13px',fontWeight:'600',color:C.text,display:'block' }}>{m.name}</span>
                      {(m.variations?.length ?? 0) > 0 && <span style={{ fontSize:'10px',color:C.orange,fontWeight:'700',display:'block',marginTop:'2px' }}>⚡ {m.variations.length} variasi — perlu dipilih</span>}
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px',flexShrink:0 }}>
                      <span style={{ fontSize:'13px',fontWeight:'700',color:C.primary }}>{formatCurrency(m.base_price)}</span>
                      <div style={{ width:24,height:24,borderRadius:7,background:C.primaryLight,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center' }}><PlusIcon/></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex',gap:'10px',paddingTop:'6px',borderTop:'1.5px solid #f0ede8' }}>
          <button onClick={onCancel} style={{ flex:1,padding:'12px',borderRadius:'12px',border:'1.5px solid #e8e4dc',background:'white',color:C.sub,fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>Batal</button>
          <button onClick={handleSubmit} disabled={isProcessing} style={{ flex:2,padding:'12px',borderRadius:'12px',border:'none',background:`linear-gradient(135deg,${C.orangeDark},${C.orange})`,color:'white',fontSize:'13px',fontWeight:'700',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(232,98,42,0.35)',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',transition:'all 0.2s',opacity:isProcessing?0.65:1,cursor:isProcessing?'not-allowed':'pointer' }}>
            {isProcessing ? <><Lottie animationData={lottieTree} loop autoplay style={{ width:20,height:20 }}/>Memproses...</> : promo ? <><CheckIcon/>Update Promo</> : <><FireIcon/>Buat Promo</>}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const PromoManagement: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promo|null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([promoApi.getAll(), menuApi.getMenus()]);
      setPromos(Array.isArray(p) ? p : []);
      setMenus(Array.isArray(m) ? m : []);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  const handleSave = async (data: any) => {
    if (editing) { await promoApi.update(editing.id, data); toast.success('Promo diupdate!'); }
    else { await promoApi.create(data); toast.success('Promo dibuat!'); }
    setShowForm(false); setEditing(null); loadData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus promo ini?')) return;
    await promoApi.delete(id); toast.success('Promo dihapus'); loadData();
  };

  const handleToggle = async (promo: Promo) => {
    await promoApi.update(promo.id, { ...promo, is_active: !promo.is_active, items: promo.items?.map(i => ({ menu_id:i.menu_id, variation_id:i.variation_id, quantity:i.quantity })) });
    toast.success(promo.is_active ? 'Dinonaktifkan' : 'Diaktifkan'); loadData();
  };

  const activeCount = promos.filter(p => p.is_active && (!p.end_at || new Date(p.end_at) > new Date())).length;
  const expiredCount = promos.filter(p => p.end_at && new Date(p.end_at) < new Date()).length;

  // Enrich items dengan menu & variation data
  const enrichedPromos = promos.map(p => ({
    ...p,
    items: p.items?.map(i => ({
      ...i,
      menu: menus.find(m => m.id === i.menu_id),
      variation: i.variation_id ? menus.find(m=>m.id===i.menu_id)?.variations?.find(v=>v.id===i.variation_id) : undefined,
    })) ?? [],
  }));

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'20px',fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif",animation:'pm-fade-up 0.35s ease',position:'relative' }}>
      {loading && <Overlay msg="Memuat promo..." />}

      {/* Hero */}
      <div style={{ background:'white',borderRadius:'22px',padding:'22px 24px',border:'1px solid rgba(0,0,0,0.05)',boxShadow:'0 2px 20px rgba(0,0,0,0.055)',position:'relative',overflow:'hidden',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',flexWrap:'wrap' }}>
        <div style={{ position:'absolute',top:0,right:0,bottom:0,width:'38%',background:'linear-gradient(135deg,transparent,rgba(232,98,42,0.04) 50%,rgba(232,98,42,0.07))',pointerEvents:'none' }}/>
        <div style={{ flex:1,minWidth:0,position:'relative' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',fontWeight:'700',color:C.orange,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'7px' }}><GiftIcon/><span>Promo & Bundle</span></div>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:'24px',fontWeight:'800',color:'#1a1612',letterSpacing:'-0.04em',lineHeight:1,marginBottom:'5px' }}>Manajemen Promo</h1>
          <p style={{ fontSize:'13px',color:C.sub,marginBottom:'18px' }}>Buat bundle menu dengan harga spesial, jam aktif, dan variasi menu</p>
          <div style={{ display:'flex',gap:'10px',flexWrap:'wrap' }}>
            {[{v:promos.length,l:'Total',bg:C.orangeLight,c:C.orange},{v:activeCount,l:'Aktif',bg:C.primaryLight,c:C.primary},...(expiredCount>0?[{v:expiredCount,l:'Berakhir',bg:C.redLight,c:C.red}]:[])].map((s,i) => (
              <div key={i} style={{ borderRadius:'12px',padding:'10px 16px',background:s.bg,border:'1px solid rgba(0,0,0,0.04)' }}>
                <p style={{ margin:0,fontFamily:"'Sora',sans-serif",fontSize:'20px',fontWeight:'800',color:s.c,letterSpacing:'-0.02em',lineHeight:1 }}>{s.v}</p>
                <p style={{ margin:'2px 0 0',fontSize:'10.5px',color:C.sub,fontWeight:'600' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={()=>{ setEditing(null); setShowForm(true); }} style={{ display:'flex',alignItems:'center',gap:'8px',padding:'11px 20px',border:'none',borderRadius:'13px',cursor:'pointer',background:`linear-gradient(135deg,${C.orangeDark},${C.orange},${C.accent})`,color:'white',fontSize:'13px',fontWeight:'700',fontFamily:'inherit',boxShadow:'0 5px 18px rgba(232,98,42,0.38)',transition:'all 0.2s',flexShrink:0,alignSelf:'flex-start' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 8px 24px rgba(232,98,42,0.45)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 5px 18px rgba(232,98,42,0.38)';}}
        ><FireIcon/><span>Buat Promo</span></button>
      </div>

      {/* Empty state */}
      {!loading && promos.length === 0 && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'56px 24px',gap:'8px',textAlign:'center',background:'white',borderRadius:'22px',border:'1px dashed #d8d4cc' }}>
          <Lottie animationData={lottieTree} loop autoplay style={{ width:140,height:140,opacity:0.7 }} />
          <p style={{ fontSize:'16px',fontWeight:'700',color:C.text }}>Belum ada promo</p>
          <p style={{ fontSize:'13px',color:C.sub,maxWidth:'320px',lineHeight:1.5 }}>Buat bundle menu dengan harga spesial, atur jam aktif harian, dan pilih variasi menu</p>
          <button onClick={()=>{ setEditing(null); setShowForm(true); }} style={{ marginTop:'8px',display:'flex',alignItems:'center',gap:'7px',padding:'10px 22px',border:'none',borderRadius:'12px',cursor:'pointer',background:`linear-gradient(135deg,${C.orangeDark},${C.orange})`,color:'white',fontSize:'13px',fontWeight:'700',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(232,98,42,0.35)' }}>
            <FireIcon/>Buat Promo Pertama
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && promos.length > 0 && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px' }}>
          {enrichedPromos.map(promo => (
            <PromoCard key={promo.id} promo={promo as any}
              onEdit={()=>{ setEditing(promos.find(p=>p.id===promo.id)??null); setShowForm(true); }}
              onDelete={()=>handleDelete(promo.id)}
              onToggle={()=>handleToggle(promos.find(p=>p.id===promo.id)!)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }} onClick={()=>{ setShowForm(false); setEditing(null); }}>
          <div style={{ background:'white',borderRadius:'24px',width:'100%',maxWidth:'540px',maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 28px 72px rgba(0,0,0,0.28)',animation:'pm-modal-in 0.28s cubic-bezier(0.23,1,0.32,1)',overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 22px 16px',borderBottom:'1px solid #f0ede8',flexShrink:0,background:'#faf9f6' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={{ width:38,height:38,borderRadius:11,background:C.orangeLight,color:C.orange,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${C.orangeBorder}` }}><GiftIcon/></div>
                <div>
                  <h3 style={{ margin:0,fontSize:'16px',fontWeight:'800',color:C.text,lineHeight:1 }}>{editing ? 'Edit Promo' : 'Buat Promo Bundle'}</h3>
                  <p style={{ margin:'3px 0 0',fontSize:'12px',color:C.sub }}>{editing ? `Perbarui "${editing.name}"` : 'Bundle menu + jam aktif + variasi'}</p>
                </div>
              </div>
              <button onClick={()=>{ setShowForm(false); setEditing(null); }} style={{ width:32,height:32,borderRadius:9,border:'none',background:'#ede9e3',color:C.sub,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s' }}><XIcon/></button>
            </div>
            <div style={{ overflowY:'auto',padding:'22px',flex:1 }}>
              <PromoForm promo={editing} menus={menus} onSave={handleSave} onCancel={()=>{ setShowForm(false); setEditing(null); }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');
        @keyframes pm-fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pm-modal-in { from{opacity:0;transform:scale(.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pm-blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes pm-shine { 0%,100%{opacity:0;transform:translateX(-100%)} 50%{opacity:1;transform:translateX(100%)} }
      `}</style>
    </div>
  );
};
