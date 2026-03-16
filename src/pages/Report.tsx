import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../api/report';
import { ExpenseList } from '../components/report/ExpenseList';
import { ExpenseForm } from '../components/report/ExpenseForm';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconRevenue   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconOrders    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconExpense   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconProfit    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IconPlus      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCalendar  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChart     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconTable     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/></svg>;
const IconLock      = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const C = {
  bg: '#f4f0e8',
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  accent: '#E8A23A', accentLight: '#fff8e8',
  blue: '#4AA8D8', blueLight: '#e8f5fb',
  red: '#E8604A', redLight: '#fdecea',
  purple: '#9B6DD4', purpleLight: '#f2ecfb',
  text: '#2a2420', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
};

// ── Animated Line+Area Chart ───────────────────────────────────────────────────
interface ChartPoint { date: string; revenue: number; expense?: number; }

const AreaLineChart: React.FC<{ data: ChartPoint[]; height?: number }> = ({ data, height = 260 }) => {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ChartPoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, [data]);

  if (!data || data.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '13px' }}>
      Belum ada data pendapatan
    </div>
  );

  const W = 700; const H = height; const PAD = { t: 20, r: 20, b: 40, l: 72 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const maxExp = Math.max(...(data.map(d => d.expense || 0)));
  const maxVal = Math.max(maxRev, maxExp) * 1.15;

  const toX = (i: number) => PAD.l + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxVal) * chartH;

  // Smooth bezier path
  const buildPath = (vals: number[]) => {
    const pts = vals.map((v, i) => [toX(i), toY(v)] as [number, number]);
    if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i][0] + pts[i + 1][0]) / 2;
      d += ` C ${cx} ${pts[i][1]} ${cx} ${pts[i + 1][1]} ${pts[i + 1][0]} ${pts[i + 1][1]}`;
    }
    return d;
  };

  const revVals = data.map(d => d.revenue);
  const expVals = data.map(d => d.expense || 0);
  const revPath = buildPath(revVals);
  const expPath = buildPath(expVals);
  const lastX = toX(data.length - 1);
  const firstX = toX(0);
  const bottomY = PAD.t + chartH;

  const revAreaPath = `${revPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  const expAreaPath = `${expPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ val: maxVal * p, y: toY(maxVal * p) }));

  // X-axis labels (show every ~5 or fewer)
  const step = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  // Pathlen for animation
  const pathLen = chartW * 2.5;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width) - PAD.l;
    const idx = Math.round((relX / chartW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip({ x: toX(clamped), y: toY(data[clamped].revenue), point: data[clamped] });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={C.primary} stopOpacity="0.01"/>
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={C.red} stopOpacity="0.01"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="#e8e4de" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4 4'} />
            <text x={PAD.l - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill={C.sub} fontFamily="DM Sans, sans-serif">
              {t.val >= 1000000 ? `${(t.val/1000000).toFixed(1)}M` : t.val >= 1000 ? `${(t.val/1000).toFixed(0)}K` : t.val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={toX(idx)} y={H - 8} textAnchor="middle" fontSize="10" fill={C.sub} fontFamily="DM Sans, sans-serif">
              {d.date.slice(5)}
            </text>
          );
        })}

        {/* Expense area + line */}
        {expVals.some(v => v > 0) && (
          <>
            <path d={expAreaPath} fill="url(#expGrad)" style={{ transition: 'opacity 0.5s', opacity: animated ? 1 : 0 }} />
            <path d={expPath} fill="none" stroke={C.red} strokeWidth="2" strokeDasharray={pathLen} strokeDashoffset={animated ? 0 : pathLen}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          </>
        )}

        {/* Revenue area + line */}
        <path d={revAreaPath} fill="url(#revGrad)" style={{ transition: 'opacity 0.5s', opacity: animated ? 1 : 0 }} />
        <path d={revPath} fill="none" stroke={C.primary} strokeWidth="2.5" filter="url(#glow)"
          strokeDasharray={pathLen} strokeDashoffset={animated ? 0 : pathLen}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />

        {/* Tooltip crosshair */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={PAD.t + chartH} stroke={C.primary} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={C.primary} stroke="white" strokeWidth="2" filter="url(#glow)" />
          </g>
        )}
      </svg>

      {/* Tooltip popup */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: '16px',
          left: `clamp(0px, calc(${(tooltip.x / 700) * 100}% - 80px), calc(100% - 160px))`,
          background: 'white', borderRadius: '10px', padding: '10px 14px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: `1px solid ${C.border}`,
          fontSize: '12px', pointerEvents: 'none', minWidth: '150px', zIndex: 10,
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: '700', color: C.text }}>{tooltip.point.date}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: C.sub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.primary, display: 'inline-block' }} /> Pendapatan
              </span>
              <span style={{ fontWeight: '700', color: C.primary }}>{formatCurrency(tooltip.point.revenue)}</span>
            </div>
            {(tooltip.point.expense || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: C.sub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, display: 'inline-block' }} /> Pengeluaran
                </span>
                <span style={{ fontWeight: '700', color: C.red }}>{formatCurrency(tooltip.point.expense || 0)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
        {[{ color: C.primary, label: 'Pendapatan' }, { color: C.red, label: 'Pengeluaran' }].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.sub }}>
            <div style={{ width: '24px', height: '3px', borderRadius: '2px', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Bar Chart (monthly breakdown) ─────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; revenue: number; expense: number }[] }> = ({ data }) => {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState<{ idx: number } | null>(null);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, [data]);

  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '32px', color: C.sub, fontSize: '13px' }}>Belum ada data</div>;

  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense]), 1) * 1.15;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '0 4px' }}>
      {data.map((d, i) => {
        const revH = (d.revenue / maxVal) * 120;
        const expH = (d.expense / maxVal) * 120;
        const hovered = tooltip?.idx === i;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', position: 'relative' }}
            onMouseEnter={() => setTooltip({ idx: i })} onMouseLeave={() => setTooltip(null)}>
            {/* Tooltip */}
            {hovered && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'white', borderRadius: '8px', padding: '8px 10px', fontSize: '11px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`,
                whiteSpace: 'nowrap', zIndex: 10, marginBottom: '4px',
              }}>
                <p style={{ margin: '0 0 3px', fontWeight: '700', color: C.text }}>{d.label}</p>
                <p style={{ margin: 0, color: C.primary }}>↑ {formatCurrency(d.revenue)}</p>
                {d.expense > 0 && <p style={{ margin: 0, color: C.red }}>↓ {formatCurrency(d.expense)}</p>}
              </div>
            )}
            {/* Bars side by side */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px' }}>
              <div style={{
                width: '8px', borderRadius: '3px 3px 0 0', background: C.primary, opacity: hovered ? 1 : 0.8,
                height: animated ? `${revH}px` : '0px', transition: `height 0.6s cubic-bezier(0.34,1.1,0.64,1) ${i * 30}ms`,
              }} />
              {d.expense > 0 && (
                <div style={{
                  width: '8px', borderRadius: '3px 3px 0 0', background: C.red, opacity: hovered ? 1 : 0.7,
                  height: animated ? `${expH}px` : '0px', transition: `height 0.6s cubic-bezier(0.34,1.1,0.64,1) ${i * 30 + 50}ms`,
                }} />
              )}
            </div>
            <span style={{ fontSize: '9px', color: hovered ? C.text : C.sub, fontWeight: hovered ? 700 : 500, transition: 'color 0.15s' }}>
              {d.label.slice(0, 5)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string; bg: string }> =
  ({ icon, label, value, sub, color, bg }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
        background: 'white', borderRadius: '16px', padding: '18px 20px',
        border: `1.5px solid ${hovered ? color : C.border}`,
        boxShadow: hovered ? `0 8px 24px ${color}28` : '0 2px 10px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease', cursor: 'default',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <span style={{ fontSize: '10px', fontWeight: '700', color, background: bg, borderRadius: '20px', padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hari ini
          </span>
        </div>
        <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: C.text, letterSpacing: '-0.02em' }}>{value}</p>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {sub && <p style={{ margin: '3px 0 0', fontSize: '11px', color: C.sub }}>{sub}</p>}
      </div>
    );
  };

