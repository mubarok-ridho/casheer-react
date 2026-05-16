import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../api/report';
import { ExpenseList } from '../components/report/ExpenseList';
import { ExpenseForm } from '../components/report/ExpenseForm';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../utils/format';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import toast from 'react-hot-toast';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconRevenue = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const IconOrders = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
const IconExpense = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const IconProfit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconChart = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconTable = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" /></svg>;
const IconLock = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IconTrend = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#f4f0e8',
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  accent: '#E8A23A', accentLight: '#fff8e8',
  blue: '#4AA8D8', blueLight: '#e8f5fb',
  red: '#E8604A', redLight: '#fdecea',
  purple: '#9B6DD4', purpleLight: '#f2ecfb',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
};

// ── Helper: normalize date string to YYYY-MM-DD ───────────────────────────────
const toDateStr = (d: string | undefined | null): string => {
  if (!d) return '';
  return d.slice(0, 10);
};

// ── Helper: get 7-day window ending on selectedDate ───────────────────────────
const get7DayWindow = (endDateStr: string): string[] => {
  const result: string[] = [];
  const end = new Date(endDateStr);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
};

// ── Lottie Loading Overlay ────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9998,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(244,240,232,0.65)', backdropFilter: 'blur(8px)',
  }}>
    <div style={{
      background: 'white', borderRadius: '28px', padding: '36px 52px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(91,140,90,0.1)',
      border: '1px solid rgba(91,140,90,0.1)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      animation: 'rp-card-in 0.28s cubic-bezier(0.34,1.1,0.64,1)',
    }}>
      <Lottie animationData={lottieTree} loop autoplay style={{ width: 180, height: 180 }} />
      <p className="rp-loading-text">Memuat laporan...</p>
      <div className="rp-dots"><span /><span /><span /></div>
    </div>
  </div>
);

// ── Area + Line Chart ─────────────────────────────────────────────────────────
interface ChartPoint { date: string; revenue: number; expense: number; }

