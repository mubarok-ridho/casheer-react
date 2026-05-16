import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/order';
import { Order, ReceiptTemplate } from '../types';
import { formatCurrency } from '../utils/format';
import { useReceipt } from '../hooks/useReceipt';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import toast from 'react-hot-toast';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PrintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .22s ease', flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ReceiptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const XCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const TagIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  blue: '#217093', blueLight: '#e8f4fb',
  red: '#E8604A', redLight: '#fdecea',
  accent: '#E8A23A', accentLight: '#fff8e8',
  bg: '#f4f0e8',
};

const fmt = (n: number) => formatCurrency(n);
const payLabel: Record<string, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' };
const payColor: Record<string, string> = { cash: C.primary, qris: C.blue, transfer: C.accent };
const payBg:    Record<string, string> = { cash: C.primaryLight, qris: C.blueLight, transfer: C.accentLight };

// ── Helpers ───────────────────────────────────────────────────────────────────
function groupByDay(orders: Order[]): Record<string, Order[]> {
  return orders.reduce((acc, o) => {
    const day = new Date(o.created_at).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(o);
    return acc;
  }, {} as Record<string, Order[]>);
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('id-ID', opts)} – ${end.toLocaleDateString('id-ID', opts)}`;
}

function groupByWeek(orders: Order[]): Record<string, Order[]> {
  return orders.reduce((acc, o) => {
    const week = getWeekLabel(o.created_at);
    if (!acc[week]) acc[week] = [];
    acc[week].push(o);
    return acc;
  }, {} as Record<string, Order[]>);
}

// ── Loading overlay ───────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <div className="hi-loading-overlay">
    <div className="hi-loading-card">
      <Lottie animationData={lottieTree} loop autoplay style={{ width: 160, height: 160 }} />
      <p className="hi-loading-text">Memuat riwayat...</p>
      <div className="hi-dots"><span/><span/><span/></div>
    </div>
  </div>
);

// ── Mini stat badge ───────────────────────────────────────────────────────────
const StatPill: React.FC<{ label: string; value: string; color: string; bg: string }> = ({ label, value, color, bg }) => (
  <div style={{ background: bg, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(0,0,0,0.04)' }}>
    <div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 1 }}>{label}</p>
    </div>
  </div>
);

// ── Order Row ─────────────────────────────────────────────────────────────────
const OrderRow: React.FC<{
  order: Order;
  onPrint: (order: Order) => void;
  template: ReceiptTemplate | null;
}> = ({ order, onPrint }) => {
  const [expanded, setExpanded] = useState(false);
  const [printHov, setPrintHov] = useState(false);
  const payM = order.payment_method;

  return (
    <div className={`hi-order-row ${expanded ? 'hi-order-row--open' : ''}`}>
      {/* ── Header ── */}
      <div className="hi-order-header" onClick={() => setExpanded(e => !e)}>
        <div className="hi-order-chevron">
          <ChevronIcon open={expanded} />
        </div>

        {/* Time */}
        <div className="hi-order-time">
          <ClockIcon />
          {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Order number + customer */}
        <div className="hi-order-identity">
          <span className="hi-order-num">#{order.order_number.slice(-8)}</span>
          {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
            <span className="hi-order-customer">
              <UserIcon />
              {order.customer_name}
            </span>
          )}
        </div>

        {/* Items count */}
        <div className="hi-order-items-count">
          <TagIcon />
          <span>{(order.items ?? []).length} item</span>
        </div>

        {/* Payment badge */}
        <span className="hi-pay-badge" style={{
          background: payBg[payM] ?? '#f5f2ed',
          color: payColor[payM] ?? C.sub,
        }}>
          {payLabel[payM] ?? payM}
        </span>

        {/* Total */}
        <div className="hi-order-total">{fmt(order.total_amount)}</div>

        {/* Print */}
        <button
          className="hi-print-btn"
          onClick={e => { e.stopPropagation(); onPrint(order); }}
          onMouseEnter={() => setPrintHov(true)}
          onMouseLeave={() => setPrintHov(false)}
          title="Cetak ulang nota"
          style={{ background: printHov ? '#cce8f4' : C.blueLight }}
        >
          <PrintIcon />
          <span className="hi-print-label">Cetak</span>
        </button>
      </div>

      {/* ── Detail ── */}
      {expanded && (
        <div className="hi-order-detail">
          <p className="hi-detail-label">Detail Pesanan</p>
          <div className="hi-detail-items">
            {(order.items ?? []).map((item: any, i: number) => (
              <div key={i} className="hi-detail-item">
                <div className="hi-detail-item-left">
                  <div className="hi-item-dot" />
                  <div>
                    <span className="hi-item-name">{item.menu_name ?? item.menu?.name}</span>
                    {(item.variation_name ?? item.variation?.option) && (
                      <span className="hi-item-var">· {item.variation_name ?? item.variation?.option}</span>
                    )}
                    {item.notes && <div className="hi-item-notes">📝 {item.notes}</div>}
                  </div>
                </div>
                <div className="hi-detail-item-right">
                  <span className="hi-item-qty-price">{item.quantity} × {fmt(item.price)}</span>
                  <span className="hi-item-subtotal">{fmt(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hi-detail-total">
            <span>Total Pembayaran</span>
            <span style={{ color: C.primary }}>{fmt(order.total_amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Group Section ─────────────────────────────────────────────────────────────
const GroupSection: React.FC<{
  label: string;
  orders: Order[];
  onPrint: (order: Order) => void;
  template: ReceiptTemplate | null;
}> = ({ label, orders, onPrint, template }) => {
  const [open, setOpen] = useState(true);
  const total = orders.reduce((s, o) => s + o.total_amount, 0);
  const byMethod = orders.reduce((acc, o) => {
    acc[o.payment_method] = (acc[o.payment_method] || 0) + o.total_amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="hi-group">
      {/* Group header */}
      <div className="hi-group-header" onClick={() => setOpen(o => !o)}>
        <div className="hi-group-left">
          <div className="hi-group-chevron" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <ChevronIcon open={false} />
          </div>
          <div>
            <span className="hi-group-label">{label}</span>
            <span className="hi-group-count">{orders.length} transaksi</span>
          </div>
        </div>
        <div className="hi-group-right">
          {/* Payment method breakdown pills */}
          <div className="hi-group-methods">
            {Object.entries(byMethod).map(([m, v]) => (
              <span key={m} className="hi-group-method-pill" style={{ background: payBg[m] ?? '#f5f2ed', color: payColor[m] ?? C.sub }}>
                {payLabel[m] ?? m}: {fmt(v)}
              </span>
            ))}
          </div>
          <span className="hi-group-total">{fmt(total)}</span>
        </div>
      </div>

      {/* Rows */}
      {open && (
        <div className="hi-group-rows">
          {orders.map(o => (
            <OrderRow key={o.id} order={o} onPrint={onPrint} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const History: React.FC = () => {
  const { tenant, isAdmin } = useAuth();
  const { defaultTemplate, printReceipt } = useReceipt();

  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [viewMode,    setViewMode]    = useState<'day' | 'week'>('day');
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [showCleanup, setShowCleanup] = useState(false);
  const [cleaning,    setCleaning]    = useState(false);
  const LIMIT = 50;

  // ── Fetch — UNTOUCHED ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders(page, LIMIT, startDate || undefined, endDate || undefined);
      const list: Order[] = Array.isArray(res) ? res : (res.data ?? []);
      setOrders(list);
      setTotal(res.total ?? list.length);
    } catch {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      (o.customer_name ?? '').toLowerCase().includes(q) ||
      (o.items ?? []).some((i: any) => (i.menu_name ?? i.menu?.name ?? '').toLowerCase().includes(q))
    );
  });

  const grouped = viewMode === 'day' ? groupByDay(filtered) : groupByWeek(filtered);
  const totalRevenue = filtered.reduce((s, o) => s + o.total_amount, 0);
  const totalPages   = Math.ceil(total / LIMIT);

  const handlePrint = (order: Order) => {
    printReceipt(order, tenant as any, defaultTemplate, undefined);
  };

  const handleCleanup = async () => {
    if (!window.confirm(`Hapus semua transaksi lebih dari ${cleanupDays} hari? Tindakan ini tidak bisa dibatalkan.`)) return;
    setCleaning(true);
    try {
      const res = await orderApi.deleteOldOrders(cleanupDays);
      toast.success(`${res.deleted ?? 0} transaksi dihapus`);
      setShowCleanup(false);
      load();
    } catch {
      toast.error('Gagal cleanup');
    } finally {
      setCleaning(false);
    }
  };

  const hasFilter = !!(search || startDate || endDate);

  return (
    <div className="hi-root">

      {/* ── Lottie loading overlay ── */}
      {loading && <LoadingOverlay />}

      {/* ── HERO HEADER ── */}
      <div className="hi-hero">
        <div className="hi-hero-bg" />
        <div className="hi-hero-content">
          <div className="hi-hero-left">
            <div className="hi-hero-eyebrow">
              <ReceiptIcon />
              <span>Riwayat Transaksi</span>
            </div>
            <h1 className="hi-title">Riwayat Pesanan</h1>
            <p className="hi-subtitle">Pantau semua transaksi yang telah selesai</p>
          </div>

          {/* Stats row */}
          <div className="hi-hero-stats">
            <StatPill label="Total Transaksi" value={`${total}`} color={C.primary} bg={C.primaryLight} />
            <StatPill label="Total Pendapatan" value={fmt(totalRevenue)} color={C.blue} bg={C.blueLight} />
            <StatPill label="Rata-rata/Transaksi" value={filtered.length > 0 ? fmt(Math.round(totalRevenue / filtered.length)) : 'Rp 0'} color={C.accent} bg={C.accentLight} />
          </div>
        </div>

        {/* Cleanup button */}
        {isAdmin && (
          <button
            onClick={() => setShowCleanup(s => !s)}
            className={`hi-cleanup-btn ${showCleanup ? 'hi-cleanup-btn--active' : ''}`}
          >
            <TrashIcon />
            <span>Auto Cleanup</span>
          </button>
        )}
      </div>

      {/* ── CLEANUP PANEL ── */}
      {showCleanup && isAdmin && (
        <div className="hi-cleanup-panel">
          <div className="hi-cleanup-icon">⚠️</div>
          <div className="hi-cleanup-text">
            <p className="hi-cleanup-title">Hapus transaksi lama</p>
            <p className="hi-cleanup-sub">Hapus semua transaksi lebih tua dari periode yang dipilih. Tidak bisa dikembalikan.</p>
          </div>
          <div className="hi-cleanup-controls">
            <select
              value={cleanupDays}
              onChange={e => setCleanupDays(Number(e.target.value))}
              className="hi-cleanup-select"
            >
              <option value={7}>Lebih dari 7 hari</option>
              <option value={14}>Lebih dari 14 hari</option>
              <option value={30}>Lebih dari 30 hari</option>
              <option value={60}>Lebih dari 60 hari</option>
              <option value={90}>Lebih dari 90 hari</option>
            </select>
            <button onClick={handleCleanup} disabled={cleaning} className="hi-cleanup-confirm">
              {cleaning ? (
                <>
                  <Lottie animationData={lottieTree} loop autoplay style={{ width: 18, height: 18 }} />
                  Menghapus...
                </>
              ) : (
                <><TrashIcon /> Hapus Sekarang</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div className="hi-filter-card">
        <div className="hi-filter-row">
          {/* Search */}
          <div className="hi-search-wrap">
            <span className="hi-search-icon" style={{ color: searchFocus ? C.primary : '#b0a898' }}>
              <SearchIcon />
            </span>
            <input
              className="hi-search"
              placeholder="Cari no. order, pelanggan, atau menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              style={{ borderColor: searchFocus ? C.primary : '#e8e4dc', boxShadow: searchFocus ? '0 0 0 3px rgba(91,140,90,0.1)' : 'none' }}
            />
            {search && (
              <button className="hi-search-clear" onClick={() => setSearch('')}>
                <XCircleIcon />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="hi-view-toggle">
            {(['day', 'week'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`hi-view-btn ${viewMode === mode ? 'hi-view-btn--active' : ''}`}
                title={mode === 'day' ? 'Kelompokkan per hari' : 'Kelompokkan per minggu'}
              >
                {mode === 'day' ? <ListIcon /> : <GridIcon />}
                <span className="hi-view-label">{mode === 'day' ? 'Per Hari' : 'Per Minggu'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="hi-date-row">
          <div className="hi-date-label">
            <CalendarIcon />
            <span>Rentang Tanggal</span>
          </div>
          <div className="hi-date-inputs">
            <input
              type="date" value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
              className="hi-date-input"
            />
            <span className="hi-date-sep">—</span>
            <input
              type="date" value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
              className="hi-date-input"
            />
            {(startDate || endDate) && (
              <button
                className="hi-date-clear"
                onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
              >
                <XCircleIcon />
              </button>
            )}
          </div>
        </div>

        {/* Active filter indicator */}
        {hasFilter && !loading && (
          <div className="hi-filter-result">
            <TrendUpIcon />
            <span>
              Menampilkan <strong>{filtered.length}</strong> dari {orders.length} transaksi
              {search && ` · "${search}"`}
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="hi-empty">
              <Lottie animationData={lottieTree} loop autoplay style={{ width: 140, height: 140, opacity: 0.65 }} />
              <p className="hi-empty-title">
                {hasFilter ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
              </p>
              <p className="hi-empty-sub">
                {hasFilter ? 'Coba ubah filter atau kata kunci pencarian' : 'Transaksi akan muncul setelah ada pesanan selesai'}
              </p>
              {hasFilter && (
                <button className="hi-empty-reset" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}>
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="hi-groups">
              {Object.entries(grouped).map(([label, dayOrders]) => (
                <GroupSection
                  key={label}
                  label={label}
                  orders={dayOrders}
                  onPrint={handlePrint}
                  template={defaultTemplate}
                />
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {total > LIMIT && (
            <div className="hi-pagination">
              <button
                className="hi-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon />
                <span>Sebelumnya</span>
              </button>

              <div className="hi-page-info">
                <span className="hi-page-current">{page}</span>
                <span className="hi-page-sep">/</span>
                <span>{totalPages}</span>
              </div>

              <button
                className="hi-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                <span>Selanjutnya</span>
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }

        @keyframes hi-fade-up  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hi-blink    { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes hi-card-in  { from{opacity:0;transform:scale(.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes hi-slide-down { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* ── Root ── */
        .hi-root {
          display: flex; flex-direction: column; gap: 18px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          animation: hi-fade-up 0.35s ease;
          position: relative;
        }

        /* ── Lottie loading ── */
        .hi-loading-overlay {
          position: fixed; inset: 0; z-index: 9998;
          display: flex; align-items: center; justify-content: center;
          background: rgba(244,240,232,0.65);
          backdrop-filter: blur(8px);
        }
        .hi-loading-card {
          background: white; border-radius: 28px; padding: 36px 52px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(91,140,90,0.1);
          border: 1px solid rgba(91,140,90,0.1);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          animation: hi-card-in 0.28s cubic-bezier(0.34,1.1,0.64,1);
        }
        .hi-loading-text {
          font-size: 15px; font-weight: 700; color: ${C.text};
          margin-top: 4px;
        }
        .hi-dots { display: flex; gap: 5px; }
        .hi-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: hi-blink 1.4s ease-in-out infinite;
        }
        .hi-dots span:nth-child(2){animation-delay:.2s}
        .hi-dots span:nth-child(3){animation-delay:.4s}

        /* ── Hero ── */
        .hi-hero {
          background: white; border-radius: 22px; padding: 22px 24px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
          position: relative; overflow: hidden;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .hi-hero-bg {
          position: absolute; top: 0; right: 0; bottom: 0; width: 40%;
          background: linear-gradient(135deg, transparent, rgba(91,140,90,0.04) 50%, rgba(91,140,90,0.07));
          pointer-events: none;
        }
        .hi-hero-bg::after {
          content: ''; position: absolute; top: -36px; right: -36px;
          width: 160px; height: 160px; border-radius: 50%;
          border: 36px solid rgba(91,140,90,0.05);
        }
        .hi-hero-content { flex: 1; min-width: 0; position: relative; }
        .hi-hero-left { margin-bottom: 16px; }
        .hi-hero-eyebrow {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: ${C.primary};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px;
        }
        .hi-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 800; color: #1a1612;
          letter-spacing: -0.04em; line-height: 1; margin-bottom: 5px;
        }
        .hi-subtitle { font-size: 13px; color: ${C.sub}; }
        .hi-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }

        /* Cleanup button */
        .hi-cleanup-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 14px; border-radius: 11px; cursor: pointer;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: white; color: ${C.sub};
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.18s; flex-shrink: 0; align-self: flex-start;
        }
        .hi-cleanup-btn:hover { border-color: ${C.red}; color: ${C.red}; background: ${C.redLight}; }
        .hi-cleanup-btn--active { border-color: ${C.red}; color: ${C.red}; background: ${C.redLight}; }

        /* ── Cleanup panel ── */
        .hi-cleanup-panel {
          background: ${C.redLight}; border-radius: 18px; padding: 18px 22px;
          border: 1.5px solid rgba(232,96,74,.2);
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          animation: hi-slide-down 0.2s ease;
        }
        .hi-cleanup-icon { font-size: 26px; flex-shrink: 0; }
        .hi-cleanup-text { flex: 1; min-width: 180px; }
        .hi-cleanup-title { font-size: 13px; font-weight: 800; color: ${C.red}; margin-bottom: 3px; }
        .hi-cleanup-sub { font-size: 12px; color: #a04030; }
        .hi-cleanup-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .hi-cleanup-select {
          padding: 8px 12px; border-radius: 9px;
          border: 1.5px solid rgba(232,96,74,.35);
          font-size: 13px; font-weight: 600; background: white; color: ${C.text};
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hi-cleanup-confirm {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 9px; border: none;
          background: ${C.red}; color: white;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .hi-cleanup-confirm:hover { background: #c94030; }
        .hi-cleanup-confirm:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── Filter card ── */
        .hi-filter-card {
          background: white; border-radius: 20px; padding: 16px 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 12px;
        }
        .hi-filter-row {
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
        }
        .hi-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .hi-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; pointer-events: none; transition: color 0.2s;
        }
        .hi-search {
          width: 100%; padding: 10px 36px 10px 38px;
          border: 1.5px solid #e8e4dc; border-radius: 11px;
          font-size: 13px; color: ${C.text}; background: #faf9f6;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hi-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.sub}; display: flex; padding: 3px; border-radius: 50%;
          transition: color 0.15s;
        }
        .hi-search-clear:hover { color: ${C.red}; }

        /* View toggle */
        .hi-view-toggle {
          display: flex; background: #f5f2ed; border-radius: 11px; padding: 3px; gap: 2px;
          flex-shrink: 0;
        }
        .hi-view-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 14px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent; color: ${C.sub};
          transition: all 0.15s;
        }
        .hi-view-btn:hover { background: rgba(0,0,0,0.05); color: ${C.text}; }
        .hi-view-btn--active {
          background: white; color: ${C.primary};
          box-shadow: 0 1px 6px rgba(0,0,0,0.1);
        }

        /* Date row */
        .hi-date-row {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .hi-date-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; color: ${C.sub}; flex-shrink: 0;
        }
        .hi-date-inputs {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .hi-date-input {
          padding: 8px 11px; border-radius: 9px;
          border: 1.5px solid #e8e4dc; font-size: 12.5px; color: ${C.text};
          background: #faf9f6; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .hi-date-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(91,140,90,0.1); }
        .hi-date-sep { color: ${C.sub}; font-size: 14px; font-weight: 600; }
        .hi-date-clear {
          background: none; border: none; cursor: pointer;
          color: ${C.sub}; display: flex; align-items: center; padding: 2px;
          transition: color 0.15s; border-radius: 50%;
        }
        .hi-date-clear:hover { color: ${C.red}; }

        .hi-filter-result {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: ${C.sub}; font-weight: 500;
        }
        .hi-filter-result svg { color: ${C.primary}; }
        .hi-filter-result strong { color: ${C.text}; }

        /* ── Groups ── */
        .hi-groups { display: flex; flex-direction: column; gap: 14px; }

        /* ── Group Section ── */
        .hi-group {
          background: white; border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 12px rgba(0,0,0,0.045);
          overflow: hidden;
        }
        .hi-group-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; cursor: pointer;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.15s;
        }
        .hi-group-header:hover { background: #faf9f6; }
        .hi-group-left { display: flex; align-items: center; gap: 10px; }
        .hi-group-chevron { display: flex; color: ${C.sub}; flex-shrink: 0; }
        .hi-group-label { font-size: 13.5px; font-weight: 700; color: ${C.text}; }
        .hi-group-count {
          font-size: 11px; color: ${C.sub}; background: #f5f2ed;
          padding: 2px 8px; border-radius: 20px; font-weight: 600; margin-left: 6px;
        }
        .hi-group-right {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          justify-content: flex-end;
        }
        .hi-group-methods { display: flex; gap: 5px; flex-wrap: wrap; }
        .hi-group-method-pill {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
        }
        .hi-group-total {
          font-size: 15px; font-weight: 800; color: ${C.primary};
          font-family: 'Sora', sans-serif; letter-spacing: -0.02em;
        }
        .hi-group-rows {
          display: flex; flex-direction: column;
          padding: 8px 12px 12px;
          gap: 6px;
        }

        /* ── Order Row ── */
        .hi-order-row {
          border-radius: 13px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          transition: box-shadow 0.15s;
          background: white;
        }
        .hi-order-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .hi-order-row--open { border-color: rgba(91,140,90,0.2); }
        .hi-order-header {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; cursor: pointer; user-select: none;
          transition: background 0.12s;
        }
        .hi-order-header:hover { background: #faf9f6; }
        .hi-order-chevron { color: ${C.sub}; flex-shrink: 0; display: flex; }
        .hi-order-time {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: ${C.sub}; min-width: 46px; flex-shrink: 0;
        }
        .hi-order-identity { flex: 1; min-width: 0; }
        .hi-order-num {
          font-size: 13px; font-weight: 700; color: ${C.text};
          font-family: 'Sora', sans-serif; letter-spacing: -0.01em;
        }
        .hi-order-customer {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: ${C.sub}; margin-left: 7px; font-weight: 500;
        }
        .hi-order-items-count {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: ${C.sub}; flex-shrink: 0;
        }
        .hi-pay-badge {
          font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
          flex-shrink: 0; white-space: nowrap;
        }
        .hi-order-total {
          font-size: 14px; font-weight: 800; color: ${C.primary};
          min-width: 84px; text-align: right; flex-shrink: 0;
          font-family: 'Sora', sans-serif; letter-spacing: -0.02em;
        }
        .hi-print-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer;
          color: ${C.blue}; font-size: 11px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s; flex-shrink: 0;
        }
        .hi-print-label { }

        /* ── Order Detail ── */
        .hi-order-detail {
          padding: 12px 16px 14px;
          background: #faf9f6;
          border-top: 1px solid rgba(0,0,0,0.06);
          animation: hi-slide-down 0.18s ease;
        }
        .hi-detail-label {
          font-size: 10px; font-weight: 800; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .hi-detail-items { display: flex; flex-direction: column; gap: 7px; }
        .hi-detail-item {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px;
        }
        .hi-detail-item-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-width: 0; }
        .hi-item-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; flex-shrink: 0; margin-top: 5px;
        }
        .hi-item-name { font-size: 13px; font-weight: 600; color: ${C.text}; }
        .hi-item-var { font-size: 12px; color: ${C.sub}; margin-left: 4px; }
        .hi-item-notes { font-size: 11px; color: ${C.sub}; font-style: italic; margin-top: 2px; }
        .hi-detail-item-right {
          display: flex; flex-direction: column; align-items: flex-end;
          flex-shrink: 0; gap: 1px;
        }
        .hi-item-qty-price { font-size: 11.5px; color: ${C.sub}; }
        .hi-item-subtotal { font-size: 13px; font-weight: 700; color: ${C.text}; }
        .hi-detail-total {
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1.5px dashed #e8e4dc; margin-top: 12px; padding-top: 12px;
          font-size: 14px; font-weight: 800; color: ${C.text};
        }

        /* ── Empty ── */
        .hi-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 24px; gap: 8px; text-align: center;
          background: white; border-radius: 20px;
          border: 1px dashed #d8d4cc;
        }
        .hi-empty-title { font-size: 15px; font-weight: 700; color: ${C.text}; }
        .hi-empty-sub { font-size: 13px; color: ${C.sub}; }
        .hi-empty-reset {
          margin-top: 6px; padding: 9px 20px; border-radius: 10px;
          border: 1.5px solid rgba(91,140,90,0.3);
          background: ${C.primaryLight}; color: ${C.primary};
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
        }
        .hi-empty-reset:hover { background: #d8edd8; }

        /* ── Pagination ── */
        .hi-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin-top: 4px;
        }
        .hi-page-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 11px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: white; color: ${C.text};
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        }
        .hi-page-btn:hover:not(:disabled) { background: ${C.primaryLight}; color: ${C.primary}; border-color: rgba(91,140,90,0.3); }
        .hi-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .hi-page-info {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: ${C.sub}; font-weight: 600;
        }
        .hi-page-current {
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 800; color: ${C.primary};
        }
        .hi-page-sep { color: #d0c8be; }

        /* ═══════════════ RESPONSIVE ═══════════════ */
        @media (max-width: 1024px) {
          .hi-title { font-size: 22px; }
          .hi-hero { flex-direction: column; gap: 16px; }
          .hi-cleanup-btn { align-self: flex-start; }
        }
        @media (max-width: 767px) {
          .hi-root { gap: 12px; }
          .hi-hero { padding: 16px 18px; border-radius: 18px; }
          .hi-title { font-size: 20px; }
          .hi-hero-stats { gap: 8px; }
          .hi-filter-card { padding: 14px 16px; border-radius: 16px; }
          .hi-view-label { display: none; }
          .hi-view-btn { padding: 8px 10px; }
          .hi-order-header { padding: 10px 12px; gap: 7px; }
          .hi-order-items-count { display: none; }
          .hi-print-label { display: none; }
          .hi-print-btn { padding: 6px 8px; }
          .hi-group-methods { display: none; }
          .hi-group { border-radius: 16px; }
          .hi-group-header { padding: 12px 14px; }
          .hi-group-rows { padding: 6px 8px 10px; gap: 5px; }
          .hi-cleanup-panel { flex-direction: column; align-items: flex-start; gap: 12px; }
          .hi-cleanup-controls { width: 100%; }
          .hi-cleanup-select { flex: 1; }
          .hi-date-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .hi-date-inputs { flex-wrap: wrap; }
          .hi-date-input { font-size: 12px; padding: 7px 10px; }
        }
        @media (max-width: 479px) {
          .hi-hero { padding: 14px 16px; border-radius: 16px; }
          .hi-title { font-size: 18px; }
          .hi-hero-stats { flex-direction: column; gap: 7px; }
          .hi-filter-card { padding: 12px 14px; }
          .hi-filter-row { gap: 8px; }
          .hi-search-wrap { min-width: 100%; }
          .hi-order-time { display: none; }
          .hi-order-num { font-size: 12px; }
          .hi-order-total { font-size: 13px; min-width: 70px; }
          .hi-page-btn span { display: none; }
          .hi-page-btn { padding: 9px 14px; }
          .hi-order-detail { padding: 10px 12px 12px; }
          .hi-group-total { font-size: 13px; }
        }

        /* Tablet landscape */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .hi-hero { flex-direction: row; }
          .hi-hero-stats { flex-direction: row; }
          .hi-view-label { display: inline; }
        }
      `}</style>
    </div>
  );
};