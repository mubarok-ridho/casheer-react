import React, { useState, useEffect } from 'react';
import { ingredientApi } from '../api/ingredient';
import { Ingredient } from '../types';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

// ── Unit System — UNTOUCHED ───────────────────────────────────────────────────
type UnitGroup = 'weight' | 'volume' | 'piece';
interface UnitDef { label: string; group: UnitGroup; toBase: number; baseUnit: string; }

const UNITS: Record<string, UnitDef> = {
  mg:      { label: 'mg',      group: 'weight', toBase: 0.001,  baseUnit: 'g'       },
  g:       { label: 'g',       group: 'weight', toBase: 1,      baseUnit: 'g'       },
  kg:      { label: 'kg',      group: 'weight', toBase: 1000,   baseUnit: 'g'       },
  ml:      { label: 'ml',      group: 'volume', toBase: 1,      baseUnit: 'ml'      },
  liter:   { label: 'liter',   group: 'volume', toBase: 1000,   baseUnit: 'ml'      },
  pcs:     { label: 'pcs',     group: 'piece',  toBase: 1,      baseUnit: 'pcs'     },
  buah:    { label: 'buah',    group: 'piece',  toBase: 1,      baseUnit: 'buah'    },
  lembar:  { label: 'lembar',  group: 'piece',  toBase: 1,      baseUnit: 'lembar'  },
  sachet:  { label: 'sachet',  group: 'piece',  toBase: 1,      baseUnit: 'sachet'  },
  botol:   { label: 'botol',   group: 'piece',  toBase: 1,      baseUnit: 'botol'   },
  bungkus: { label: 'bungkus', group: 'piece',  toBase: 1,      baseUnit: 'bungkus' },
};
const UNIT_KEYS = Object.keys(UNITS);

function toBase(value: number, unit: string): number { return value * (UNITS[unit]?.toBase ?? 1); }
function getBaseUnit(unit: string): string { return UNITS[unit]?.baseUnit ?? unit; }
function fmtNum(n: number): string {
  if (n === 0) return '0';
  if (n % 1 === 0) return n.toString();
  return n.toFixed(n < 1 ? 3 : 2).replace(/\.?0+$/, '');
}
function displayStock(stockInBase: number, baseUnit: string): string {
  if (baseUnit === 'g')  return stockInBase >= 1000 ? `${fmtNum(stockInBase / 1000)} kg`    : `${fmtNum(stockInBase)} g`;
  if (baseUnit === 'ml') return stockInBase >= 1000 ? `${fmtNum(stockInBase / 1000)} liter` : `${fmtNum(stockInBase)} ml`;
  return `${fmtNum(stockInBase)} ${baseUnit}`;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const AlertTriIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  orange: '#e8622a', orangeLight: '#fff3ee', orangeBorder: 'rgba(232,98,42,0.2)',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  red: '#E8604A', redLight: '#fdecea',
  accent: '#E8A23A', accentLight: '#fff8e8',
  blue: '#4AA8D8', blueLight: '#e8f5fb',
};

// ── Form State ────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  stockQty: string; stockUnit: string;
  costTotal: string; costQty: string; costUnit: string;
  lowQty: string; lowUnit: string;
}
const defaultForm = (): FormState => ({
  name: '', stockQty: '', stockUnit: 'g',
  costTotal: '', costQty: '', costUnit: 'g',
  lowQty: '', lowUnit: 'g',
});

// ── Cost Preview ──────────────────────────────────────────────────────────────
const CostPreview: React.FC<{ f: FormState }> = ({ f }) => {
  const totalHarga = parseFloat(f.costTotal) || 0;
  const beliQty    = parseFloat(f.costQty) || 0;
  if (!totalHarga || !beliQty) return null;

  const beliBase     = toBase(beliQty, f.costUnit);
  const baseUnit     = getBaseUnit(f.costUnit);
  const hargaPerBase = totalHarga / beliBase;
  const exGroup = UNITS[f.stockUnit]?.group;
  const exQty   = exGroup === 'piece' ? 1 : 100;
  const exUnit  = exGroup === 'weight' ? 'g' : exGroup === 'volume' ? 'ml' : f.stockUnit;
  const exBase  = toBase(exQty, exUnit);
  const exCost  = exBase * hargaPerBase;

  return (
    <div className="sk-cost-preview">
      <div className="sk-cost-preview-header">
        <InfoIcon />
        <span>Preview Kalkulasi COGS</span>
      </div>
      <div className="sk-cost-rows">
        <div className="sk-cost-row">
          <span>Harga per {baseUnit}</span>
          <strong style={{ color: C.primary }}>{formatCurrency(hargaPerBase)}</strong>
        </div>
        <div className="sk-cost-row">
          <span>Per {exQty} {exUnit}</span>
          <strong style={{ color: C.primary }}>{formatCurrency(exCost)}</strong>
        </div>
        <div className="sk-cost-row sk-cost-row--highlight">
          <span>Jika resep butuh {exQty} {exUnit}</span>
          <strong>COGS = {formatCurrency(exCost)}</strong>
        </div>
      </div>
    </div>
  );
};

