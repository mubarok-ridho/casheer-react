import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/order';
import { Order, ReceiptTemplate } from '../types';
import { formatCurrency } from '../utils/format';
import { useReceipt } from '../hooks/useReceipt';
import toast from 'react-hot-toast';

// ── Icons ──────────────────────────────────────────────────────────────────────
const PrintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .2s' }}>
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

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  blue: '#217093', blueLight: '#e8f4fb',
  red: '#E8604A', redLight: '#fdecea',
};

const fmt = (n: number) => formatCurrency(n);

const payLabel: Record<string, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' };
const payColor: Record<string, string> = { cash: '#5B8C5A', qris: '#217093', transfer: '#E8A23A' };
const payBg:    Record<string, string> = { cash: '#ebf4eb', qris: '#e8f4fb', transfer: '#fff8e8' };

// ── Group orders per hari ──────────────────────────────────────────────────────
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

// ── Group per minggu ───────────────────────────────────────────────────────────
function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Senin
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${startOfWeek.toLocaleDateString('id-ID', opts)} – ${endOfWeek.toLocaleDateString('id-ID', opts)}`;
}

function groupByWeek(orders: Order[]): Record<string, Order[]> {
  return orders.reduce((acc, o) => {
    const week = getWeekLabel(o.created_at);
    if (!acc[week]) acc[week] = [];
    acc[week].push(o);
    return acc;
  }, {} as Record<string, Order[]>);
}

// ── Order Row ──────────────────────────────────────────────────────────────────
const OrderRow: React.FC<{
  order: Order;
  onPrint: (order: Order) => void;
  template: ReceiptTemplate | null;
}> = ({ order, onPrint }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'white', borderRadius: 12,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      transition: 'box-shadow .15s',
    }}>
      {/* Row header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <ChevronIcon open={expanded} />

        {/* Waktu */}
        <div style={{ fontSize: 11, color: C.sub, minWidth: 40 }}>
          {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Order number */}
        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>
          #{order.order_number.slice(-8)}
          {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
            <span style={{ fontWeight: 400, color: C.sub, marginLeft: 6 }}>· {order.customer_name}</span>
          )}
        </div>

        {/* Items count */}
        <div style={{ fontSize: 11, color: C.sub }}>
          {(order.items ?? []).length} item
        </div>

        {/* Payment method */}
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          background: payBg[order.payment_method] ?? '#f5f5f5',
          color: payColor[order.payment_method] ?? C.sub,
        }}>
          {payLabel[order.payment_method] ?? order.payment_method}
        </span>

        {/* Total */}
        <div style={{ fontSize: 14, fontWeight: 800, color: C.primary, minWidth: 80, textAlign: 'right' }}>
          {fmt(order.total_amount)}
        </div>

        {/* Print button */}
        <button
          onClick={e => { e.stopPropagation(); onPrint(order); }}
          title="Cetak ulang"
          style={{
            border: 'none', background: C.blueLight, color: C.blue,
            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#cce8f4')}
          onMouseLeave={e => (e.currentTarget.style.background = C.blueLight)}
        >
          <PrintIcon /> Cetak
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: '12px 16px 14px',
          background: '#faf9f6',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            Detail Item
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(order.items ?? []).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 600, color: C.text }}>
                    {item.menu_name ?? item.menu?.name}
                  </span>
                  {(item.variation_name ?? item.variation?.option) && (
                    <span style={{ color: C.sub, marginLeft: 4 }}>
                      ({item.variation_name ?? item.variation?.option})
                    </span>
                  )}
                  {item.notes && (
                    <div style={{ fontSize: 11, color: C.sub, fontStyle: 'italic' }}>* {item.notes}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ color: C.sub }}>{item.quantity} × {fmt(item.price)}</span>
                  <span style={{ fontWeight: 700, color: C.text, marginLeft: 8 }}>{fmt(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px dashed ${C.border}`, marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
            <span>Total</span>
            <span style={{ color: C.primary }}>{fmt(order.total_amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Day / Week Group ───────────────────────────────────────────────────────────
const GroupSection: React.FC<{
  label: string;
  orders: Order[];
  onPrint: (order: Order) => void;
  template: ReceiptTemplate | null;
}> = ({ label, orders, onPrint, template }) => {
  const [open, setOpen] = useState(true);
  const total = orders.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Group header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
          background: 'white', border: `1px solid ${C.border}`,
          marginBottom: open ? 8 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronIcon open={open} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
          <span style={{ fontSize: 11, color: C.sub, background: '#f0ede8', padding: '2px 8px', borderRadius: 20 }}>
            {orders.length} transaksi
          </span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.primary }}>{fmt(total)}</span>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 8 }}>
          {orders.map(o => (
            <OrderRow key={o.id} order={o} onPrint={onPrint} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export const History: React.FC = () => {
  const { tenant, isAdmin } = useAuth();
  const { defaultTemplate, printReceipt } = useReceipt();

  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [viewMode,    setViewMode]    = useState<'day' | 'week'>('day');
  const [search,      setSearch]      = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [showCleanup, setShowCleanup] = useState(false);
  const [cleaning,    setCleaning]    = useState(false);
  const LIMIT = 50;

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

  // Filter by search
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

  const totalRevenue = filtered.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>Riwayat Transaksi</h1>
          <p style={{ margin: 0, fontSize: 13, color: C.sub }}>
            {total} transaksi · {fmt(totalRevenue)} total
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCleanup(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${showCleanup ? C.red : C.border}`,
              background: showCleanup ? C.redLight : 'white',
              color: showCleanup ? C.red : C.sub,
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              transition: 'all .2s',
            }}
          >
            <TrashIcon /> Auto Cleanup
          </button>
        )}
      </div>

      {/* Cleanup panel */}
      {showCleanup && isAdmin && (
        <div style={{
          background: C.redLight, borderRadius: 14, padding: '16px 20px',
          border: `1.5px solid rgba(232,96,74,.25)`,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 4 }}>
              ⚠️ Hapus transaksi lama
            </div>
            <div style={{ fontSize: 12, color: '#a04030' }}>
              Hapus semua transaksi lebih tua dari periode yang dipilih. Tidak bisa dikembalikan.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={cleanupDays}
              onChange={e => setCleanupDays(Number(e.target.value))}
              style={{
                padding: '8px 12px', borderRadius: 8, border: `1.5px solid rgba(232,96,74,.4)`,
                fontSize: 13, fontWeight: 600, background: 'white', color: C.text,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <option value={7}>Lebih dari 7 hari</option>
              <option value={14}>Lebih dari 14 hari</option>
              <option value={30}>Lebih dari 30 hari</option>
              <option value={60}>Lebih dari 60 hari</option>
              <option value={90}>Lebih dari 90 hari</option>
            </select>
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: C.red, color: 'white',
                fontSize: 13, fontWeight: 700, cursor: cleaning ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: cleaning ? .7 : 1,
              }}
            >
              {cleaning ? 'Menghapus...' : 'Hapus Sekarang'}
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,.05)', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0a898', display: 'flex' }}>
              <SearchIcon />
            </span>
            <input
              placeholder="Cari no. order / pelanggan / menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 34px', borderRadius: 9,
                border: '1.5px solid #e8e4dc', fontSize: 13, color: C.text,
                background: '#faf9f6', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon />
            <input
              type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e4dc', fontSize: 12, color: C.text, fontFamily: 'inherit', outline: 'none' }}
            />
            <span style={{ color: C.sub, fontSize: 12 }}>–</span>
            <input
              type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e4dc', fontSize: 12, color: C.text, fontFamily: 'inherit', outline: 'none' }}
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                style={{ border: 'none', background: 'none', color: C.sub, cursor: 'pointer', fontSize: 13, padding: '0 4px' }}>✕</button>
            )}
          </div>

          {/* View mode toggle */}
          <div style={{ display: 'flex', background: '#f0ede8', borderRadius: 8, padding: 3 }}>
            {(['day', 'week'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  background: viewMode === mode ? 'white' : 'transparent',
                  color: viewMode === mode ? C.text : C.sub,
                  boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {mode === 'day' ? 'Per Hari' : 'Per Minggu'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid #e8e4de`, borderTopColor: C.primary, animation: 'spin .8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 16, color: C.sub }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
            {search || startDate || endDate ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(grouped).map(([label, dayOrders]) => (
            <GroupSection
              key={label}
              label={label}
              orders={dayOrders}
              onPrint={handlePrint}
              template={defaultTemplate}
            />
          ))}

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: page === 1 ? C.sub : C.text, fontFamily: 'inherit' }}>
                ← Sebelumnya
              </button>
              <span style={{ padding: '8px 16px', fontSize: 13, color: C.sub }}>
                Hal. {page} dari {Math.ceil(total / LIMIT)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', cursor: page >= Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: page >= Math.ceil(total / LIMIT) ? C.sub : C.text, fontFamily: 'inherit' }}>
                Selanjutnya →
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