const AreaLineChart: React.FC<{ data: ChartPoint[]; height?: number }> = ({ data, height = 280 }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; yExp: number; idx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '13px' }}>
      Belum ada data untuk periode ini
    </div>
  );

  const W = 720; const H = height;
  const PAD = { t: 24, r: 24, b: 44, l: 76 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const n = data.length;

  const revVals = data.map(d => d.revenue);
  const expVals = data.map(d => d.expense);

  // selalu render kedua line; pakai maxVal dari gabungan keduanya
  const maxVal = Math.max(...revVals, ...expVals, 1) * 1.18;

  const toX = (i: number) => n === 1 ? PAD.l + cW / 2 : PAD.l + (i / (n - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - (v / maxVal) * cH;

  const area = (vals: number[]) => {
    const pts = vals.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    return `${pts} ${toX(n - 1).toFixed(1)},${(PAD.t + cH).toFixed(1)} ${toX(0).toFixed(1)},${(PAD.t + cH).toFixed(1)}`;
  };

  const smoothPath = (vals: number[]) => {
    if (vals.length < 2) return `M ${toX(0)} ${toY(vals[0])}`;
    let d = `M ${toX(0)} ${toY(vals[0])}`;
    for (let i = 1; i < vals.length; i++) {
      const cp1x = (toX(i - 1) + toX(i)) / 2;
      d += ` C ${cp1x} ${toY(vals[i - 1])}, ${cp1x} ${toY(vals[i])}, ${toX(i)} ${toY(vals[i])}`;
    }
    return d;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ val: maxVal * p, y: toY(maxVal * p) }));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width) - PAD.l;
    const idx = Math.max(0, Math.min(n - 1, n === 1 ? 0 : Math.round((relX / cW) * (n - 1))));
    setTooltip({ x: toX(idx), y: toY(revVals[idx]), yExp: toY(expVals[idx]), idx });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMove} onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="rp-rev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="rp-exp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.20" />
            <stop offset="100%" stopColor={C.red} stopOpacity="0.01" />
          </linearGradient>
          <filter id="rp-glow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y}
              stroke={i === 0 ? '#d8d4cc' : '#ece8e2'} strokeWidth={i === 0 ? 1 : 0.8}
              strokeDasharray={i === 0 ? '0' : '5 4'} />
            <text x={PAD.l - 10} y={t.y + 4} textAnchor="end" fontSize="10" fill={C.sub}
              fontFamily="Plus Jakarta Sans, sans-serif">
              {t.val >= 1e6 ? `${(t.val / 1e6).toFixed(1)}M` : t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}K` : t.val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* X labels — tampilkan semua 7 titik */}
        {data.map((d, idx) => (
          <text key={idx} x={toX(idx)} y={H - 10} textAnchor="middle"
            fontSize="10" fill={C.sub} fontFamily="Plus Jakarta Sans, sans-serif">
            {d.date.slice(5)}
          </text>
        ))}

        {/* ── Expense area + smooth path (selalu dirender) ── */}
        <polygon points={area(expVals)} fill="url(#rp-exp-grad)" />
        <path d={smoothPath(expVals)} fill="none" stroke={C.red} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
        {expVals.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={C.red} stroke="white" strokeWidth="2" />
        ))}

        {/* ── Revenue area + smooth path ── */}
        <polygon points={area(revVals)} fill="url(#rp-rev-grad)" />
        <path d={smoothPath(revVals)} fill="none" stroke={C.primary} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" filter="url(#rp-glow)" />
        {revVals.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={C.primary} stroke="white" strokeWidth="2" />
        ))}

        {/* Crosshair */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={PAD.t + cH}
              stroke={C.primary} strokeWidth="1.2" strokeDasharray="5 3" opacity="0.45" />
            <circle cx={tooltip.x} cy={tooltip.y} r="6"
              fill={C.primary} stroke="white" strokeWidth="2.5" filter="url(#rp-glow)" />
            <circle cx={tooltip.x} cy={tooltip.yExp} r="5"
              fill={C.red} stroke="white" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Tooltip popup */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: '16px',
          left: `clamp(4px, calc(${(tooltip.x / W) * 100}% - 85px), calc(100% - 174px))`,
          background: 'white', borderRadius: '12px', padding: '11px 15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.13)', border: `1px solid rgba(0,0,0,0.06)`,
          fontSize: '12px', pointerEvents: 'none', minWidth: '165px', zIndex: 10,
        }}>
          <p style={{ margin: '0 0 7px', fontWeight: 700, color: C.text, fontSize: '11px' }}>
            {data[tooltip.idx].date}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.sub }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.primary }} />
                Pendapatan
              </div>
              <span style={{ fontWeight: 800, color: C.primary }}>{formatCurrency(data[tooltip.idx].revenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.sub }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red }} />
                Pengeluaran
              </div>
              <span style={{ fontWeight: 800, color: C.red }}>{formatCurrency(data[tooltip.idx].expense)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', marginTop: '10px' }}>
        {[{ c: C.primary, l: 'Pendapatan' }, { c: C.red, l: 'Pengeluaran' }].map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: C.sub, fontWeight: 500 }}>
            <div style={{ width: '22px', height: '3px', borderRadius: '2px', background: x.c }} />
            {x.l}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Animated Bar Chart ─────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; revenue: number; expense: number }[] }> = ({ data }) => {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, [data]);

  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: '32px', color: C.sub, fontSize: '13px' }}>Belum ada data</div>
  );

  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense]), 1) * 1.15;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', padding: '0 4px' }}>
      {data.map((d, i) => {
        const revH = Math.max(2, (d.revenue / maxVal) * 130);
        const expH = Math.max(0, (d.expense / maxVal) * 130);
        const isHov = hovered === i;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'default', position: 'relative' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {isHov && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'white', borderRadius: '10px', padding: '9px 12px', fontSize: '11px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)', border: `1px solid rgba(0,0,0,0.06)`,
                whiteSpace: 'nowrap', zIndex: 10, marginBottom: '5px', pointerEvents: 'none',
              }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, color: C.text }}>{d.label}</p>
                <p style={{ margin: '0 0 2px', color: C.primary, fontWeight: 700 }}>↑ {formatCurrency(d.revenue)}</p>
                {d.expense > 0 && <p style={{ margin: 0, color: C.red, fontWeight: 700 }}>↓ {formatCurrency(d.expense)}</p>}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '130px' }}>
              <div style={{
                width: d.expense > 0 ? '8px' : '12px',
                borderRadius: '4px 4px 0 0',
                background: isHov
                  ? `linear-gradient(to top, ${C.primaryDark}, ${C.primary})`
                  : C.primary,
                opacity: isHov ? 1 : 0.82,
                height: animated ? `${revH}px` : '0px',
                transition: `height 0.55s cubic-bezier(0.34,1.1,0.64,1) ${i * 25}ms, opacity 0.15s`,
                boxShadow: isHov ? `0 4px 12px ${C.primary}44` : 'none',
              }} />
              {d.expense > 0 && (
                <div style={{
                  width: '8px', borderRadius: '4px 4px 0 0',
                  background: isHov ? `linear-gradient(to top, #c94030, ${C.red})` : C.red,
                  opacity: isHov ? 1 : 0.72,
                  height: animated ? `${expH}px` : '0px',
                  transition: `height 0.55s cubic-bezier(0.34,1.1,0.64,1) ${i * 25 + 50}ms, opacity 0.15s`,
                  boxShadow: isHov ? `0 4px 12px ${C.red}44` : 'none',
                }} />
              )}
            </div>
            <span style={{
              fontSize: '9px', fontWeight: isHov ? 700 : 500,
              color: isHov ? C.text : C.sub, transition: 'color 0.15s',
            }}>
              {d.label.length > 5 ? d.label.slice(0, 5) : d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string;
  sub?: string; color: string; bg: string; trend?: number;
}> = ({ icon, label, value, sub, color, bg, trend }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rp-stat-card"
      style={{ '--card-color': color, '--card-bg': bg } as React.CSSProperties}
    >
      <div className="rp-stat-top">
        <div className="rp-stat-icon-wrap" style={{ background: bg, color }}>{icon}</div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '11px', fontWeight: 700,
            color: trend >= 0 ? C.primary : C.red,
            background: trend >= 0 ? C.primaryLight : C.redLight,
            borderRadius: '100px', padding: '3px 8px',
          }}>
            <IconTrend />
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="rp-stat-value" style={{ color: C.text }}>{value}</p>
      <p className="rp-stat-label" style={{ color }}>{label}</p>
      {sub && <p className="rp-stat-sub">{sub}</p>}
      <div className="rp-stat-bar" style={{ background: color, opacity: hov ? 1 : 0 }} />
    </div>
  );
};