// ── Stock Level Bar ───────────────────────────────────────────────────────────
const StockBar: React.FC<{ stock: number; lowAt: number }> = ({ stock, lowAt }) => {
  if (lowAt <= 0) return null;
  const pct = Math.min(100, (stock / (lowAt * 3)) * 100);
  const color = stock <= lowAt ? C.orange : stock <= lowAt * 1.5 ? C.accent : C.primary;
  return (
    <div className="sk-stock-bar-track">
      <div className="sk-stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

// ── Main Stock Page ───────────────────────────────────────────────────────────
export const Stock: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editId,      setEditId]      = useState<number | null>(null);
  const [form,        setForm]        = useState<FormState>(defaultForm());
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [filter,      setFilter]      = useState<'all' | 'low'>('all');

  // ── Fetch logic — UNTOUCHED ──────────────────────────────────────────────────
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setIngredients(await ingredientApi.getAll()); }
    catch { toast.error('Gagal memuat data stok'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(defaultForm()); setShowForm(true); };

  const openEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    const baseUnit = ing.unit;
    const displayU = baseUnit === 'g' && ing.stock >= 1000 ? 'kg'
                   : baseUnit === 'ml' && ing.stock >= 1000 ? 'liter' : baseUnit;
    const dStock = UNITS[displayU]?.toBase > 0 ? ing.stock / UNITS[displayU].toBase : ing.stock;
    const dLow   = UNITS[displayU]?.toBase > 0 ? ing.low_stock_at / UNITS[displayU].toBase : ing.low_stock_at;
    const costPer1 = ing.cost_per_unit * (UNITS[displayU]?.toBase ?? 1);
    setForm({
      name: ing.name,
      stockQty: fmtNum(dStock), stockUnit: displayU,
      costTotal: fmtNum(costPer1), costQty: '1', costUnit: displayU,
      lowQty: fmtNum(dLow), lowUnit: displayU,
    });
    setShowForm(true);
  };

  const setStockUnit = (u: string) => {
    const grp = UNITS[u]?.group;
    const same = UNIT_KEYS.filter(k => UNITS[k].group === grp);
    setForm(f => ({
      ...f, stockUnit: u,
      costUnit: same.includes(f.costUnit) ? f.costUnit : u,
      lowUnit:  same.includes(f.lowUnit)  ? f.lowUnit  : u,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    const stockBase   = toBase(parseFloat(form.stockQty) || 0, form.stockUnit);
    const beliBase    = toBase(parseFloat(form.costQty) || 0, form.costUnit);
    const totalHarga  = parseFloat(form.costTotal) || 0;
    const costPerBase = beliBase > 0 ? totalHarga / beliBase : 0;
    const baseUnit    = getBaseUnit(form.stockUnit);
    const lowBase     = toBase(parseFloat(form.lowQty) || 0, form.lowUnit);

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), unit: baseUnit, stock: stockBase, cost_per_unit: costPerBase, low_stock_at: lowBase };
      if (editId) { await ingredientApi.update(editId, payload); toast.success('Bahan diperbarui'); }
      else { await ingredientApi.create(payload); toast.success('Bahan ditambahkan'); }
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try { await ingredientApi.delete(id); toast.success('Dihapus'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.error || 'Gagal menghapus'); }
  };

  const sameGroupUnits = (unit: string) => UNIT_KEYS.filter(k => UNITS[k].group === UNITS[unit]?.group);

  const lowCount = ingredients.filter(i => i.low_stock_at > 0 && i.stock <= i.low_stock_at).length;
  const filtered = ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'low' && i.low_stock_at > 0 && i.stock <= i.low_stock_at);
    return matchSearch && matchFilter;
  });

  // Stats
  const totalItems = ingredients.length;
  const totalValue = ingredients.reduce((s, i) => s + i.stock * i.cost_per_unit, 0);

  return (
    <div className="sk-root">

      {/* ── Loading overlay ── */}
      {loading && (
        <div className="sk-overlay">
          <div className="sk-overlay-card">
            <Lottie animationData={lottieTree} loop autoplay style={{ width: 160, height: 160 }} />
            <p className="sk-overlay-text">Memuat stok bahan...</p>
            <div className="sk-dots"><span/><span/><span/></div>
          </div>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <div className="sk-hero">
        <div className="sk-hero-bg" />
        <div className="sk-hero-content">
          <div>
            <div className="sk-hero-eyebrow">
              <BoxIcon />
              <span>Manajemen Inventori</span>
            </div>
            <h1 className="sk-title">Stok Bahan Baku</h1>
            <p className="sk-subtitle">Pantau stok, biaya, dan threshold peringatan bahan baku</p>
          </div>

          {/* Stat badges */}
          <div className="sk-hero-stats">
            <div className="sk-stat" style={{ background: C.primaryLight }}>
              <div className="sk-stat-icon" style={{ color: C.primary }}><BoxIcon /></div>
              <div>
                <p className="sk-stat-val" style={{ color: C.primary }}>{totalItems}</p>
                <p className="sk-stat-lbl">Total Bahan</p>
              </div>
            </div>
            <div className="sk-stat" style={{ background: C.blueLight }}>
              <div className="sk-stat-icon" style={{ color: C.blue }}><CoinIcon /></div>
              <div>
                <p className="sk-stat-val" style={{ color: C.blue, fontSize: 15 }}>{formatCurrency(totalValue)}</p>
                <p className="sk-stat-lbl">Nilai Stok</p>
              </div>
            </div>
            {lowCount > 0 && (
              <div className="sk-stat" style={{ background: C.orangeLight }}>
                <div className="sk-stat-icon" style={{ color: C.orange }}><AlertTriIcon /></div>
                <div>
                  <p className="sk-stat-val" style={{ color: C.orange }}>{lowCount}</p>
                  <p className="sk-stat-lbl">Hampir Habis</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={openCreate} className="sk-add-btn">
          <PlusIcon />
          <span>Tambah Bahan</span>
        </button>
      </div>

      {/* ── LOW STOCK ALERT BANNER ── */}
      {lowCount > 0 && (
        <div className="sk-alert-banner">
          <div className="sk-alert-icon"><AlertTriIcon /></div>
          <div className="sk-alert-text">
            <strong>{lowCount} bahan baku hampir habis</strong>
            <span> — segera lakukan restok untuk kelancaran operasional</span>
          </div>
          <button
            onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
            className={`sk-alert-btn ${filter === 'low' ? 'sk-alert-btn--active' : ''}`}
          >
            {filter === 'low' ? 'Tampilkan Semua' : 'Lihat yang Habis'}
          </button>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div className="sk-filter-card">
        <div className="sk-search-wrap">
          <span className="sk-search-icon" style={{ color: searchFocus ? C.primary : '#b0a898' }}>
            <SearchIcon />
          </span>
          <input
            className="sk-search"
            placeholder="Cari bahan baku..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{ borderColor: searchFocus ? C.primary : '#e8e4dc', boxShadow: searchFocus ? '0 0 0 3px rgba(91,140,90,0.1)' : 'none' }}
          />
          {search && (
            <button className="sk-search-clear" onClick={() => setSearch('')}><XIcon /></button>
          )}
        </div>

        {/* Filter pills */}
        <div className="sk-filter-pills">
          {[{ k: 'all', l: 'Semua' }, { k: 'low', l: `⚠ Hampir Habis (${lowCount})` }].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setFilter(k as any)}
              className={`sk-filter-pill ${filter === k ? 'sk-filter-pill--active' : ''}`}
            >
              {l}
            </button>
          ))}
        </div>

        {!loading && (
          <p className="sk-filter-result">
            Menampilkan <strong>{filtered.length}</strong> dari {totalItems} bahan
            {search ? ` · "${search}"` : ''}
          </p>
        )}
      </div>

      {/* ── TABLE / CARDS ── */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="sk-empty">
              <Lottie animationData={lottieTree} loop autoplay style={{ width: 130, height: 130, opacity: 0.65 }} />
              <p className="sk-empty-title">{search ? 'Bahan tidak ditemukan' : 'Belum ada bahan baku'}</p>
              <p className="sk-empty-sub">
                {search ? `Tidak ada bahan dengan kata kunci "${search}"` : 'Mulai dengan menambahkan bahan baku pertama'}
              </p>
              {!search && (
                <button onClick={openCreate} className="sk-add-btn" style={{ marginTop: 8 }}>
                  <PlusIcon /> Tambah Bahan Pertama
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="sk-table-wrap">
                <div className="sk-table-header">
                  <span>Bahan Baku</span>
                  <span>Stok Saat Ini</span>
                  <span>Harga per Unit Dasar</span>
                  <span>Min. Stok</span>
                  <span style={{ textAlign: 'center' }}>Aksi</span>
                </div>
                <div className="sk-table-body">
                  {filtered.map((ing, idx) => {
                    const isLow = ing.low_stock_at > 0 && ing.stock <= ing.low_stock_at;
                    const isWarn = !isLow && ing.low_stock_at > 0 && ing.stock <= ing.low_stock_at * 1.5;
                    return (
                      <div key={ing.id} className={`sk-row ${isLow ? 'sk-row--low' : ''} ${idx === filtered.length - 1 ? 'sk-row--last' : ''}`}>
                        {/* Name */}
                        <div className="sk-row-name">
                          <div className={`sk-row-dot ${isLow ? 'sk-row-dot--low' : isWarn ? 'sk-row-dot--warn' : ''}`} />
                          <div>
                            <span className="sk-row-label">{ing.name}</span>
                            {isLow && <span className="sk-low-badge"><WarningIcon /> Hampir Habis</span>}
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="sk-row-stock">
                          <span className="sk-row-stock-val" style={{ color: isLow ? C.orange : C.primary }}>
                            {displayStock(ing.stock, ing.unit)}
                          </span>
                          <StockBar stock={ing.stock} lowAt={ing.low_stock_at} />
                        </div>

                        {/* Cost */}
                        <div className="sk-row-cost">
                          <span className="sk-row-cost-main">{formatCurrency(ing.cost_per_unit)}/{ing.unit}</span>
                          {(ing.unit === 'g' || ing.unit === 'ml') && (
                            <span className="sk-row-cost-sub">
                              = {formatCurrency(ing.cost_per_unit * 1000)}/{ing.unit === 'g' ? 'kg' : 'liter'}
                            </span>
                          )}
                        </div>

                        {/* Low stock */}
                        <span className="sk-row-low">
                          {ing.low_stock_at > 0 ? displayStock(ing.low_stock_at, ing.unit) : <span style={{ color: '#d0c8be' }}>—</span>}
                        </span>

                        {/* Actions */}
                        <div className="sk-row-actions">
                          <button onClick={() => openEdit(ing)} className="sk-btn-edit" title="Edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDelete(ing.id, ing.name)} className="sk-btn-delete" title="Hapus">
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile cards */}
              <div className="sk-cards">
                {filtered.map(ing => {
                  const isLow  = ing.low_stock_at > 0 && ing.stock <= ing.low_stock_at;
                  const isWarn = !isLow && ing.low_stock_at > 0 && ing.stock <= ing.low_stock_at * 1.5;
                  return (
                    <div key={ing.id} className={`sk-card ${isLow ? 'sk-card--low' : ''}`}>
                      <div className="sk-card-top">
                        <div className="sk-card-name-row">
                          <div className={`sk-row-dot ${isLow ? 'sk-row-dot--low' : isWarn ? 'sk-row-dot--warn' : ''}`} />
                          <span className="sk-card-name">{ing.name}</span>
                          {isLow && <span className="sk-low-badge sk-low-badge--sm"><WarningIcon /></span>}
                        </div>
                        <div className="sk-card-actions-top">
                          <button onClick={() => openEdit(ing)} className="sk-btn-edit"><EditIcon /></button>
                          <button onClick={() => handleDelete(ing.id, ing.name)} className="sk-btn-delete"><TrashIcon /></button>
                        </div>
                      </div>
                      <div className="sk-card-body">
                        <div className="sk-card-stat">
                          <span className="sk-card-stat-lbl">Stok</span>
                          <span className="sk-card-stat-val" style={{ color: isLow ? C.orange : C.primary }}>
                            {displayStock(ing.stock, ing.unit)}
                          </span>
                        </div>
                        <div className="sk-card-stat">
                          <span className="sk-card-stat-lbl">Harga</span>
                          <span className="sk-card-stat-val">{formatCurrency(ing.cost_per_unit)}/{ing.unit}</span>
                        </div>
                        <div className="sk-card-stat">
                          <span className="sk-card-stat-lbl">Min. Stok</span>
                          <span className="sk-card-stat-val">{ing.low_stock_at > 0 ? displayStock(ing.low_stock_at, ing.unit) : '—'}</span>
                        </div>
                      </div>
                      {ing.low_stock_at > 0 && (
                        <StockBar stock={ing.stock} lowAt={ing.low_stock_at} />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="sk-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="sk-modal" onClick={e => e.stopPropagation()}>

            {/* Saving overlay inside modal */}
            {saving && (
              <div className="sk-modal-saving">
                <Lottie animationData={lottieTree} loop autoplay style={{ width: 120, height: 120 }} />
                <p className="sk-overlay-text">{editId ? 'Memperbarui bahan...' : 'Menambahkan bahan...'}</p>
                <div className="sk-dots"><span/><span/><span/></div>
              </div>
            )}

            {/* Header */}
            <div className="sk-modal-header">
              <div className="sk-modal-header-left">
                <div className="sk-modal-icon">
                  <BoxIcon />
                </div>
                <div>
                  <h2 className="sk-modal-title">{editId ? 'Edit' : 'Tambah'} Bahan Baku</h2>
                  <p className="sk-modal-sub">Tersimpan dalam unit dasar (g / ml / pcs) untuk akurasi COGS</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="sk-modal-close">
                <XIcon />
              </button>
            </div>

            {/* Body */}
            <div className="sk-modal-body">
              <div className="sk-form">

                {/* Nama */}
                <div className="sk-field">
                  <label className="sk-label">Nama Bahan *</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="cth: Susu UHT, Tepung Terigu"
                    className="sk-input"
                  />
                </div>

                {/* Stok */}
                <div className="sk-field">
                  <label className="sk-label">Stok Awal</label>
                  <div className="sk-input-row">
                    <input
                      type="number" value={form.stockQty} min="0"
                      onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))}
                      placeholder="0" className="sk-input sk-input--flex"
                    />
                    <select value={form.stockUnit} onChange={e => setStockUnit(e.target.value)} className="sk-select">
                      {UNIT_KEYS.map(u => <option key={u} value={u}>{UNITS[u].label}</option>)}
                    </select>
                  </div>
                  {form.stockQty && (
                    <p className="sk-field-hint">
                      = {fmtNum(toBase(parseFloat(form.stockQty) || 0, form.stockUnit))} {getBaseUnit(form.stockUnit)} tersimpan di database
                    </p>
                  )}
                </div>

                {/* Harga */}
                <div className="sk-field">
                  <label className="sk-label">
                    <span style={{ marginRight: 4 }}>💰</span>
                    Harga Pembelian
                    <span className="sk-label-opt"> · sesuai nota</span>
                  </label>
                  <div className="sk-cost-box">
                    <p className="sk-cost-formula">Rp <em>total</em> untuk <em>qty</em> <em>satuan</em></p>
                    <div className="sk-cost-inputs">
                      <div className="sk-cost-col">
                        <span className="sk-cost-col-lbl">Total Harga (Rp)</span>
                        <input
                          type="number" value={form.costTotal} min="0"
                          onChange={e => setForm(f => ({ ...f, costTotal: e.target.value }))}
                          placeholder="50000" className="sk-input sk-input--sm"
                        />
                      </div>
                      <div className="sk-cost-col sk-cost-col--narrow">
                        <span className="sk-cost-col-lbl">Untuk</span>
                        <input
                          type="number" value={form.costQty} min="0"
                          onChange={e => setForm(f => ({ ...f, costQty: e.target.value }))}
                          placeholder="5" className="sk-input sk-input--sm"
                        />
                      </div>
                      <div className="sk-cost-col sk-cost-col--narrow">
                        <span className="sk-cost-col-lbl">Satuan</span>
                        <select
                          value={form.costUnit}
                          onChange={e => setForm(f => ({ ...f, costUnit: e.target.value }))}
                          className="sk-select sk-select--sm"
                        >
                          {sameGroupUnits(form.stockUnit).map(u => (
                            <option key={u} value={u}>{UNITS[u].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <CostPreview f={form} />
                  </div>
                </div>

                {/* Warning stok rendah */}
                <div className="sk-field">
                  <label className="sk-label">
                    <span style={{ marginRight: 4 }}>⚠️</span>
                    Warning Stok Rendah
                    <span className="sk-label-opt"> (opsional)</span>
                  </label>
                  <div className="sk-input-row">
                    <input
                      type="number" value={form.lowQty} min="0"
                      onChange={e => setForm(f => ({ ...f, lowQty: e.target.value }))}
                      placeholder="0 = nonaktif" className="sk-input sk-input--flex"
                    />
                    <select
                      value={form.lowUnit}
                      onChange={e => setForm(f => ({ ...f, lowUnit: e.target.value }))}
                      className="sk-select"
                    >
                      {sameGroupUnits(form.stockUnit).map(u => (
                        <option key={u} value={u}>{UNITS[u].label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="sk-field-hint">Notifikasi muncul saat stok menyentuh atau di bawah nilai ini</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sk-modal-footer">
              <button onClick={() => setShowForm(false)} className="sk-btn-cancel">Batal</button>
              <button onClick={handleSave} disabled={saving} className="sk-btn-save" style={{ opacity: saving ? 0.65 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? (
                  <><Lottie animationData={lottieTree} loop autoplay style={{ width: 18, height: 18 }} /> Menyimpan...</>
                ) : (
                  <><CheckIcon /> {editId ? 'Simpan Perubahan' : 'Tambah Bahan'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }

        @keyframes sk-fade-up  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sk-card-in  { from{opacity:0;transform:scale(.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sk-blink    { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes sk-slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sk-pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── Root ── */
        .sk-root {
          display: flex; flex-direction: column; gap: 18px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          animation: sk-fade-up 0.35s ease;
          position: relative;
        }

        /* ── Overlay ── */
        .sk-overlay {
          position: fixed; inset: 0; z-index: 9998;
          display: flex; align-items: center; justify-content: center;
          background: rgba(244,240,232,0.65); backdrop-filter: blur(8px);
        }
        .sk-overlay-card {
          background: white; border-radius: 28px; padding: 36px 52px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13);
          border: 1px solid rgba(91,140,90,0.1);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          animation: sk-card-in 0.28s cubic-bezier(0.34,1.1,0.64,1);
        }
        .sk-overlay-text { font-size: 15px; font-weight: 700; color: ${C.text}; margin-top: 4px; }
        .sk-dots { display: flex; gap: 5px; }
        .sk-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: sk-blink 1.4s ease-in-out infinite;
        }
        .sk-dots span:nth-child(2){animation-delay:.2s}
        .sk-dots span:nth-child(3){animation-delay:.4s}

        /* ── Hero ── */
        .sk-hero {
          background: white; border-radius: 22px; padding: 22px 24px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
          position: relative; overflow: hidden;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .sk-hero-bg {
          position: absolute; top: 0; right: 0; bottom: 0; width: 38%;
          background: linear-gradient(135deg, transparent, rgba(91,140,90,0.04) 50%, rgba(91,140,90,0.07));
          pointer-events: none;
        }
        .sk-hero-bg::after {
          content: ''; position: absolute; top: -36px; right: -36px;
          width: 160px; height: 160px; border-radius: 50%;
          border: 36px solid rgba(91,140,90,0.05);
        }
        .sk-hero-content { position: relative; flex: 1; min-width: 0; }
        .sk-hero-eyebrow {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: ${C.primary};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px;
        }
        .sk-title {
          font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800;
          color: #1a1612; letter-spacing: -0.04em; line-height: 1; margin-bottom: 5px;
        }
        .sk-subtitle { font-size: 13px; color: ${C.sub}; margin-bottom: 18px; }
        .sk-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .sk-stat {
          display: flex; align-items: center; gap: 10px;
          border-radius: 12px; padding: 10px 14px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .sk-stat-icon { display: flex; align-items: center; flex-shrink: 0; }
        .sk-stat-val {
          font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800;
          line-height: 1; letter-spacing: -0.02em;
        }
        .sk-stat-lbl { font-size: 10.5px; color: ${C.sub}; font-weight: 600; margin-top: 2px; }

        .sk-add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; border: none; border-radius: 13px; cursor: pointer;
          background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary});
          color: white; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(91,140,90,0.3);
          transition: all 0.2s; flex-shrink: 0; align-self: flex-start;
        }
        .sk-add-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(91,140,90,0.38); }

        /* ── Alert banner ── */
        .sk-alert-banner {
          display: flex; align-items: center; gap: 12px;
          background: ${C.orangeLight}; border-radius: 16px; padding: 14px 18px;
          border: 1.5px solid ${C.orangeBorder};
          color: ${C.orange}; flex-wrap: wrap;
          animation: sk-slide-in 0.2s ease;
        }
        .sk-alert-icon { display: flex; flex-shrink: 0; }
        .sk-alert-text { flex: 1; font-size: 13.5px; font-weight: 500; min-width: 180px; }
        .sk-alert-text strong { font-weight: 800; }
        .sk-alert-btn {
          padding: 7px 14px; border-radius: 9px;
          border: 1.5px solid ${C.orangeBorder};
          background: white; color: ${C.orange};
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; white-space: nowrap;
        }
        .sk-alert-btn:hover { background: ${C.orange}; color: white; }
        .sk-alert-btn--active { background: ${C.orange}; color: white; }

        /* ── Filter card ── */
        .sk-filter-card {
          background: white; border-radius: 18px; padding: 14px 18px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 10px;
        }
        .sk-search-wrap { position: relative; }
        .sk-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; pointer-events: none; transition: color 0.2s;
        }
        .sk-search {
          width: 100%; padding: 10px 36px 10px 38px;
          border: 1.5px solid #e8e4dc; border-radius: 11px;
          font-size: 13px; color: ${C.text}; background: #faf9f6;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sk-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.sub}; display: flex; padding: 3px; border-radius: 50%;
          transition: color 0.15s;
        }
        .sk-search-clear:hover { color: ${C.red}; }
        .sk-filter-pills { display: flex; gap: 7px; flex-wrap: wrap; }
        .sk-filter-pill {
          padding: 6px 14px; border-radius: 100px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; white-space: nowrap;
          background: #f5f2ed; color: ${C.sub};
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
        }
        .sk-filter-pill:hover { background: #ece8e0; color: ${C.text}; }
        .sk-filter-pill--active { background: ${C.primary}; color: white; box-shadow: 0 3px 8px rgba(91,140,90,0.25); }
        .sk-filter-result { font-size: 12px; color: ${C.sub}; font-weight: 500; }
        .sk-filter-result strong { color: ${C.text}; }

        /* ── Table (desktop) ── */
        .sk-table-wrap {
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 16px rgba(0,0,0,0.055);
        }
        .sk-table-header {
          display: grid; grid-template-columns: 2fr 1.4fr 1.6fr 1.2fr 88px;
          padding: 11px 20px;
          background: #f9f8f5; border-bottom: 1px solid #f0ede8;
          font-size: 10.5px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .sk-table-body {}
        .sk-row {
          display: grid; grid-template-columns: 2fr 1.4fr 1.6fr 1.2fr 88px;
          padding: 13px 20px; align-items: center;
          border-bottom: 1px solid #f5f2ed;
          transition: background 0.12s;
        }
        .sk-row:hover { background: #faf9f6; }
        .sk-row--low { background: #fffaf7; }
        .sk-row--low:hover { background: #fff5f0; }
        .sk-row--last { border-bottom: none; }

        .sk-row-name { display: flex; align-items: center; gap: 10px; }
        .sk-row-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #d0c8be; flex-shrink: 0;
          animation: sk-pulse 2s ease-in-out infinite;
        }
        .sk-row-dot--low  { background: ${C.orange}; }
        .sk-row-dot--warn { background: ${C.accent}; }
        .sk-row-label { font-size: 13.5px; font-weight: 600; color: ${C.text}; }
        .sk-low-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; color: ${C.orange};
          background: ${C.orangeLight}; border-radius: 20px; padding: 2px 8px;
          margin-left: 7px; border: 1px solid ${C.orangeBorder};
        }
        .sk-low-badge--sm { margin-left: 4px; padding: 2px 6px; }

        .sk-row-stock { display: flex; flex-direction: column; gap: 5px; }
        .sk-row-stock-val { font-size: 14px; font-weight: 700; }
        .sk-stock-bar-track {
          height: 4px; background: #f0ede8; border-radius: 100px; overflow: hidden; width: 80px;
        }
        .sk-stock-bar-fill { height: 100%; border-radius: 100px; transition: width 0.5s ease; }

        .sk-row-cost { display: flex; flex-direction: column; gap: 2px; }
        .sk-row-cost-main { font-size: 13px; font-weight: 600; color: ${C.text}; }
        .sk-row-cost-sub  { font-size: 11px; color: ${C.sub}; }
        .sk-row-low { font-size: 13px; color: ${C.sub}; font-weight: 500; }
        .sk-row-actions { display: flex; justify-content: center; gap: 6px; }
        .sk-btn-edit {
          padding: 7px; border: 1.5px solid rgba(0,0,0,0.08); border-radius: 9px;
          background: white; cursor: pointer; color: ${C.primary};
          display: flex; align-items: center; transition: all 0.15s;
        }
        .sk-btn-edit:hover { background: ${C.primaryLight}; border-color: rgba(91,140,90,0.3); }
        .sk-btn-delete {
          padding: 7px; border: none; border-radius: 9px;
          background: ${C.redLight}; cursor: pointer; color: ${C.red};
          display: flex; align-items: center; transition: background 0.15s;
        }
        .sk-btn-delete:hover { background: #fddad4; }

        /* ── Mobile cards ── */
        .sk-cards { display: none; flex-direction: column; gap: 10px; }
        .sk-card {
          background: white; border-radius: 16px; padding: 14px 16px;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .sk-card--low { border-color: rgba(232,98,42,0.2); background: #fffaf7; }
        .sk-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .sk-card-name-row { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .sk-card-name { font-size: 14px; font-weight: 700; color: ${C.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sk-card-actions-top { display: flex; gap: 6px; flex-shrink: 0; }
        .sk-card-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
        .sk-card-stat { display: flex; flex-direction: column; gap: 3px; }
        .sk-card-stat-lbl { font-size: 10px; font-weight: 700; color: ${C.sub}; text-transform: uppercase; letter-spacing: 0.06em; }
        .sk-card-stat-val { font-size: 13px; font-weight: 700; color: ${C.text}; }

        /* ── Empty ── */
        .sk-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 24px; gap: 8px; text-align: center;
          background: white; border-radius: 20px; border: 1px dashed #d8d4cc;
        }
        .sk-empty-title { font-size: 15px; font-weight: 700; color: ${C.text}; }
        .sk-empty-sub { font-size: 13px; color: ${C.sub}; }

        /* ── Modal ── */
        .sk-modal-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .sk-modal {
          background: white; border-radius: 24px;
          width: 100%; max-width: 520px; max-height: 92vh;
          display: flex; flex-direction: column;
          box-shadow: 0 28px 72px rgba(0,0,0,0.25);
          overflow: hidden; position: relative;
          animation: sk-card-in 0.28s cubic-bezier(0.23,1,0.32,1);
        }
        .sk-modal-saving {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); gap: 8px;
        }
        .sk-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px 16px; border-bottom: 1px solid #f0ede8;
          background: #faf9f6; flex-shrink: 0;
        }
        .sk-modal-header-left { display: flex; align-items: center; gap: 12px; }
        .sk-modal-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: ${C.primaryLight}; color: ${C.primary};
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sk-modal-title { font-size: 16px; font-weight: 800; color: ${C.text}; line-height: 1; }
        .sk-modal-sub { font-size: 12px; color: ${C.sub}; margin-top: 3px; }
        .sk-modal-close {
          width: 32px; height: 32px; border-radius: 9px; border: none;
          background: #ede9e3; color: ${C.sub}; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .sk-modal-close:hover { background: #e0dbd4; color: ${C.text}; }
        .sk-modal-body { overflow-y: auto; padding: 20px 22px; flex: 1; }
        .sk-modal-footer {
          display: flex; gap: 10px; padding: 16px 22px;
          border-top: 1px solid #f0ede8; flex-shrink: 0;
        }

        /* ── Form ── */
        .sk-form { display: flex; flex-direction: column; gap: 18px; }
        .sk-field { display: flex; flex-direction: column; gap: 7px; }
        .sk-label {
          font-size: 11px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .sk-label-opt { font-weight: 500; text-transform: none; letter-spacing: 0; color: #b0a898; }
        .sk-input {
          padding: 10px 12px; border-radius: 10px;
          border: 1.5px solid #e8e4dc; font-size: 13.5px; color: ${C.text};
          background: #faf9f6; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sk-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(91,140,90,0.1); }
        .sk-input--flex { flex: 1; }
        .sk-input--sm { padding: 9px 10px; font-size: 13px; }
        .sk-input-row { display: flex; gap: 8px; }
        .sk-select {
          padding: 10px 10px; border-radius: 10px;
          border: 1.5px solid #e8e4dc; font-size: 13.5px; color: ${C.text};
          background: white; font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: border-color 0.2s;
        }
        .sk-select:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(91,140,90,0.1); }
        .sk-select--sm { padding: 9px 8px; font-size: 13px; }
        .sk-field-hint { font-size: 11px; color: ${C.sub}; font-weight: 500; }

        .sk-cost-box {
          background: #f9f8f5; border-radius: 14px; padding: 14px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .sk-cost-formula { font-size: 12px; color: ${C.sub}; margin-bottom: 10px; }
        .sk-cost-inputs { display: flex; gap: 8px; }
        .sk-cost-col { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .sk-cost-col--narrow { flex: 0 0 80px; }
        .sk-cost-col-lbl { font-size: 10.5px; font-weight: 700; color: ${C.sub}; }

        /* Cost preview */
        .sk-cost-preview {
          background: ${C.primaryLight}; border-radius: 11px; padding: 12px 14px;
          margin-top: 12px; border: 1px solid rgba(91,140,90,0.15);
        }
        .sk-cost-preview-header {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 800; color: ${C.primaryDark}; margin-bottom: 8px;
        }
        .sk-cost-rows { display: flex; flex-direction: column; gap: 5px; }
        .sk-cost-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: ${C.primaryDark};
        }
        .sk-cost-row--highlight {
          background: white; border-radius: 8px; padding: 6px 10px;
          font-weight: 600; margin-top: 3px;
        }
        .sk-cost-row--highlight strong { color: ${C.primary}; }

        /* Modal buttons */
        .sk-btn-cancel {
          flex: 1; padding: 12px; border-radius: 12px;
          border: 1.5px solid #e8e4dc; background: white;
          color: ${C.sub}; font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s;
        }
        .sk-btn-cancel:hover { background: #f5f2ed; }
        .sk-btn-save {
          flex: 2; padding: 12px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, ${C.primaryDark}, ${C.primary});
          color: white; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(91,140,90,0.3);
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: all 0.2s;
        }
        .sk-btn-save:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 7px 20px rgba(91,140,90,0.38); }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 1024px) {
          .sk-hero { flex-direction: column; gap: 14px; }
          .sk-add-btn { align-self: flex-start; }
          .sk-title { font-size: 22px; }
          .sk-table-header { grid-template-columns: 2fr 1.2fr 1.4fr 1fr 80px; }
          .sk-row { grid-template-columns: 2fr 1.2fr 1.4fr 1fr 80px; }
        }
        @media (max-width: 767px) {
          .sk-root { gap: 12px; }
          .sk-hero { padding: 16px 18px; border-radius: 18px; }
          .sk-title { font-size: 20px; }
          .sk-table-wrap { display: none; }
          .sk-cards { display: flex; }
          .sk-filter-card { padding: 12px 14px; border-radius: 16px; }
          .sk-cost-inputs { flex-wrap: wrap; }
          .sk-cost-col--narrow { flex: 1; }
        }
        @media (max-width: 479px) {
          .sk-hero { padding: 14px 16px; border-radius: 16px; }
          .sk-title { font-size: 18px; }
          .sk-hero-stats { flex-wrap: wrap; gap: 8px; }
          .sk-modal { border-radius: 20px 20px 0 0; max-height: 94vh; }
          .sk-modal-overlay { align-items: flex-end; }
          .sk-card-body { grid-template-columns: 1fr 1fr; }
          .sk-overlay-card { padding: 28px 32px; }
        }
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .sk-hero { flex-direction: row; }
          .sk-table-wrap { display: block; }
          .sk-cards { display: none; }
          .sk-table-header { grid-template-columns: 2fr 1.2fr 1.4fr 1fr 80px; }
          .sk-row { grid-template-columns: 2fr 1.2fr 1.4fr 1fr 80px; }
        }
      `}</style>
    </div>
  );
};