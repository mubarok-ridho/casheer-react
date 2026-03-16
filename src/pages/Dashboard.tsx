import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { reportApi } from "../api/report";
import { menuApi } from "../api/menu";
import { formatCurrency } from "../utils/format";
import { DailyReport, Menu } from "../types";
import toast from "react-hot-toast";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconRevenue = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconOrders = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconExpense = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconProfit = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);
const IconStore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconPayment = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconCategory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

// ── Mini sparkline bar chart ───────────────────────────────────────────────────
const SparkBars: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '28px' }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: '2px',
          height: `${Math.max(4, (v / max) * 28)}px`,
          background: color, opacity: i === values.length - 1 ? 1 : 0.35 + (i / values.length) * 0.5,
          transition: 'height 0.4s ease',
        }} />
      ))}
    </div>
  );
};

// ── Donut chart ───────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: '#aaa', padding: '20px', fontSize: '13px' }}>Belum ada data</div>;
  let cumulative = 0;
  const size = 100; const cx = 50; const cy = 50; const r = 36; const stroke = 14;
  const circumference = 2 * Math.PI * r;
  const segments = data.map(d => {
    const pct = d.value / total;
    const seg = { ...d, pct, offset: cumulative, dasharray: pct * circumference, dashoffset: -(cumulative * circumference) };
    cumulative += pct;
    return seg;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="90" height="90" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede8" strokeWidth={stroke} />
        {segments.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${seg.dasharray} ${circumference - seg.dasharray}`}
            strokeDashoffset={seg.dashoffset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#6b6560', fontWeight: 500 }}>{seg.label}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3a322c' }}>{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { tenant } = useAuth();
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [bestSellers, setBestSellers] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [report, best] = await Promise.all([
        reportApi.getDailyReport(),
        menuApi.getBestSeller(5, 30),
      ]);
      setDailyReport(report);
      setBestSellers(Array.isArray(best) ? best : []);
    } catch (err) {
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentSummary = (dailyReport as any)?.payment_summary || {};
  const categorySummary = (dailyReport as any)?.category_summary || {};
  const totalRevenue = dailyReport?.total_revenue || 0;

  const paymentEntries = Object.entries(paymentSummary) as [string, number][];
  const categoryEntries = Object.entries(categorySummary) as [string, number][];

  const paymentLabels: Record<string, string> = { cash: "Tunai", qris: "QRIS", transfer: "Transfer" };
  const paymentColors = ["#5B8C5A", "#4AA8D8", "#E8A23A"];
  const categoryColors = ["#E8604A", "#5B8C5A", "#4AA8D8", "#9B6DD4", "#E8A23A"];

  const paymentDonut = paymentEntries.map(([k, v], i) => ({ label: paymentLabels[k] || k, value: v, color: paymentColors[i % paymentColors.length] }));
  const categoryDonut = categoryEntries.map(([k, v], i) => ({ label: k, value: v as number, color: categoryColors[i % categoryColors.length] }));

  const stats = [
    {
      label: "Pendapatan", value: formatCurrency(dailyReport?.total_revenue || 0),
      sub: `${dailyReport?.total_orders || 0} transaksi`,
      icon: <IconRevenue />, color: "#5B8C5A", bg: "#EBF4EB",
      spark: [40, 55, 30, 70, 60, 80, 100],
    },
    {
      label: "Total Pesanan", value: `${dailyReport?.total_orders || 0}`,
      sub: "order hari ini",
      icon: <IconOrders />, color: "#4AA8D8", bg: "#E8F5FB",
      spark: [30, 50, 45, 65, 55, 70, 80],
    },
    {
      label: "Pengeluaran", value: formatCurrency(dailyReport?.total_expenses || 0),
      sub: "biaya operasional",
      icon: <IconExpense />, color: "#E8604A", bg: "#FDECEA",
      spark: [60, 40, 55, 35, 45, 30, 50],
    },
    {
      label: "Laba Bersih", value: formatCurrency(dailyReport?.net_profit || 0),
      sub: "setelah pengeluaran",
      icon: <IconProfit />, color: "#9B6DD4", bg: "#F2ECFB",
      spark: [20, 40, 35, 60, 55, 75, 90],
    },
  ];

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '3px solid #e8e4df', borderTopColor: '#5B8C5A',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: '#9a8878', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>Memuat dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', padding: '28px 32px',
      background: 'linear-gradient(160deg, #f4f0e8 0%, #ede8de 100%)',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#2a2420', margin: 0, letterSpacing: '-0.03em' }}>
            Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#8a8278', fontSize: '13px' }}>
            <IconCalendar />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'white', borderRadius: '14px',
          padding: '10px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #5B8C5A, #7aae78)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <IconStore />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#2a2420' }}>{tenant?.store_name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9a8878' }}>Toko aktif</p>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '20px',
            padding: '20px', border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
              <SparkBars values={s.spark} color={s.color} />
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#1e1a16', letterSpacing: '-0.02em' }}>
              {s.value}
            </p>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9a8878' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

        {/* LEFT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* BEST SELLER */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8A23A' }}>
                  <IconTrophy />
                </div>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2a2420' }}>Menu Terlaris</h2>
              </div>
              <span style={{ fontSize: '11px', color: '#9a8878', background: '#f5f2ed', borderRadius: '20px', padding: '4px 10px', fontWeight: 600 }}>30 hari terakhir</span>
            </div>

            {bestSellers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#b0a898', fontSize: '13px' }}>
                Belum ada data penjualan
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bestSellers.map((menu, idx) => {
                  const rankColors = ['#E8A23A', '#8a8a8a', '#cd7f32', '#5B8C5A', '#4AA8D8'];
                  const rankBgs   = ['#FFF8E8', '#F5F5F5', '#FDF2E8', '#EBF4EB', '#E8F5FB'];
                  return (
                    <div key={menu.id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 14px', borderRadius: '14px',
                      background: idx === 0 ? 'linear-gradient(135deg, #fffbf0, #fff8e4)' : '#fafaf8',
                      border: idx === 0 ? '1px solid rgba(232,162,58,0.2)' : '1px solid transparent',
                      transition: 'background 0.2s',
                    }}>
                      {/* Rank */}
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '10px',
                        background: rankBgs[idx] || '#f5f2ed',
                        color: rankColors[idx] || '#8a8278',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '800', flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>

                      {/* Image */}
                      {menu.images?.[0] ? (
                        <img src={menu.images[0].image_url} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                          background: 'linear-gradient(135deg, #e8e4de, #d8d4cc)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        }}>🍽️</div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2a2420', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {menu.name}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9a8878' }}>
                          {(menu as any).category?.name || '—'}
                        </p>
                      </div>

                      {/* Price + bar */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: rankColors[idx] || '#5B8C5A' }}>
                          {formatCurrency(menu.base_price)}
                        </p>
                        {(menu as any).total_sold && (
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9a8878' }}>
                            {(menu as any).total_sold}x terjual
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAYMENT METHOD BAR */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF4EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B8C5A' }}>
                <IconPayment />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2a2420' }}>Metode Pembayaran</h3>
            </div>

            {paymentEntries.length === 0 ? (
              <p style={{ color: '#b0a898', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Belum ada transaksi hari ini</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {paymentEntries.map(([method, amount], i) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: paymentColors[i % paymentColors.length] }} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#3a322c' }}>{paymentLabels[method] || method}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#2a2420' }}>{formatCurrency(amount)}</span>
                          <span style={{ fontSize: '11px', color: '#9a8878', marginLeft: '6px' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', borderRadius: '100px', background: '#f0ede8', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '100px',
                          background: paymentColors[i % paymentColors.length],
                          width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.34,1.1,0.64,1)',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* QUICK STATS */}
          <div style={{
            background: 'linear-gradient(135deg, #3d4a2e 0%, #5B8C5A 100%)',
            borderRadius: '20px', padding: '24px',
            boxShadow: '0 8px 32px rgba(91,140,90,0.3)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div style={{ position: 'relative' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Ringkasan Hari Ini
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
                {formatCurrency(totalRevenue)}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'Orders', value: dailyReport?.total_orders || 0, unit: 'transaksi' },
                  { label: 'Avg/Order', value: dailyReport?.total_orders ? Math.round(totalRevenue / dailyReport.total_orders) : 0, unit: 'per order', isCurrency: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    flex: 1, background: 'rgba(255,255,255,0.12)',
                    borderRadius: '12px', padding: '12px',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>
                      {item.isCurrency ? formatCurrency(item.value) : item.value}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CATEGORY DONUT */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F3EDFB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B6DD4' }}>
                <IconCategory />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2a2420' }}>Per Kategori</h3>
            </div>
            <DonutChart data={categoryDonut} />

            {/* Category amounts */}
            {categoryEntries.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryEntries.map(([cat, amount], i) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6b6560', textTransform: 'capitalize', fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: categoryColors[i % categoryColors.length] }}>{formatCurrency(amount as number)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};