// ── Main Report Page ──────────────────────────────────────────────────────────
export const Report: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses'>('revenue');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFocused, setDateFocused] = useState(false);

  // Reload semua data setiap selectedDate berubah
  useEffect(() => { loadReports(); }, [selectedDate]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const month = parseInt(selectedDate.split('-')[1], 10);
      const [daily, monthly, revenue] = await Promise.all([
        reportApi.getDailyReport(selectedDate),
        // Kirim selectedDate agar monthly report mengambil bulan yang benar
        reportApi.getMonthlyReport(month),
        // Ambil 30 hari data agar window 7 hari selalu tersedia
        reportApi.getRevenueSummary(30),
      ]);
      setDailyReport(daily);
      setMonthlyReport(monthly);
      setRevenueSummary(revenue);
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '14px', color: C.sub }}>
      <IconLock />
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Anda tidak memiliki akses ke halaman ini</p>
    </div>
  );

  // ── Build chartData: 7 hari berakhir di selectedDate ──────────────────────
  const weekDates = get7DayWindow(selectedDate); // ['2024-01-09', ..., '2024-01-15']

  // Buat lookup map dari semua data yang ada agar pencarian O(1)
  const revenueMap = new Map<string, number>();
  (revenueSummary?.data || []).forEach((d: any) => {
    revenueMap.set(toDateStr(d.date), d.revenue ?? 0);
  });

  const expenseMap = new Map<string, number>();
  (monthlyReport?.daily || []).forEach((d: any) => {
    expenseMap.set(toDateStr(d.date), d.expense ?? 0);
  });

  // Gabungkan ke 7 titik — tanggal yang tidak ada data akan bernilai 0
  const chartData: ChartPoint[] = weekDates.map(dateStr => ({
    date: dateStr,
    revenue: revenueMap.get(dateStr) ?? 0,
    expense: expenseMap.get(dateStr) ?? 0,
  }));

  // Bar chart tetap pakai 14 hari terakhir dari monthlyReport
  const barData = (monthlyReport?.daily || []).slice(-14).map((d: any) => ({
    label: d.date ? toDateStr(d.date).slice(5) : '',
    revenue: d.revenue || 0,
    expense: d.expense || 0,
  }));

  const totalRevenue = dailyReport?.total_revenue || 0;
  const totalExpenses = dailyReport?.total_expenses || 0;
  const totalOrders = dailyReport?.total_orders || 0;
  const netProfit = dailyReport?.net_profit || 0;

  // Label range 7 hari untuk subtitle chart
  const weekLabel = weekDates.length === 7
    ? `${weekDates[0].slice(5)} – ${weekDates[6].slice(5)}`
    : '7 hari terakhir';

  return (
    <div className="rp-root">
      {isLoading && <LoadingOverlay />}

      {/* ── HEADER ── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <div className="rp-header-eyebrow">
            <IconChart />
            <span>Analitik & Laporan</span>
          </div>
          <h1 className="rp-title">Laporan Bisnis</h1>
          <p className="rp-subtitle">Pantau performa dan pertumbuhan bisnis Anda</p>
        </div>

        <div className="rp-header-actions">
          {/* Date picker */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: dateFocused ? C.primary : C.sub, transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <IconCalendar />
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              onFocus={() => setDateFocused(true)}
              onBlur={() => setDateFocused(false)}
              className="rp-date-input"
              style={{
                borderColor: dateFocused ? C.primary : '#e8e4dc',
                boxShadow: dateFocused ? '0 0 0 3px rgba(91,140,90,0.1)' : '0 1px 4px rgba(0,0,0,0.07)',
              }}
            />
          </div>

          {activeTab === 'expenses' && (
            <button onClick={() => setIsExpenseModalOpen(true)} className="rp-btn-primary">
              <IconPlus /> Tambah Pengeluaran
            </button>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="rp-stats-grid">
        <StatCard icon={<IconRevenue />} label="Pendapatan" value={formatCurrency(totalRevenue)}
          sub={`${totalOrders} transaksi`} color={C.primary} bg={C.primaryLight} />
        <StatCard icon={<IconOrders />} label="Total Pesanan" value={`${totalOrders}`}
          sub="order hari ini" color={C.blue} bg={C.blueLight} />
        <StatCard icon={<IconExpense />} label="Pengeluaran" value={formatCurrency(totalExpenses)}
          sub="biaya operasional" color={C.red} bg={C.redLight} />
        <StatCard icon={<IconProfit />} label="Laba Bersih" value={formatCurrency(netProfit)}
          sub={netProfit >= 0 ? 'profit bersih' : 'perlu perhatian'}
          color={netProfit >= 0 ? C.purple : C.red}
          bg={netProfit >= 0 ? C.purpleLight : C.redLight} />
      </div>

      {/* ── TABS ── */}
      <div className="rp-tabs-wrap">
        <div className="rp-tabs">
          {[
            { k: 'revenue', l: 'Pendapatan', ico: <IconChart /> },
            { k: 'expenses', l: 'Pengeluaran', ico: <IconTable /> },
          ].map(tab => (
            <button
              key={tab.k}
              onClick={() => setActiveTab(tab.k as any)}
              className={`rp-tab ${activeTab === tab.k ? 'rp-tab--active' : ''}`}
            >
              {tab.ico} {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (
        <div className="rp-content">

          {/* ── Main area chart ── */}
          <div className="rp-card rp-chart-main">
            <div className="rp-card-header">
              <div>
                <h2 className="rp-card-title">Tren Pendapatan & Pengeluaran</h2>
                <p className="rp-card-sub">{weekLabel} · hover untuk detail</p>
              </div>
              {revenueSummary && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    margin: '0 0 2px', fontSize: '22px', fontWeight: 800,
                    color: C.primary, letterSpacing: '-0.03em',
                    fontFamily: "'Sora', sans-serif",
                  }}>
                    {formatCurrency(chartData.reduce((s, d) => s + d.revenue, 0))}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: C.sub }}>
                    Total pendapatan minggu ini
                  </p>
                </div>
              )}
            </div>
            <AreaLineChart data={chartData} height={280} />
          </div>

          {/* ── Bottom grid ── */}
          <div className="rp-bottom-grid">

            {/* Bar chart */}
            <div className="rp-card rp-bar-card">
              <div className="rp-card-header">
                <div>
                  <h3 className="rp-card-title">14 Hari Terakhir</h3>
                  <p className="rp-card-sub">Pendapatan vs pengeluaran harian</p>
                </div>
              </div>
              <BarChart data={barData} />
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '14px' }}>
                {[{ c: C.primary, l: 'Pendapatan' }, { c: C.red, l: 'Pengeluaran' }].map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: C.sub }}>
                    <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: x.c }} />
                    {x.l}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly table */}
            <div className="rp-card rp-table-card">
              <div className="rp-card-header" style={{ marginBottom: 16 }}>
                <div>
                  <h3 className="rp-card-title">Laporan Bulanan</h3>
                  <p className="rp-card-sub">Ringkasan per hari</p>
                </div>
                {/* Monthly summary pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: C.primaryLight, color: C.primary, borderRadius: '100px', padding: '3px 10px' }}>
                    {formatCurrency(monthlyReport?.total_revenue || 0)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: C.redLight, color: C.red, borderRadius: '100px', padding: '3px 10px' }}>
                    -{formatCurrency(monthlyReport?.total_expense || 0)}
                  </span>
                </div>
              </div>
              <div className="rp-table-scroll">
                <table className="rp-table">
                  <thead>
                    <tr>
                      {['Tanggal', 'Orders', 'Pendapatan', 'Pengeluaran', 'Laba'].map(h => (
                        <th key={h} className={`rp-th ${h !== 'Tanggal' ? 'rp-th-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(monthlyReport?.daily || []).map((day: any, i: number) => {
                      const profit = day.net_profit || 0;
                      return (
                        <tr key={i} className="rp-tr">
                          <td className="rp-td rp-td-date">{toDateStr(day.date) || '—'}</td>
                          <td className="rp-td rp-td-right">{day.order_count || 0}</td>
                          <td className="rp-td rp-td-right" style={{ color: C.primary, fontWeight: 700 }}>{formatCurrency(day.revenue || 0)}</td>
                          <td className="rp-td rp-td-right" style={{ color: C.red }}>{formatCurrency(day.expense || 0)}</td>
                          <td className="rp-td rp-td-right" style={{ fontWeight: 700, color: profit >= 0 ? C.primary : C.red }}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="rp-tfoot-row">
                      <td className="rp-td rp-tfoot-label">Total Bulan Ini</td>
                      <td className="rp-td rp-td-right rp-tfoot-val">{monthlyReport?.total_orders || 0}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val" style={{ color: C.primary }}>{formatCurrency(monthlyReport?.total_revenue || 0)}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val" style={{ color: C.red }}>{formatCurrency(monthlyReport?.total_expense || 0)}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val" style={{ color: (monthlyReport?.total_profit || 0) >= 0 ? C.primary : C.red }}>
                        {formatCurrency(monthlyReport?.total_profit || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        <div className="rp-card" style={{ padding: '24px' }}>
          <ExpenseList />
        </div>
      )}

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Tambah Pengeluaran" size="md">
        <ExpenseForm
          onSuccess={() => { setIsExpenseModalOpen(false); loadReports(); }}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }

        @keyframes rp-card-in { from{opacity:0;transform:scale(.9) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes rp-fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rp-blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }

        .rp-root {
          display: flex; flex-direction: column; gap: 20px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          animation: rp-fade-up 0.35s ease;
        }

        .rp-loading-text {
          font-size: 15px; font-weight: 700; color: ${C.text};
          font-family: 'Plus Jakarta Sans', sans-serif; margin-top: 4px;
        }
        .rp-dots { display: flex; gap: 5px; }
        .rp-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: rp-blink 1.4s ease-in-out infinite;
        }
        .rp-dots span:nth-child(2){animation-delay:.2s}
        .rp-dots span:nth-child(3){animation-delay:.4s}

        .rp-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .rp-header-eyebrow {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: ${C.primary};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
        }
        .rp-title {
          font-family: 'Sora', sans-serif;
          font-size: 26px; font-weight: 800; color: #1a1612;
          letter-spacing: -0.04em; line-height: 1; margin: 0 0 5px;
        }
        .rp-subtitle { font-size: 13px; color: ${C.sub}; margin: 0; }
        .rp-header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }

        .rp-date-input {
          padding: 9px 12px 9px 34px; border-radius: 11px;
          font-size: 13px; color: ${C.text}; background: white;
          border: 1.5px solid #e8e4dc; transition: all 0.2s;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .rp-btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary});
          color: white; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(91,140,90,0.3);
          transition: all 0.2s;
        }
        .rp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(91,140,90,0.38); }

        .rp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .rp-stat-card {
          background: white; border-radius: 18px; padding: 18px 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 14px rgba(0,0,0,0.055);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default; position: relative; overflow: hidden;
        }
        .rp-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.09); }
        .rp-stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
        .rp-stat-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 20px; font-weight: 800; letter-spacing: -0.03em;
          line-height: 1; margin: 0 0 4px;
        }
        .rp-stat-label {
          font-size: 10.5px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 3px;
        }
        .rp-stat-sub { font-size: 11px; color: ${C.sub}; margin: 0; }
        .rp-stat-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          border-radius: 0 0 18px 18px; transition: opacity 0.2s;
        }

        .rp-tabs-wrap { display: flex; }
        .rp-tabs {
          display: flex; gap: 4px; background: white; border-radius: 14px;
          padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .rp-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 10px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent; color: ${C.sub};
          transition: all 0.18s ease;
        }
        .rp-tab:hover { background: #f5f2ed; color: ${C.text}; }
        .rp-tab--active {
          background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary});
          color: white; box-shadow: 0 3px 10px rgba(91,140,90,0.28);
        }

        .rp-card {
          background: white; border-radius: 22px; padding: 22px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 18px rgba(0,0,0,0.055);
        }
        .rp-card-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
        }
        .rp-card-title { font-size: 15px; font-weight: 700; color: ${C.text}; margin: 0 0 3px; }
        .rp-card-sub { font-size: 11.5px; color: ${C.sub}; margin: 0; }

        .rp-content { display: flex; flex-direction: column; gap: 18px; }
        .rp-bottom-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 18px;
        }

        .rp-table-scroll { overflow-x: auto; margin: -4px; padding: 4px; }
        .rp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .rp-th {
          padding: 7px 10px; text-align: left;
          color: ${C.sub}; font-weight: 700; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.06em;
          border-bottom: 1.5px solid #f0ede8; white-space: nowrap;
        }
        .rp-th-right { text-align: right; }
        .rp-tr { border-bottom: 1px solid #f5f2ed; transition: background 0.12s; }
        .rp-tr:hover { background: #faf9f6; }
        .rp-td { padding: 8px 10px; color: ${C.text}; }
        .rp-td-date { font-weight: 600; white-space: nowrap; }
        .rp-td-right { text-align: right; }
        .rp-tfoot-row { background: #f9f8f5; border-top: 1.5px solid #e8e4de; }
        .rp-tfoot-label { font-weight: 800; color: ${C.text}; font-size: 12px; padding: 10px; }
        .rp-tfoot-val { text-align: right; font-weight: 800; font-size: 12px; padding: 10px; }

        @media (max-width: 1200px) {
          .rp-bottom-grid { grid-template-columns: 280px 1fr; }
        }
        @media (max-width: 1024px) {
          .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .rp-bottom-grid { grid-template-columns: 1fr; }
          .rp-title { font-size: 22px; }
        }
        @media (max-width: 767px) {
          .rp-root { gap: 14px; }
          .rp-header { flex-direction: column; gap: 14px; }
          .rp-header-actions { align-self: flex-start; flex-wrap: wrap; }
          .rp-title { font-size: 20px; }
          .rp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .rp-stat-card { padding: 14px 16px; border-radius: 16px; }
          .rp-stat-value { font-size: 17px; }
          .rp-card { padding: 16px; border-radius: 18px; }
          .rp-card-header { flex-direction: column; gap: 10px; }
          .rp-tabs { padding: 4px; }
          .rp-tab { padding: 8px 14px; font-size: 12px; }
          .rp-btn-primary { padding: 9px 14px; font-size: 12px; }
          .rp-date-input { font-size: 12px; }
        }
        @media (max-width: 479px) {
          .rp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .rp-stat-value { font-size: 15px; }
          .rp-stat-card { padding: 12px 14px; border-radius: 14px; }
          .rp-stat-icon-wrap { width: 32px; height: 32px; border-radius: 9px; }
          .rp-title { font-size: 18px; }
          .rp-header-actions { width: 100%; }
          .rp-btn-primary { flex: 1; justify-content: center; }
        }
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .rp-stats-grid { grid-template-columns: repeat(4, 1fr); }
          .rp-bottom-grid { grid-template-columns: 260px 1fr; }
        }
      `}</style>
    </div>
  );
};