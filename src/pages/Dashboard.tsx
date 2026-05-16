import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import lottieTree from "../assets/Loadingpohon.json";
import { useAuth } from "../contexts/AuthContext";
import { reportApi } from "../api/report";
import { menuApi } from "../api/menu";
import { formatCurrency } from "../utils/format";
import { DailyReport, Menu } from "../types";
import toast from "react-hot-toast";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconRevenue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconOrders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconExpense = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconProfit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);
const IconStore = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconPayment = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconCategory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconActivity = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ── Mini sparkline bar chart ───────────────────────────────────────────────────
const SparkBars: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "24px" }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: "2px",
            height: `${Math.max(3, (v / max) * 24)}px`,
            background: color,
            opacity: 0.25 + (i / (values.length - 1)) * 0.75,
            transition: "height 0.5s ease",
          }}
        />
      ))}
    </div>
  );
};

// ── Donut chart ───────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0)
    return (
      <div style={{ textAlign: "center", color: "#aaa", padding: "24px", fontSize: "13px" }}>
        Belum ada data
      </div>
    );
  let cumulative = 0;
  const cx = 50; const cy = 50; const r = 38; const stroke = 12;
  const circumference = 2 * Math.PI * r;
  const segments = data.map((d) => {
    const pct = d.value / total;
    const seg = {
      ...d, pct,
      dasharray: pct * circumference,
      dashoffset: -(cumulative * circumference),
    };
    cumulative += pct;
    return seg;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" width="96" height="96">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede8" strokeWidth={stroke} />
          {segments.map((seg, i) => (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${seg.dasharray} ${circumference - seg.dasharray}`}
              strokeDashoffset={seg.dashoffset}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.7s ease" }}
            />
          ))}
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "10px", color: "#a09080", fontWeight: 600, letterSpacing: "0.04em" }}>TOTAL</span>
          <span style={{ fontSize: "13px", color: "#2a2420", fontWeight: 800 }}>{data.length}</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11.5px", color: "#6b6560", fontWeight: 500 }}>{seg.label}</span>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: seg.color }}>{Math.round(seg.pct * 100)}%</span>
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

  const paymentDonut = paymentEntries.map(([k, v], i) => ({
    label: paymentLabels[k] || k, value: v, color: paymentColors[i % paymentColors.length],
  }));
  const categoryDonut = categoryEntries.map(([k, v], i) => ({
    label: k, value: v as number, color: categoryColors[i % categoryColors.length],
  }));

  const stats = [
    {
      label: "Pendapatan", value: formatCurrency(dailyReport?.total_revenue || 0),
      sub: `${dailyReport?.total_orders || 0} transaksi`,
      icon: <IconRevenue />, color: "#5B8C5A", bg: "#EBF4EB", accent: "rgba(91,140,90,0.12)",
      spark: [40, 55, 30, 70, 60, 80, 100],
    },
    {
      label: "Total Pesanan", value: `${dailyReport?.total_orders || 0}`,
      sub: "order hari ini",
      icon: <IconOrders />, color: "#4AA8D8", bg: "#E8F5FB", accent: "rgba(74,168,216,0.12)",
      spark: [30, 50, 45, 65, 55, 70, 80],
    },
    {
      label: "Pengeluaran", value: formatCurrency(dailyReport?.total_expenses || 0),
      sub: "biaya operasional",
      icon: <IconExpense />, color: "#E8604A", bg: "#FDECEA", accent: "rgba(232,96,74,0.12)",
      spark: [60, 40, 55, 35, 45, 30, 50],
    },
    {
      label: "Laba Bersih", value: formatCurrency(dailyReport?.net_profit || 0),
      sub: "setelah pengeluaran",
      icon: <IconProfit />, color: "#9B6DD4", bg: "#F2ECFB", accent: "rgba(155,109,212,0.12)",
      spark: [20, 40, 35, 60, 55, 75, 90],
    },
  ];

  if (isLoading) return (
    <div className="db-root" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="db-noise" />
      {/* Blurred skeleton content behind */}
      <div style={{ filter: 'blur(6px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
        <header className="db-header">
          <div className="db-header-left">
            <div className="db-header-eyebrow"><span className="db-eyebrow-dot" /><span>Live · Hari Ini</span></div>
            <h1 className="db-title">Dashboard</h1>
          </div>
        </header>
        <div className="db-stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="db-stat-card" style={{ height: 120, background: 'white' }} />
          ))}
        </div>
      </div>
      {/* Lottie overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(244,240,232,0.6)', backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          background: 'white', borderRadius: '28px', padding: '36px 48px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid rgba(91,140,90,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          animation: 'spin 0s', // reuse keyframe container
        }}>
          <Lottie animationData={lottieTree} loop autoplay style={{ width: 180, height: 180 }} />
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: '#1e1a14', marginTop: 4 }}>
            Memuat dashboard...
          </p>
          <div className="db-loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .db-loading-dots { display:flex; gap:5px; }
        .db-loading-dots span { width:6px; height:6px; border-radius:50%; background:#5B8C5A; opacity:0; animation:blink 1.4s ease-in-out infinite; }
        .db-loading-dots span:nth-child(2){animation-delay:.2s}
        .db-loading-dots span:nth-child(3){animation-delay:.4s}
      `}</style>
    </div>
  );

  const rankColors = ["#E8A23A", "#8a8a8a", "#cd7f32", "#5B8C5A", "#4AA8D8"];
  const rankBgs = ["#FFF8E8", "#F5F5F5", "#FDF2E8", "#EBF4EB", "#E8F5FB"];
  const rankMedals = ["🥇", "🥈", "🥉", "4", "5"];

  return (
    <div className="db-root">
      {/* ── NOISE OVERLAY ── */}
      <div className="db-noise" />

      {/* ── HEADER ── */}
      <header className="db-header">
        <div className="db-header-left">
          <div className="db-header-eyebrow">
            <span className="db-eyebrow-dot" />
            <IconActivity />
            <span>Live · Hari Ini</span>
          </div>
          <h1 className="db-title">Dashboard</h1>
          <div className="db-date">
            <IconCalendar />
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="db-store-badge">
          <div className="db-store-icon">
            <IconStore />
          </div>
          <div className="db-store-info">
            <p className="db-store-name">{tenant?.store_name}</p>
            <p className="db-store-status">
              <span className="db-status-dot" />
              Toko aktif
            </p>
          </div>
          <div className="db-store-arrow">
            <IconChevronRight />
          </div>
        </div>
      </header>

      {/* ── STAT CARDS ── */}
      <div className="db-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="db-stat-card" style={{ "--accent": s.color, "--accent-bg": s.bg } as React.CSSProperties}>
            <div className="db-stat-top">
              <div className="db-stat-icon-wrap" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <SparkBars values={s.spark} color={s.color} />
            </div>
            <p className="db-stat-value">{s.value}</p>
            <p className="db-stat-label" style={{ color: s.color }}>{s.label}</p>
            <p className="db-stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── HERO REVENUE BANNER ── */}
      <div className="db-hero-banner">
        <div className="db-hero-deco1" />
        <div className="db-hero-deco2" />
        <div className="db-hero-deco3" />
        <div className="db-hero-content">
          <div>
            <p className="db-hero-eyebrow">Total Pendapatan Hari Ini</p>
            <p className="db-hero-revenue">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="db-hero-pills">
            {[
              { label: "Orders", value: dailyReport?.total_orders || 0, unit: "transaksi", isCurrency: false },
              {
                label: "Rata-rata",
                value: dailyReport?.total_orders ? Math.round(totalRevenue / dailyReport.total_orders) : 0,
                unit: "per order", isCurrency: true,
              },
              { label: "Laba Bersih", value: dailyReport?.net_profit || 0, unit: "setelah biaya", isCurrency: true },
            ].map((item, i) => (
              <div key={i} className="db-hero-pill">
                <p className="db-hero-pill-value">
                  {item.isCurrency ? formatCurrency(item.value) : item.value}
                </p>
                <p className="db-hero-pill-label">{item.label}</p>
                <p className="db-hero-pill-unit">{item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="db-main-grid">

        {/* ── BEST SELLER ── */}
        <div className="db-card db-bestseller">
          <div className="db-card-header">
            <div className="db-card-title-group">
              <div className="db-card-icon-badge" style={{ background: "#FFF3E0", color: "#E8A23A" }}>
                <IconTrophy />
              </div>
              <div>
                <h2 className="db-card-title">Menu Terlaris</h2>
                <p className="db-card-subtitle">30 hari terakhir</p>
              </div>
            </div>
            <span className="db-tag db-tag-amber">Top 5</span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="db-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d0c8be" strokeWidth="1.5">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
              </svg>
              <p>Belum ada data penjualan</p>
            </div>
          ) : (
            <div className="db-bestseller-list">
              {bestSellers.map((menu, idx) => (
                <div
                  key={menu.id}
                  className={`db-bestseller-item ${idx === 0 ? "db-bestseller-item--gold" : ""}`}
                >
                  <div
                    className="db-rank-badge"
                    style={{ background: rankBgs[idx] || "#f5f2ed", color: rankColors[idx] || "#8a8278" }}
                  >
                    {idx < 3 ? rankMedals[idx] : idx + 1}
                  </div>

                  {menu.images?.[0] ? (
                    <img
                      src={menu.images[0].image_url}
                      className="db-menu-img"
                      alt={menu.name}
                    />
                  ) : (
                    <div className="db-menu-img db-menu-img--placeholder">🍽️</div>
                  )}

                  <div className="db-menu-info">
                    <p className="db-menu-name">{menu.name}</p>
                    <p className="db-menu-cat">{(menu as any).category?.name || "—"}</p>
                  </div>

                  <div className="db-menu-meta">
                    <p className="db-menu-price" style={{ color: rankColors[idx] || "#5B8C5A" }}>
                      {formatCurrency(menu.base_price)}
                    </p>
                    {(menu as any).total_sold && (
                      <div className="db-menu-sold">
                        <IconStar />
                        <span>{(menu as any).total_sold}x</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PAYMENT METHOD ── */}
        <div className="db-card db-payment">
          <div className="db-card-header">
            <div className="db-card-title-group">
              <div className="db-card-icon-badge" style={{ background: "#EBF4EB", color: "#5B8C5A" }}>
                <IconPayment />
              </div>
              <div>
                <h3 className="db-card-title">Metode Pembayaran</h3>
                <p className="db-card-subtitle">Distribusi hari ini</p>
              </div>
            </div>
          </div>

          {paymentEntries.length === 0 ? (
            <div className="db-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d0c8be" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <p>Belum ada transaksi hari ini</p>
            </div>
          ) : (
            <div className="db-payment-list">
              {paymentEntries.map(([method, amount], i) => {
                const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                return (
                  <div key={method} className="db-payment-item">
                    <div className="db-payment-row">
                      <div className="db-payment-label-group">
                        <div className="db-payment-dot" style={{ background: paymentColors[i % paymentColors.length] }} />
                        <span className="db-payment-method">{paymentLabels[method] || method}</span>
                      </div>
                      <div className="db-payment-amount-group">
                        <span className="db-payment-amount">{formatCurrency(amount)}</span>
                        <span className="db-payment-pct">{pct}%</span>
                      </div>
                    </div>
                    <div className="db-progress-track">
                      <div
                        className="db-progress-fill"
                        style={{
                          background: paymentColors[i % paymentColors.length],
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CATEGORY ── */}
        <div className="db-card db-category">
          <div className="db-card-header">
            <div className="db-card-title-group">
              <div className="db-card-icon-badge" style={{ background: "#F3EDFB", color: "#9B6DD4" }}>
                <IconCategory />
              </div>
              <div>
                <h3 className="db-card-title">Per Kategori</h3>
                <p className="db-card-subtitle">Komposisi penjualan</p>
              </div>
            </div>
          </div>
          <DonutChart data={categoryDonut} />
          {categoryEntries.length > 0 && (
            <div className="db-cat-amounts">
              {categoryEntries.map(([cat, amount], i) => (
                <div key={cat} className="db-cat-row">
                  <span className="db-cat-name">{cat}</span>
                  <span className="db-cat-amount" style={{ color: categoryColors[i % categoryColors.length] }}>
                    {formatCurrency(amount as number)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── ROOT ── */
        .db-root {
          min-height: 100vh;
          padding: 28px 32px 48px;
          background: #efe9df;
          background-image:
            radial-gradient(ellipse 70% 50% at 20% 10%, rgba(91,140,90,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(74,168,216,0.08) 0%, transparent 60%);
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* noise texture */
        .db-noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .db-root > *:not(.db-noise) { position: relative; z-index: 1; }

        /* ── LOADING ── */
        .db-loading-screen {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh;
          background: #efe9df;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .db-loading-inner { text-align: center; animation: fadeUp 0.4s ease; }
        .db-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid rgba(91,140,90,0.2);
          border-top-color: #5B8C5A;
          animation: spin 0.75s linear infinite;
          margin: 0 auto 14px;
        }
        .db-loading-text { color: #9a8878; font-size: 13px; font-weight: 500; }

        /* ── HEADER ── */
        .db-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px;
          animation: fadeUp 0.35s ease;
        }
        .db-header-eyebrow {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: #5B8C5A;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .db-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #5B8C5A;
          animation: pulse 2s ease-in-out infinite;
        }
        .db-title {
          font-family: 'Sora', sans-serif;
          font-size: 32px; font-weight: 800;
          color: #1e1a14; letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 8px;
        }
        .db-date {
          display: flex; align-items: center; gap: 5px;
          color: #9a8878; font-size: 12.5px; font-weight: 500;
        }

        .db-store-badge {
          display: flex; align-items: center; gap: 10px;
          background: white; border-radius: 16px;
          padding: 10px 14px 10px 12px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
          cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
        }
        .db-store-badge:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.11); transform: translateY(-1px); }
        .db-store-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #4a7949, #5B8C5A);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 3px 8px rgba(91,140,90,0.35);
        }
        .db-store-name { font-size: 13px; font-weight: 700; color: #1e1a14; }
        .db-store-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #5B8C5A; font-weight: 600; margin-top: 2px;
        }
        .db-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #5B8C5A;
          animation: pulse 2s ease-in-out infinite;
        }
        .db-store-arrow { color: #c0b8b0; margin-left: 2px; }

        /* ── STAT CARDS ── */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
          animation: fadeUp 0.4s ease 0.05s both;
        }
        .db-stat-card {
          background: white; border-radius: 20px; padding: 20px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default; position: relative; overflow: hidden;
        }
        .db-stat-card::before {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--accent);
          opacity: 0; transition: opacity 0.2s;
          border-radius: 0 0 20px 20px;
        }
        .db-stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.09); }
        .db-stat-card:hover::before { opacity: 1; }
        .db-stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
        .db-stat-icon-wrap {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .db-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 21px; font-weight: 800;
          color: #1a1612; letter-spacing: -0.03em; line-height: 1;
          margin-bottom: 5px;
        }
        .db-stat-label {
          font-size: 10.5px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 3px;
        }
        .db-stat-sub { font-size: 11px; color: #9a8878; font-weight: 500; }

        /* ── HERO BANNER ── */
        .db-hero-banner {
          background: linear-gradient(135deg, #2d3d26 0%, #3d5438 40%, #5B8C5A 100%);
          border-radius: 24px; padding: 28px 32px;
          margin-bottom: 18px;
          position: relative; overflow: hidden;
          box-shadow: 0 12px 48px rgba(45,61,38,0.35), 0 4px 16px rgba(45,61,38,0.2);
          animation: fadeUp 0.4s ease 0.1s both;
        }
        .db-hero-deco1 {
          position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .db-hero-deco2 {
          position: absolute; bottom: -60px; left: 40%;
          width: 180px; height: 180px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .db-hero-deco3 {
          position: absolute; top: 20px; right: 200px;
          width: 80px; height: 80px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .db-hero-content {
          position: relative;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
          flex-wrap: wrap;
        }
        .db-hero-eyebrow {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
        }
        .db-hero-revenue {
          font-family: 'Sora', sans-serif;
          font-size: 38px; font-weight: 800; color: white;
          letter-spacing: -0.04em; line-height: 1;
        }
        .db-hero-pills { display: flex; gap: 12px; flex-wrap: wrap; }
        .db-hero-pill {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border-radius: 14px; padding: 14px 18px;
          border: 1px solid rgba(255,255,255,0.12);
          min-width: 110px;
        }
        .db-hero-pill-value {
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 800; color: white; letter-spacing: -0.02em;
        }
        .db-hero-pill-label {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75);
          margin-top: 3px;
        }
        .db-hero-pill-unit {
          font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 500; margin-top: 1px;
        }

        /* ── MAIN GRID ── */
        .db-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 340px;
          grid-template-rows: auto auto;
          gap: 16px;
          animation: fadeUp 0.4s ease 0.15s both;
        }
        .db-bestseller { grid-column: 1; grid-row: 1 / 3; }
        .db-payment    { grid-column: 2; grid-row: 1; }
        .db-category   { grid-column: 3; grid-row: 1 / 3; }

        /* ── CARD BASE ── */
        .db-card {
          background: white; border-radius: 22px; padding: 22px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
        }
        .db-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .db-card-title-group { display: flex; align-items: center; gap: 10px; }
        .db-card-icon-badge {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .db-card-title { font-size: 14.5px; font-weight: 700; color: #1e1a14; }
        .db-card-subtitle { font-size: 11px; color: #9a8878; font-weight: 500; margin-top: 1px; }
        .db-tag {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
          letter-spacing: 0.02em;
        }
        .db-tag-amber { background: #FFF3E0; color: #C87D20; }

        /* ── BEST SELLER ── */
        .db-bestseller-list { display: flex; flex-direction: column; gap: 7px; }
        .db-bestseller-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 13px; border-radius: 14px;
          background: #fafaf8;
          border: 1px solid transparent;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .db-bestseller-item:hover { background: #f4f0e8; transform: translateX(2px); }
        .db-bestseller-item--gold {
          background: linear-gradient(135deg, #fffcf0, #fff8e2);
          border-color: rgba(232,162,58,0.25);
        }
        .db-bestseller-item--gold:hover { background: linear-gradient(135deg, #fff9e2, #fff4d0); }
        .db-rank-badge {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; flex-shrink: 0;
        }
        .db-menu-img {
          width: 44px; height: 44px; border-radius: 12px; object-fit: cover; flex-shrink: 0;
        }
        .db-menu-img--placeholder {
          background: linear-gradient(135deg, #e8e4de, #d8d4cc);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .db-menu-info { flex: 1; min-width: 0; }
        .db-menu-name {
          font-size: 13.5px; font-weight: 600; color: #1e1a14;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .db-menu-cat { font-size: 11px; color: #9a8878; margin-top: 2px; }
        .db-menu-meta { text-align: right; flex-shrink: 0; }
        .db-menu-price { font-size: 13.5px; font-weight: 700; }
        .db-menu-sold {
          display: flex; align-items: center; justify-content: flex-end; gap: 3px;
          font-size: 11px; color: #b0a898; font-weight: 600; margin-top: 3px;
        }
        .db-menu-sold svg { color: #E8A23A; }

        /* ── PAYMENT ── */
        .db-payment-list { display: flex; flex-direction: column; gap: 16px; }
        .db-payment-item {}
        .db-payment-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 7px;
        }
        .db-payment-label-group { display: flex; align-items: center; gap: 8px; }
        .db-payment-dot { width: 8px; height: 8px; border-radius: 50%; }
        .db-payment-method { font-size: 13px; font-weight: 600; color: #2a2420; }
        .db-payment-amount-group { display: flex; align-items: center; gap: 8px; }
        .db-payment-amount { font-size: 13px; font-weight: 700; color: #1a1612; }
        .db-payment-pct {
          font-size: 11px; color: #9a8878; font-weight: 600;
          background: #f5f2ed; padding: 2px 7px; border-radius: 20px;
        }
        .db-progress-track {
          height: 5px; border-radius: 100px; background: #f0ede8; overflow: hidden;
        }
        .db-progress-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.9s cubic-bezier(0.34, 1.1, 0.64, 1);
        }

        /* ── CATEGORY ── */
        .db-cat-amounts {
          margin-top: 16px; border-top: 1px solid #f0ede8; padding-top: 16px;
          display: flex; flex-direction: column; gap: 9px;
        }
        .db-cat-row { display: flex; justify-content: space-between; align-items: center; }
        .db-cat-name {
          font-size: 12px; color: #6b6560; font-weight: 500; text-transform: capitalize;
        }
        .db-cat-amount { font-size: 12px; font-weight: 700; }

        /* ── EMPTY STATE ── */
        .db-empty {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 32px 16px; color: #b0a898; font-size: 13px; text-align: center;
        }

        /* ═══════════════════════════════════
           RESPONSIVE — TABLET LANDSCAPE
           (768 – 1180px)
        ═══════════════════════════════════ */
        @media (max-width: 1180px) {
          .db-root { padding: 22px 24px 40px; }
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .db-main-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
          }
          .db-bestseller { grid-column: 1 / 3; grid-row: 1; }
          .db-payment    { grid-column: 1;     grid-row: 2; }
          .db-category   { grid-column: 2;     grid-row: 2; }
          .db-hero-revenue { font-size: 30px; }
          .db-title { font-size: 26px; }
        }

        /* ═══════════════════════════════════
           TABLET PORTRAIT (600 – 767px)
        ═══════════════════════════════════ */
        @media (max-width: 767px) {
          .db-root { padding: 18px 18px 36px; }
          .db-header { flex-direction: column; gap: 14px; align-items: flex-start; }
          .db-store-badge { align-self: stretch; }
          .db-title { font-size: 24px; }
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .db-stat-value { font-size: 18px; }
          .db-hero-banner { padding: 22px 22px; }
          .db-hero-content { flex-direction: column; align-items: flex-start; gap: 18px; }
          .db-hero-revenue { font-size: 26px; }
          .db-hero-pills { gap: 8px; }
          .db-hero-pill { min-width: 90px; padding: 11px 14px; }
          .db-main-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .db-bestseller { grid-column: 1; grid-row: 1; }
          .db-payment    { grid-column: 1; grid-row: 2; }
          .db-category   { grid-column: 1; grid-row: 3; }
        }

        /* ═══════════════════════════════════
           SMARTPHONE (< 480px)
        ═══════════════════════════════════ */
        @media (max-width: 479px) {
          .db-root { padding: 16px 14px 32px; }
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
          .db-stat-card { padding: 15px; border-radius: 16px; }
          .db-stat-value { font-size: 15px; }
          .db-stat-icon-wrap { width: 34px; height: 34px; border-radius: 10px; }
          .db-hero-banner { padding: 18px; border-radius: 18px; }
          .db-hero-revenue { font-size: 22px; }
          .db-hero-pills { width: 100%; }
          .db-hero-pill { flex: 1; min-width: 0; padding: 10px 12px; }
          .db-hero-pill-value { font-size: 13px; }
          .db-card { padding: 16px; border-radius: 18px; }
          .db-bestseller-item { padding: 9px 10px; gap: 9px; }
          .db-menu-img { width: 38px; height: 38px; border-radius: 10px; }
          .db-rank-badge { width: 26px; height: 26px; border-radius: 8px; font-size: 11px; }
          .db-store-badge { padding: 9px 12px; }
        }

        /* ═══════════════════════════════════
           TABLET LANDSCAPE SPECIFIC
           (768 – 1024px) height ≤ 768
        ═══════════════════════════════════ */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .db-root { padding: 16px 22px 32px; }
          .db-title { font-size: 22px; }
          .db-stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 14px;
          }
          .db-stat-card { padding: 14px; border-radius: 16px; }
          .db-stat-value { font-size: 17px; }
          .db-stat-top { margin-bottom: 10px; }
          .db-hero-banner { padding: 18px 24px; margin-bottom: 14px; border-radius: 18px; }
          .db-hero-revenue { font-size: 26px; }
          .db-hero-pill { min-width: 90px; padding: 10px 14px; }
          .db-hero-pill-value { font-size: 14px; }
          .db-main-grid {
            grid-template-columns: 1.2fr 1fr 280px;
            gap: 12px;
          }
          .db-bestseller { grid-column: 1; grid-row: 1 / 3; }
          .db-payment    { grid-column: 2; grid-row: 1; }
          .db-category   { grid-column: 3; grid-row: 1 / 3; }
          .db-card { padding: 16px; }
          .db-bestseller-item { padding: 9px 10px; }
          .db-bestseller-list { gap: 5px; }
          .db-menu-img { width: 38px; height: 38px; }
          .db-card-title { font-size: 13.5px; }
          .db-hero-eyebrow { margin-bottom: 4px; }
        }
      `}</style>
    </div>
  );
};