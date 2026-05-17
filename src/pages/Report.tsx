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
const IconChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;

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
  <div className="rp-loading-overlay">
    <div className="rp-loading-card">
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
  const [isMobile, setIsMobile] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const mobileH = isMobile ? 200 : height;

  if (!data || data.length === 0) return (
    <div style={{ height: mobileH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '13px' }}>
      Belum ada data untuk periode ini
    </div>
  );

  const W = 720; const H = mobileH;
  const PAD = isMobile ? { t: 16, r: 12, b: 36, l: 52 } : { t: 24, r: 24, b: 44, l: 76 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const n = data.length;

  const revVals = data.map(d => d.revenue);
  const expVals = data.map(d => d.expense);
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

  const onMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || isMobile) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    if (!clientX) return;
    const relX = (clientX - rect.left) * (W / rect.width) - PAD.l;
    const idx = Math.max(0, Math.min(n - 1, n === 1 ? 0 : Math.round((relX / cW) * (n - 1))));
    setTooltip({ x: toX(idx), y: toY(revVals[idx]), yExp: toY(expVals[idx]), idx });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: mobileH }}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMove} onTouchMove={onMove}
        onMouseLeave={() => setTooltip(null)} onTouchEnd={() => setTooltip(null)}>
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
            <text x={PAD.l - (isMobile ? 6 : 10)} y={t.y + 4} textAnchor="end"
              fontSize={isMobile ? "8" : "10"} fill={C.sub}
              fontFamily="Plus Jakarta Sans, sans-serif">
              {t.val >= 1e6 ? `${(t.val / 1e6).toFixed(1)}M` : t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}K` : t.val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, idx) => {
          const showLabel = !isMobile || idx % 2 === 0 || idx === data.length - 1;
          return showLabel ? (
            <text key={idx} x={toX(idx)} y={H - (isMobile ? 8 : 10)} textAnchor="middle"
              fontSize={isMobile ? "8" : "10"} fill={C.sub} fontFamily="Plus Jakarta Sans, sans-serif">
              {d.date.slice(5)}
            </text>
          ) : null;
        })}

        {/* Expense area + smooth path */}
        <polygon points={area(expVals)} fill="url(#rp-exp-grad)" />
        <path d={smoothPath(expVals)} fill="none" stroke={C.red} strokeWidth={isMobile ? "1.5" : "2"}
          strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
        {(!isMobile || data.length <= 7) && expVals.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={isMobile ? "2.5" : "3.5"} fill={C.red} stroke="white" strokeWidth={isMobile ? "1.5" : "2"} />
        ))}

        {/* Revenue area + smooth path */}
        <polygon points={area(revVals)} fill="url(#rp-rev-grad)" />
        <path d={smoothPath(revVals)} fill="none" stroke={C.primary} strokeWidth={isMobile ? "2" : "2.5"}
          strokeLinejoin="round" strokeLinecap="round" filter="url(#rp-glow)" />
        {(!isMobile || data.length <= 7) && revVals.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={isMobile ? "2.5" : "3.5"} fill={C.primary} stroke="white" strokeWidth={isMobile ? "1.5" : "2"} />
        ))}

        {/* Crosshair - desktop only */}
        {tooltip && !isMobile && (
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

      {/* Tooltip popup - desktop only */}
      {tooltip && !isMobile && (
        <div className="rp-chart-tooltip" style={{
          left: `clamp(4px, calc(${(tooltip.x / W) * 100}% - 85px), calc(100% - 174px))`,
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
      <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', marginTop: isMobile ? '6px' : '10px' }}>
        {[{ c: C.primary, l: 'Pendapatan' }, { c: C.red, l: 'Pengeluaran' }].map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: isMobile ? '10px' : '12px', color: C.sub, fontWeight: 500 }}>
            <div style={{ width: '22px', height: '3px', borderRadius: '2px', background: x.c }} />
            {x.l}
          </div>
        ))}
      </div>

      {/* Mobile summary cards below chart */}
      {isMobile && data.length > 0 && (
        <div className="rp-mobile-chart-summary">
          <div className="rp-mobile-chart-summary-item">
            <span className="rp-mobile-chart-summary-label">Total Pendapatan</span>
            <span className="rp-mobile-chart-summary-value" style={{ color: C.primary }}>
              {formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}
            </span>
          </div>
          <div className="rp-mobile-chart-summary-item">
            <span className="rp-mobile-chart-summary-label">Total Pengeluaran</span>
            <span className="rp-mobile-chart-summary-value" style={{ color: C.red }}>
              {formatCurrency(data.reduce((s, d) => s + d.expense, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Animated Bar Chart ─────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; revenue: number; expense: number }[] }> = ({ data }) => {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, [data]);

  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: '32px', color: C.sub, fontSize: '13px' }}>Belum ada data</div>
  );

  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense]), 1) * 1.15;
  const barH = isMobile ? 100 : 130;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? '2px' : '4px', height: `${barH + 30}px`, padding: '0 2px' }}>
      {data.map((d, i) => {
        const revH = Math.max(2, (d.revenue / maxVal) * barH);
        const expH = Math.max(0, (d.expense / maxVal) * barH);
        const isHov = hovered === i;
        const showLabel = !isMobile || data.length <= 14 || i % 3 === 0 || i === data.length - 1;
        const barW = isMobile ? (d.expense > 0 ? '6px' : '8px') : (d.expense > 0 ? '8px' : '12px');

        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'default', position: 'relative' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {isHov && !isMobile && (
              <div className="rp-bar-tooltip">
                <p style={{ margin: '0 0 4px', fontWeight: 700, color: C.text }}>{d.label}</p>
                <p style={{ margin: '0 0 2px', color: C.primary, fontWeight: 700 }}>↑ {formatCurrency(d.revenue)}</p>
                {d.expense > 0 && <p style={{ margin: 0, color: C.red, fontWeight: 700 }}>↓ {formatCurrency(d.expense)}</p>}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? '1px' : '2px', height: `${barH}px` }}>
              <div style={{
                width: barW,
                borderRadius: '4px 4px 0 0',
                background: C.primary,
                opacity: isHov ? 1 : 0.82,
                height: animated ? `${revH}px` : '0px',
                transition: `height 0.55s cubic-bezier(0.34,1.1,0.64,1) ${i * 25}ms, opacity 0.15s`,
                boxShadow: isHov ? `0 4px 12px ${C.primary}44` : 'none',
              }} />
              {d.expense > 0 && (
                <div style={{
                  width: barW === '6px' ? '5px' : '6px',
                  borderRadius: '4px 4px 0 0',
                  background: C.red,
                  opacity: isHov ? 1 : 0.72,
                  height: animated ? `${expH}px` : '0px',
                  transition: `height 0.55s cubic-bezier(0.34,1.1,0.64,1) ${i * 25 + 50}ms, opacity 0.15s`,
                  boxShadow: isHov ? `0 4px 12px ${C.red}44` : 'none',
                }} />
              )}
            </div>
            {showLabel && (
              <span style={{
                fontSize: isMobile ? '7px' : '9px', fontWeight: isHov ? 700 : 500,
                color: isHov ? C.text : C.sub, transition: 'color 0.15s',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
              }}>
                {d.label.length > (isMobile ? 3 : 5) ? d.label.slice(0, isMobile ? 3 : 5) : d.label}
              </span>
            )}
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
          <div className="rp-stat-trend" style={{
            color: trend >= 0 ? C.primary : C.red,
            background: trend >= 0 ? C.primaryLight : C.redLight,
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { loadReports(); }, [selectedDate]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const month = parseInt(selectedDate.split('-')[1], 10);
      const [daily, monthly, revenue] = await Promise.all([
        reportApi.getDailyReport(selectedDate),
        reportApi.getMonthlyReport(month),
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
    <div className="rp-no-access">
      <IconLock />
      <p>Anda tidak memiliki akses ke halaman ini</p>
    </div>
  );

  const weekDates = get7DayWindow(selectedDate);
  const revenueMap = new Map<string, number>();
  (revenueSummary?.data || []).forEach((d: any) => {
    revenueMap.set(toDateStr(d.date), d.revenue ?? 0);
  });

  const expenseMap = new Map<string, number>();
  (monthlyReport?.daily || []).forEach((d: any) => {
    expenseMap.set(toDateStr(d.date), d.expense ?? 0);
  });

  const chartData: ChartPoint[] = weekDates.map(dateStr => ({
    date: dateStr,
    revenue: revenueMap.get(dateStr) ?? 0,
    expense: expenseMap.get(dateStr) ?? 0,
  }));

  const barData = (monthlyReport?.daily || []).slice(-14).map((d: any) => ({
    label: d.date ? toDateStr(d.date).slice(5) : '',
    revenue: d.revenue || 0,
    expense: d.expense || 0,
  }));

  const totalRevenue = dailyReport?.total_revenue || 0;
  const totalExpenses = dailyReport?.total_expenses || 0;
  const totalOrders = dailyReport?.total_orders || 0;
  const netProfit = dailyReport?.net_profit || 0;

  const weekLabel = weekDates.length === 7
    ? `${weekDates[0].slice(5)} – ${weekDates[6].slice(5)}`
    : '7 hari terakhir';

  const monthlyData = monthlyReport?.daily || [];
  const monthlyTotal = {
    orders: monthlyReport?.total_orders || 0,
    revenue: monthlyReport?.total_revenue || 0,
    expense: monthlyReport?.total_expense || 0,
    profit: monthlyReport?.total_profit || 0,
  };

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
          <div className="rp-date-wrap">
            <span className="rp-date-icon" style={{ color: dateFocused ? C.primary : C.sub }}>
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
              <IconPlus /> {!isMobile && 'Tambah Pengeluaran'}
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
              {revenueSummary && !isMobile && (
                <div style={{ textAlign: 'right' }}>
                  <p className="rp-card-header-value">
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
              <div className="rp-legend-row">
                {[{ c: C.primary, l: 'Pendapatan' }, { c: C.red, l: 'Pengeluaran' }].map((x, i) => (
                  <div key={i} className="rp-legend-item">
                    <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: x.c }} />
                    {x.l}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly table - Desktop */}
            <div className="rp-card rp-table-card rp-table-card--desktop">
              <div className="rp-card-header" style={{ marginBottom: 16 }}>
                <div>
                  <h3 className="rp-card-title">Laporan Bulanan</h3>
                  <p className="rp-card-sub">Ringkasan per hari</p>
                </div>
                <div className="rp-monthly-pills">
                  <span className="rp-pill rp-pill--rev">
                    {formatCurrency(monthlyTotal.revenue)}
                  </span>
                  <span className="rp-pill rp-pill--exp">
                    -{formatCurrency(monthlyTotal.expense)}
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
                    {monthlyData.map((day: any, i: number) => {
                      const profit = day.net_profit || 0;
                      return (
                        <tr key={i} className="rp-tr">
                          <td className="rp-td rp-td-date">{toDateStr(day.date) || '—'}</td>
                          <td className="rp-td rp-td-right">{day.order_count || 0}</td>
                          <td className="rp-td rp-td-right rp-td-rev">{formatCurrency(day.revenue || 0)}</td>
                          <td className="rp-td rp-td-right rp-td-exp">{formatCurrency(day.expense || 0)}</td>
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
                      <td className="rp-td rp-td-right rp-tfoot-val">{monthlyTotal.orders}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val rp-td-rev">{formatCurrency(monthlyTotal.revenue)}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val rp-td-exp">{formatCurrency(monthlyTotal.expense)}</td>
                      <td className="rp-td rp-td-right rp-tfoot-val" style={{ color: monthlyTotal.profit >= 0 ? C.primary : C.red }}>
                        {formatCurrency(monthlyTotal.profit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ── MOBILE: Monthly Report Cards ── */}
            <div className="rp-card rp-table-card rp-table-card--mobile">
              <div className="rp-mobile-monthly-header">
                <div className="rp-mobile-monthly-header-top">
                  <div>
                    <h3 className="rp-card-title">Laporan Bulanan</h3>
                    <p className="rp-card-sub">
                      {monthlyData.length} hari · {new Date(selectedDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    className="rp-mobile-table-toggle"
                    onClick={() => setShowMonthlyTable(!showMonthlyTable)}
                    aria-expanded={showMonthlyTable}
                  >
                    <span className="rp-mobile-table-toggle-text">
                      {showMonthlyTable ? 'Sembunyikan' : 'Lihat Detail'}
                    </span>
                    <span className={`rp-mobile-table-toggle-chevron ${showMonthlyTable ? 'rp-mobile-table-toggle-chevron--open' : ''}`}>
                      <IconChevronDown />
                    </span>
                  </button>
                </div>

                <div className="rp-mobile-monthly-quick-stats">
                  <div className="rp-mobile-quick-stat">
                    <span className="rp-mobile-quick-stat-label">Pendapatan</span>
                    <span className="rp-mobile-quick-stat-value" style={{ color: C.primary }}>
                      {formatCurrency(monthlyTotal.revenue)}
                    </span>
                  </div>
                  <div className="rp-mobile-quick-stat">
                    <span className="rp-mobile-quick-stat-label">Pengeluaran</span>
                    <span className="rp-mobile-quick-stat-value" style={{ color: C.red }}>
                      {formatCurrency(monthlyTotal.expense)}
                    </span>
                  </div>
                  <div className="rp-mobile-quick-stat">
                    <span className="rp-mobile-quick-stat-label">Orders</span>
                    <span className="rp-mobile-quick-stat-value" style={{ color: C.blue }}>
                      {monthlyTotal.orders}
                    </span>
                  </div>
                  <div className="rp-mobile-quick-stat">
                    <span className="rp-mobile-quick-stat-label">Laba</span>
                    <span className="rp-mobile-quick-stat-value" style={{ color: monthlyTotal.profit >= 0 ? C.purple : C.red }}>
                      {formatCurrency(monthlyTotal.profit)}
                    </span>
                  </div>
                </div>
              </div>

              {showMonthlyTable && (
                <div className="rp-mobile-monthly-days">
                  {monthlyData.length === 0 ? (
                    <div className="rp-mobile-monthly-empty">
                      <p>Belum ada data untuk bulan ini</p>
                    </div>
                  ) : (
                    monthlyData.map((day: any, i: number) => {
                      const profit = day.net_profit || 0;
                      const isProfit = profit >= 0;
                      const dateLabel = day.date ? toDateStr(day.date) : '—';
                      const dayName = day.date 
                        ? new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })
                        : '';
                      
                      return (
                        <div key={i} className="rp-mobile-day-card">
                          <div className="rp-mobile-day-card-left">
                            <div className={`rp-mobile-day-dot ${isProfit ? 'rp-mobile-day-dot--profit' : 'rp-mobile-day-dot--loss'}`} />
                            <div>
                              <p className="rp-mobile-day-date">
                                {dateLabel.slice(5)}
                                <span className="rp-mobile-day-name">{dayName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="rp-mobile-day-card-right">
                            <div className="rp-mobile-day-metrics">
                              <span className="rp-mobile-day-metric">
                                <span className="rp-mobile-day-metric-label">Orders</span>
                                <span className="rp-mobile-day-metric-value">{day.order_count || 0}</span>
                              </span>
                              <span className="rp-mobile-day-metric rp-mobile-day-metric--rev">
                                <span className="rp-mobile-day-metric-label">Rev</span>
                                <span className="rp-mobile-day-metric-value">{formatCurrency(day.revenue || 0)}</span>
                              </span>
                              <span className="rp-mobile-day-metric rp-mobile-day-metric--exp">
                                <span className="rp-mobile-day-metric-label">Exp</span>
                                <span className="rp-mobile-day-metric-value">{formatCurrency(day.expense || 0)}</span>
                              </span>
                              <span className={`rp-mobile-day-metric ${isProfit ? 'rp-mobile-day-metric--profit' : 'rp-mobile-day-metric--loss'}`}>
                                <span className="rp-mobile-day-metric-label">Laba</span>
                                <span className="rp-mobile-day-metric-value">
                                  {isProfit ? '+' : ''}{formatCurrency(profit)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        <div className="rp-card" style={{ padding: isMobile ? '16px' : '24px' }}>
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
        @keyframes rp-expand-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .rp-root {
          display: flex; flex-direction: column; gap: 20px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          animation: rp-fade-up 0.35s ease;
        }

        .rp-loading-overlay {
          position: fixed; inset: 0; z-index: 9998;
          display: flex; align-items: center; justify-content: center;
          background: rgba(244,240,232,0.65); backdrop-filter: blur(8px);
        }
        .rp-loading-card {
          background: white; border-radius: 28px; padding: 36px 52px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(91,140,90,0.1);
          border: 1px solid rgba(91,140,90,0.1);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          animation: rp-card-in 0.28s cubic-bezier(0.34,1.1,0.64,1);
        }
        .rp-loading-text { font-size: 15px; font-weight: 700; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; margin-top: 4px; }
        .rp-dots { display: flex; gap: 5px; }
        .rp-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: rp-blink 1.4s ease-in-out infinite;
        }
        .rp-dots span:nth-child(2){animation-delay:.2s}
        .rp-dots span:nth-child(3){animation-delay:.4s}

        .rp-no-access {
          display: flex; align-items: center; justify-content: center;
          height: 60vh; flex-direction: column; gap: 14px; color: ${C.sub};
          font-size: 14px; font-weight: 600;
        }

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

        .rp-date-wrap { position: relative; display: flex; align-items: center; }
        .rp-date-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; pointer-events: none; transition: color 0.2s;
        }
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
          transition: all 0.2s; white-space: nowrap;
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
        .rp-stat-trend {
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 700;
          border-radius: 100px; padding: 3px 8px;
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
        .rp-card-header-value {
          margin: 0 0 2px; font-size: 22px; font-weight: 800;
          color: ${C.primary}; letter-spacing: -0.03em;
          font-family: 'Sora', sans-serif;
        }

        .rp-content { display: flex; flex-direction: column; gap: 18px; }
        .rp-bottom-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 18px;
        }

        .rp-chart-tooltip {
          position: absolute; top: 16px;
          background: white; border-radius: 12px; padding: 11px 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13); border: 1px solid rgba(0,0,0,0.06);
          font-size: 12px; pointer-events: none; min-width: 165px; z-index: 10;
        }
        .rp-bar-tooltip {
          position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          background: white; border-radius: 10px; padding: 9px 12px; font-size: 11px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.06);
          white-space: nowrap; z-index: 10; margin-bottom: 5px; pointer-events: none;
        }

        .rp-legend-row { display: flex; gap: 14px; justify-content: center; margin-top: 14px; }
        .rp-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: ${C.sub}; }

        .rp-monthly-pills { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
        .rp-pill {
          font-size: 11px; font-weight: 700; border-radius: 100px; padding: 3px 10px;
        }
        .rp-pill--rev { background: ${C.primaryLight}; color: ${C.primary}; }
        .rp-pill--exp { background: ${C.redLight}; color: ${C.red}; }

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
        .rp-td-rev { color: ${C.primary}; font-weight: 700; }
        .rp-td-exp { color: ${C.red}; }
        .rp-tfoot-row { background: #f9f8f5; border-top: 1.5px solid #e8e4de; }
        .rp-tfoot-label { font-weight: 800; color: ${C.text}; font-size: 12px; padding: 10px; }
        .rp-tfoot-val { text-align: right; font-weight: 800; font-size: 12px; padding: 10px; }

        /* ═══════════════════════════════════════════ */
        /* ── MOBILE MONTHLY TABLE CARDS ── */
        /* ═══════════════════════════════════════════ */
        .rp-table-card--mobile { display: none; }

        .rp-mobile-monthly-header {
          display: flex; flex-direction: column; gap: 14px;
        }
        .rp-mobile-monthly-header-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 8px;
        }

        .rp-mobile-table-toggle {
          display: flex; align-items: center; gap: 6px;
          border: 1.5px solid #e8e4dc;
          background: white; border-radius: 10px;
          padding: 7px 12px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: ${C.sub};
          transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
        }
        .rp-mobile-table-toggle:hover { background: #f5f2ed; color: ${C.text}; }
        .rp-mobile-table-toggle[aria-expanded="true"] {
          background: ${C.primary}; color: white; border-color: ${C.primary};
        }
        .rp-mobile-table-toggle-text { font-size: 12px; }
        .rp-mobile-table-toggle-chevron {
          display: flex; align-items: center; transition: transform 0.25s ease;
        }
        .rp-mobile-table-toggle-chevron--open { transform: rotate(180deg); }

        .rp-mobile-monthly-quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .rp-mobile-quick-stat {
          background: #f9f8f5; border-radius: 10px;
          padding: 8px 10px; text-align: center;
          display: flex; flex-direction: column; gap: 2px;
        }
        .rp-mobile-quick-stat-label {
          font-size: 9px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .rp-mobile-quick-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 800; letter-spacing: -0.02em;
        }

        .rp-mobile-monthly-days {
          display: flex; flex-direction: column; gap: 4px;
          margin-top: 14px;
          animation: rp-expand-in 0.25s ease;
          max-height: 60vh;
          overflow-y: auto;
          border-top: 1px solid #f0ede8;
          padding-top: 12px;
        }
        .rp-mobile-monthly-empty {
          text-align: center; padding: 24px;
          color: ${C.sub}; font-size: 13px;
        }

        .rp-mobile-day-card {
          display: flex; align-items: stretch;
          background: #faf9f6; border-radius: 12px;
          padding: 10px 12px; gap: 12px;
          transition: background 0.15s;
          border: 1px solid transparent;
        }
        .rp-mobile-day-card:active { background: #f0ede8; }
        .rp-mobile-day-card-left {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0; min-width: 70px;
        }
        .rp-mobile-day-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .rp-mobile-day-dot--profit { background: ${C.primary}; }
        .rp-mobile-day-dot--loss { background: ${C.red}; }
        .rp-mobile-day-date {
          font-size: 12px; font-weight: 700; color: ${C.text};
          line-height: 1.2;
        }
        .rp-mobile-day-name {
          display: block; font-size: 10px; font-weight: 500;
          color: ${C.sub}; margin-top: 1px;
        }
        .rp-mobile-day-card-right {
          flex: 1; min-width: 0;
        }
        .rp-mobile-day-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
        }
        .rp-mobile-day-metric {
          display: flex; flex-direction: column; gap: 1px;
          text-align: center;
        }
        .rp-mobile-day-metric-label {
          font-size: 8px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .rp-mobile-day-metric-value {
          font-size: 10.5px; font-weight: 700; color: ${C.text};
        }
        .rp-mobile-day-metric--rev .rp-mobile-day-metric-value { color: ${C.primary}; }
        .rp-mobile-day-metric--exp .rp-mobile-day-metric-value { color: ${C.red}; }
        .rp-mobile-day-metric--profit .rp-mobile-day-metric-value { color: ${C.purple}; }
        .rp-mobile-day-metric--loss .rp-mobile-day-metric-value { color: ${C.red}; }

        /* Mobile chart summary */
        .rp-mobile-chart-summary {
          display: none;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: ${C.primaryLight};
          border-radius: 12px;
          border: 1px solid rgba(91,140,90,0.1);
        }
        .rp-mobile-chart-summary-item {
          display: flex; flex-direction: column; gap: 3px;
        }
        .rp-mobile-chart-summary-label {
          font-size: 10px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .rp-mobile-chart-summary-value {
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 800;
        }

        /* ═══════════ RESPONSIVE ═══════════ */
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
          .rp-header-actions { align-self: flex-start; flex-wrap: wrap; width: 100%; }
          .rp-date-wrap { flex: 1; }
          .rp-date-input { width: 100%; }
          .rp-title { font-size: 20px; }
          .rp-subtitle { font-size: 12px; }
          .rp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .rp-stat-card { padding: 14px 16px; border-radius: 16px; }
          .rp-stat-value { font-size: 17px; }
          .rp-stat-label { font-size: 10px; }
          .rp-stat-icon-wrap { width: 34px; height: 34px; border-radius: 10px; }
          .rp-stat-icon-wrap svg { width: 17px; height: 17px; }
          .rp-card { padding: 16px; border-radius: 18px; }
          .rp-card-header { flex-direction: column; gap: 10px; margin-bottom: 14px; }
          .rp-card-title { font-size: 14px; }
          .rp-tabs { padding: 4px; }
          .rp-tab { padding: 8px 14px; font-size: 12px; }
          .rp-btn-primary { padding: 9px 14px; font-size: 12px; }
          .rp-date-input { font-size: 12px; padding: 8px 10px 8px 30px; }
          .rp-date-icon { left: 10px; }
          .rp-date-icon svg { width: 12px; height: 12px; }

          .rp-table-card--desktop { display: none; }
          .rp-table-card--mobile { display: block; }

          .rp-mobile-chart-summary { display: grid; }
          .rp-bottom-grid { gap: 12px; }
        }
        @media (max-width: 479px) {
          .rp-stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .rp-stat-value { font-size: 15px; }
          .rp-stat-card { padding: 12px 14px; border-radius: 14px; }
          .rp-stat-icon-wrap { width: 30px; height: 30px; border-radius: 8px; }
          .rp-title { font-size: 18px; }
          .rp-header-actions { flex-direction: column; gap: 8px; }
          .rp-btn-primary { width: 100%; justify-content: center; }
          .rp-card { padding: 14px; border-radius: 16px; }
          .rp-card-header-value { font-size: 18px; }
          .rp-loading-card { padding: 28px 24px; border-radius: 22px; }

          .rp-mobile-monthly-quick-stats { grid-template-columns: repeat(2, 1fr); gap: 4px; }
          .rp-mobile-quick-stat { padding: 6px 8px; }
          .rp-mobile-quick-stat-value { font-size: 11px; }

          .rp-mobile-day-card { padding: 8px 10px; gap: 8px; }
          .rp-mobile-day-card-left { min-width: 55px; }
          .rp-mobile-day-date { font-size: 11px; }
          .rp-mobile-day-metrics { grid-template-columns: repeat(4, 1fr); gap: 2px; }
          .rp-mobile-day-metric-value { font-size: 9.5px; }
          .rp-mobile-day-metric-label { font-size: 7px; }

          .rp-mobile-table-toggle { padding: 5px 10px; font-size: 11px; }
          .rp-mobile-table-toggle-text { font-size: 11px; }
        }
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .rp-stats-grid { grid-template-columns: repeat(4, 1fr); }
          .rp-bottom-grid { grid-template-columns: 260px 1fr; }
          .rp-table-card--desktop { display: block; }
          .rp-table-card--mobile { display: none; }
        }
      `}</style>
    </div>
  );
};