// ── Main Report Page ───────────────────────────────────────────────────────────
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

  useEffect(() => { loadReports(); }, [selectedDate]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [daily, monthly, revenue] = await Promise.all([
        reportApi.getDailyReport(selectedDate),
        reportApi.getMonthlyReport(),
        reportApi.getRevenueSummary(30),
      ]);
      setDailyReport(daily); setMonthlyReport(monthly); setRevenueSummary(revenue);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setIsLoading(false); }
  };

  if (!isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', color: C.sub }}>
      <IconLock />
      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Anda tidak memiliki akses ke halaman ini</p>
    </div>
  );

  // Build combined chart data (revenue + expense per day)
  const chartData: { date: string; revenue: number; expense?: number }[] = (revenueSummary?.data || []).map((d: any) => {
    const dayExpense = monthlyReport?.daily?.find((m: any) => m.date?.slice(0, 10) === d.date?.slice(0, 10));
    return { date: d.date, revenue: d.revenue, expense: dayExpense?.expense || 0 };
  });

  // Bar chart data from monthly
  const barData = (monthlyReport?.daily || []).slice(-14).map((d: any) => ({
    label: d.date ? d.date.slice(5, 10) : '',
    revenue: d.revenue || 0,
    expense: d.expense || 0,
  }));

  const totalRevenue = dailyReport?.total_revenue || 0;
  const totalExpenses = dailyReport?.total_expenses || 0;
  const totalOrders = dailyReport?.total_orders || 0;
  const netProfit = dailyReport?.net_profit || 0;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: C.text, letterSpacing: '-0.02em' }}>Laporan & Analitik</h1>
          <p style={{ margin: 0, fontSize: '13px', color: C.sub }}>Pantau performa bisnis Anda</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Date picker */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', color: dateFocused ? C.primary : C.sub, transition: 'color 0.2s', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}><IconCalendar /></span>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              onFocus={() => setDateFocused(true)} onBlur={() => setDateFocused(false)}
              style={{
                padding: '9px 12px 9px 34px', borderRadius: '10px', fontSize: '13px', color: C.text,
                border: `1.5px solid ${dateFocused ? C.primary : '#e8e4dc'}`, background: 'white',
                boxShadow: dateFocused ? `0 0 0 3px rgba(91,140,90,0.1)` : '0 1px 4px rgba(0,0,0,0.07)',
                outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
              }}
            />
          </div>

          {activeTab === 'expenses' && (
            <button onClick={() => setIsExpenseModalOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              background: `linear-gradient(135deg, ${C.primary}, #7aae78)`,
              color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 14px rgba(91,140,90,0.3)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <IconPlus /> Tambah Pengeluaran
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <StatCard icon={<IconRevenue />} label="Pendapatan" value={formatCurrency(totalRevenue)} sub={`${totalOrders} transaksi`} color={C.primary} bg={C.primaryLight} />
          <StatCard icon={<IconOrders />} label="Total Pesanan" value={`${totalOrders}`} sub="order" color={C.blue} bg={C.blueLight} />
          <StatCard icon={<IconExpense />} label="Pengeluaran" value={formatCurrency(totalExpenses)} sub="biaya operasional" color={C.red} bg={C.redLight} />
          <StatCard icon={<IconProfit />} label="Laba Bersih" value={formatCurrency(netProfit)} sub={netProfit >= 0 ? 'profit' : 'rugi'} color={netProfit >= 0 ? C.purple : C.red} bg={netProfit >= 0 ? C.purpleLight : C.redLight} />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '12px', padding: '4px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: `1px solid ${C.border}`, width: 'fit-content' }}>
        {[{ key: 'revenue', label: 'Pendapatan', icon: <IconChart /> }, { key: 'expenses', label: 'Pengeluaran', icon: <IconTable /> }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
            borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            background: activeTab === tab.key ? C.primary : 'transparent',
            color: activeTab === tab.key ? 'white' : C.sub,
            boxShadow: activeTab === tab.key ? '0 2px 8px rgba(91,140,90,0.3)' : 'none',
            transition: 'all 0.2s ease', fontFamily: "'DM Sans', sans-serif",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'revenue' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Main chart */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px 24px 16px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: C.text }}>Grafik Pendapatan 30 Hari Terakhir</h2>
                <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>Hover untuk lihat detail per hari</p>
              </div>
              {revenueSummary && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: C.primary, letterSpacing: '-0.02em' }}>{formatCurrency(revenueSummary.total || 0)}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: C.sub }}>Total 30 hari · avg {formatCurrency(revenueSummary.average || 0)}/hari</p>
                </div>
              )}
            </div>
            <AreaLineChart data={chartData} height={260} />
          </div>

          {/* Bottom grid: bar + table */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '18px' }}>

            {/* Bar chart: 14-day */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.text }}>14 Hari Terakhir</h3>
              <BarChart data={barData} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
                {[{ color: C.primary, label: 'Pendapatan' }, { color: C.red, label: 'Pengeluaran' }].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.sub }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} /> {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly table */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: C.text }}>Laporan Bulanan</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {['Tanggal', 'Orders', 'Pendapatan', 'Pengeluaran', 'Laba'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Tanggal' ? 'left' : 'right', color: C.sub, fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(monthlyReport?.daily || []).map((day: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#faf9f6')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '9px 10px', color: C.text, fontWeight: 600 }}>{day.date ? day.date.slice(0, 10) : '—'}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', color: C.text }}>{day.order_count || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', color: C.primary, fontWeight: 700 }}>{formatCurrency(day.revenue || 0)}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', color: C.red }}>{formatCurrency(day.expense || 0)}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: (day.net_profit || 0) >= 0 ? C.primary : C.red }}>
                          {(day.net_profit || 0) >= 0 ? '+' : ''}{formatCurrency(day.net_profit || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${C.border}`, background: '#faf9f6' }}>
                      <td style={{ padding: '10px', fontWeight: '800', color: C.text, fontSize: '12px' }}>Total</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: C.text }}>{monthlyReport?.total_orders || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: C.primary }}>{formatCurrency(monthlyReport?.total_revenue || 0)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: C.red }}>{formatCurrency(monthlyReport?.total_expense || 0)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: (monthlyReport?.total_profit || 0) >= 0 ? C.primary : C.red }}>
                        {formatCurrency(monthlyReport?.total_profit || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
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

      <style>{`input:focus { outline: none; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-thumb { background: #d8d4cc; border-radius: 10px; }`}</style>
    </div>
  );
};