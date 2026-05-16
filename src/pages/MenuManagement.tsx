import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import { menuApi } from '../api/menu';
import { ingredientApi, variationIngredientApi } from '../api/ingredient';
import { Menu, Category, Ingredient, MenuIngredient, VariationIngredient, MenuVariation } from '../types';
import { Modal } from '../components/common/Modal';
import { QRModal } from '../components/menu/QRModal.tsx';
import { MenuForm } from '../components/menu/MenuForm';
import { MenuCard } from '../components/menu/MenuCard';
import { CategoryList } from '../components/menu/CategoryList';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

// ── Unit helpers — UNTOUCHED ──────────────────────────────────────────────────
const UNIT_TO_BASE: Record<string, number> = {
  mg: 0.001, g: 1, kg: 1000,
  ml: 1, liter: 1000,
  pcs: 1, buah: 1, lembar: 1, sachet: 1, botol: 1, bungkus: 1,
};
const ALL_UNITS = Object.keys(UNIT_TO_BASE);
function unitGroup(u: string): string {
  if (['mg','g','kg'].includes(u)) return 'weight';
  if (['ml','liter'].includes(u)) return 'volume';
  return 'piece';
}
function toBaseAmount(value: number, unit: string): number {
  return value * (UNIT_TO_BASE[unit] ?? 1);
}
function fromBaseAmount(value: number, unit: string): number {
  return value / (UNIT_TO_BASE[unit] ?? 1);
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const QrIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <line x1="14" y1="14" x2="14" y2="14.01"/><line x1="18" y1="14" x2="18" y2="14.01"/>
    <line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="18" x2="18" y2="18"/><line x1="21" y1="18" x2="21" y2="18.01"/>
  </svg>
);
const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#1e1a14', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
  orange: '#e8622a', orangeLight: '#fff3ee',
  bg: '#f4f0e8',
  accent: '#E8A23A',
};

// ── Lottie Loading Screen ─────────────────────────────────────────────────────
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Memuat menu...' }) => (
  <div className="mm-loading-screen">
    <div className="mm-loading-inner">
      <Lottie
        animationData={lottieTree}
        loop
        autoplay
        style={{ width: 200, height: 200 }}
      />
      <p className="mm-loading-text">{message}</p>
      <div className="mm-loading-dots">
        <span /><span /><span />
      </div>
    </div>
  </div>
);

// ── Ingredient Modal ──────────────────────────────────────────────────────────
const IngredientModal: React.FC<{
  menu: Menu;
  allIngredients: Ingredient[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ menu, allIngredients, onClose, onSaved }) => {
  const [baseItems, setBaseItems] = useState<{ ingredient_id: number; amount: string; inputUnit: string }[]>([]);
  const [varItems, setVarItems] = useState<Record<number, { ingredient_id: number; amount: string; inputUnit: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedVar, setExpandedVar] = useState<number | null>(null);

  const variations: MenuVariation[] = menu.variations ?? [];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const baseData = await ingredientApi.getMenuIngredients(menu.id);
        setBaseItems(baseData.map((mi: MenuIngredient) => {
          const ing = allIngredients.find(a => a.id === mi.ingredient_id);
          const ingUnit = ing?.unit ?? 'g';
          const display = fromBaseAmount(mi.amount, ingUnit);
          return {
            ingredient_id: mi.ingredient_id,
            inputUnit: ingUnit,
            amount: String(display % 1 === 0 ? display : display.toFixed(3)),
          };
        }));
        const varData: Record<number, { ingredient_id: number; amount: string; inputUnit: string }[]> = {};
        await Promise.all(variations.map(async (v) => {
          try {
            const data = await variationIngredientApi.get(v.id);
            varData[v.id] = data.map((vi: VariationIngredient) => {
              const ing = allIngredients.find(a => a.id === vi.ingredient_id);
              const ingUnit = ing?.unit ?? 'g';
              const display = fromBaseAmount(vi.amount, ingUnit);
              return {
                ingredient_id: vi.ingredient_id,
                inputUnit: ingUnit,
                amount: String(display % 1 === 0 ? display : display.toFixed(3)),
              };
            });
          } catch { varData[v.id] = []; }
        }));
        setVarItems(varData);
      } catch { toast.error('Gagal memuat bahan baku'); }
      finally { setLoading(false); }
    };
    loadAll();
  }, [menu.id]);

  const addRow = (target: 'base' | number) => {
    if (allIngredients.length === 0) { toast.error('Tambah bahan baku di halaman Stok dulu'); return; }
    const newRow = { ingredient_id: allIngredients[0].id, amount: '', inputUnit: allIngredients[0].unit };
    if (target === 'base') {
      setBaseItems(prev => [...prev, newRow]);
    } else {
      setVarItems(prev => ({ ...prev, [target]: [...(prev[target] ?? []), newRow] }));
    }
  };

  const removeRow = (target: 'base' | number, idx: number) => {
    if (target === 'base') {
      setBaseItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setVarItems(prev => ({ ...prev, [target]: (prev[target] ?? []).filter((_, i) => i !== idx) }));
    }
  };

  const updateRow = (target: 'base' | number, idx: number, field: 'ingredient_id' | 'amount' | 'inputUnit', value: string) => {
    const update = (rows: { ingredient_id: number; amount: string; inputUnit: string }[]) =>
      rows.map((item, i) => {
        if (i !== idx) return item;
        if (field === 'ingredient_id') {
          const newIng = allIngredients.find(a => a.id === Number(value));
          return { ...item, ingredient_id: Number(value), inputUnit: newIng?.unit ?? item.inputUnit };
        }
        return { ...item, [field]: value };
      });
    if (target === 'base') {
      setBaseItems(update);
    } else {
      setVarItems(prev => ({ ...prev, [target]: update(prev[target] ?? []) }));
    }
  };

  const toPayload = (rows: { ingredient_id: number; amount: string; inputUnit: string }[]) =>
    rows
      .filter(i => i.amount && parseFloat(i.amount) > 0)
      .map(i => ({ ingredient_id: i.ingredient_id, amount: toBaseAmount(parseFloat(i.amount), i.inputUnit) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await ingredientApi.setMenuIngredients(menu.id, toPayload(baseItems));
      await Promise.all(variations.map(v =>
        variationIngredientApi.set(v.id, toPayload(varItems[v.id] ?? []))
      ));
      toast.success('Bahan baku disimpan');
      onSaved();
      onClose();
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const renderRows = (target: 'base' | number, rows: { ingredient_id: number; amount: string; inputUnit: string }[]) => (
    <div className="ing-rows">
      {rows.map((item, idx) => {
        const ing = allIngredients.find(i => i.id === item.ingredient_id);
        return (
          <div key={idx} className="ing-row">
            <select
              value={item.ingredient_id}
              onChange={e => updateRow(target, idx, 'ingredient_id', e.target.value)}
              className="ing-select"
            >
              {allIngredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input
              type="number" value={item.amount} min="0"
              onChange={e => updateRow(target, idx, 'amount', e.target.value)}
              placeholder="0" className="ing-amount"
            />
            <select
              value={item.inputUnit}
              onChange={e => updateRow(target, idx, 'inputUnit', e.target.value)}
              className="ing-unit"
            >
              {ALL_UNITS.filter(u => unitGroup(u) === unitGroup(ing?.unit ?? 'g')).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <button onClick={() => removeRow(target, idx)} className="ing-remove">
              <XIcon />
            </button>
          </div>
        );
      })}
      <button onClick={() => addRow(target)} className="ing-add-btn">
        <PlusIcon /> Tambah Bahan
      </button>
    </div>
  );

  return (
    <div className="ing-overlay">
      <div className="ing-modal">
        {/* Header */}
        <div className="ing-modal-header">
          <div className="ing-modal-header-left">
            <div className="ing-modal-icon">
              <LeafIcon />
            </div>
            <div>
              <h3 className="ing-modal-title">Bahan Baku</h3>
              <p className="ing-modal-sub">{menu.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="ing-modal-close"><XIcon /></button>
        </div>

        <div className="ing-modal-body">
          {loading ? (
            <div className="ing-loading">
              <Lottie animationData={lottieTree} loop autoplay style={{ width: 120, height: 120 }} />
              <p>Memuat bahan baku...</p>
            </div>
          ) : allIngredients.length === 0 ? (
            <div className="ing-empty">
              <LeafIcon />
              <p className="ing-empty-title">Belum ada bahan baku</p>
              <p className="ing-empty-sub">Tambahkan di halaman <strong>Stok Bahan</strong> dulu</p>
            </div>
          ) : (
            <>
              {/* Base ingredients */}
              <div className="ing-section">
                <div className="ing-section-header">
                  <span className="ing-section-dot" style={{ background: C.primary }} />
                  <p className="ing-section-title">Bahan Dasar <span className="ing-section-note">(berlaku semua variasi)</span></p>
                </div>
                {renderRows('base', baseItems)}
              </div>

              {/* Variation ingredients */}
              {variations.length > 0 && (
                <div className="ing-section">
                  <p className="ing-var-label">Bahan Tambahan per Variasi <span className="ing-section-note">(opsional)</span></p>
                  {variations.map(v => {
                    const isOpen = expandedVar === v.id;
                    const vRows = varItems[v.id] ?? [];
                    return (
                      <div key={v.id} className={`ing-var-item ${isOpen ? 'ing-var-item--open' : ''}`}>
                        <button
                          onClick={() => setExpandedVar(isOpen ? null : v.id)}
                          className="ing-var-toggle"
                        >
                          <div className="ing-var-toggle-left">
                            <span className="ing-var-name">{v.name}: {v.option}</span>
                            {vRows.length > 0 && (
                              <span className="ing-var-count">{vRows.length} bahan</span>
                            )}
                          </div>
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {isOpen && (
                          <div className="ing-var-body">
                            <p className="ing-var-note">Ditambahkan ke bahan dasar saat variasi ini dipilih</p>
                            {renderRows(v.id, vRows)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="ing-modal-footer">
          <button onClick={onClose} className="ing-btn-cancel">Batal</button>
          <button onClick={handleSave} disabled={saving} className="ing-btn-save">
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Badge ────────────────────────────────────────────────────────────────
const StatBadge: React.FC<{ value: number | string; label: string; color: string; bg: string; icon: React.ReactNode }> = ({ value, label, color, bg, icon }) => (
  <div className="mm-stat-badge" style={{ '--badge-color': color, '--badge-bg': bg } as React.CSSProperties}>
    <div className="mm-stat-icon" style={{ background: bg, color }}>{icon}</div>
    <div>
      <p className="mm-stat-value" style={{ color }}>{value}</p>
      <p className="mm-stat-label">{label}</p>
    </div>
  </div>
);

// ── Main MenuManagement ───────────────────────────────────────────────────────
export const MenuManagement: React.FC = () => {
  const { isAdmin, enhancedMode } = useAuth();
  const location = useLocation();
  const isOnboarding = new URLSearchParams(location.search).get('onboarding') === 'enhanced';

  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [ingredientMenu, setIngredientMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Fetch logic — UNTOUCHED ──────────────────────────────────────────────────
  useEffect(() => { loadData(); }, [selectedCategory, searchTerm]);

  useEffect(() => {
    if (enhancedMode) {
      ingredientApi.getAll().then(setAllIngredients).catch(() => {});
    }
  }, [enhancedMode]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [menusData, categoriesData] = await Promise.all([
        menuApi.getMenus(selectedCategory || undefined, searchTerm),
        menuApi.getCategories(),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
    } catch {
      toast.error('Gagal memuat data menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenu = () => { setSelectedMenu(null); setIsModalOpen(true); };
  const handleEditMenu = (menu: Menu) => { setSelectedMenu(menu); setIsModalOpen(true); };

  const handleDeleteMenu = async (id: number) => {
    if (!window.confirm('Hapus menu ini?')) return;
    try {
      await menuApi.deleteMenu(id);
      setMenus(prev => prev.filter(m => m.id !== id));
      toast.success('Menu berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus menu');
    }
  };

  const handleSaveMenu = async (formData: FormData) => {
    try {
      if (selectedMenu) {
        if (!formData.has('is_available')) formData.append('is_available', selectedMenu.is_available ? 'true' : 'false');
        await menuApi.updateMenuForm(selectedMenu.id, formData);
        toast.success('Menu berhasil diupdate');
      } else {
        await menuApi.createMenu(formData);
        toast.success('Menu berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error(selectedMenu ? 'Gagal mengupdate menu' : 'Gagal menambah menu');
    }
  };

  const handleToggleAvailability = async (menu: Menu) => {
    const newStatus = !menu.is_available;
    setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, is_available: newStatus } : m));
    try {
      await menuApi.setAvailability(menu.id, newStatus);
      toast.success(`Menu ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch {
      setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, is_available: menu.is_available } : m));
      toast.error('Gagal mengubah status menu');
    }
  };

  const showOnboardingBanner = isOnboarding && enhancedMode && !dismissedOnboarding;
  const availableCount = menus.filter(m => m.is_available).length;
  const unavailableCount = menus.length - availableCount;

  return (
    <div className="mm-root">

      {/* ── ONBOARDING BANNER ── */}
      {showOnboardingBanner && (
        <div className="mm-onboarding-banner">
          <div className="mm-onboarding-left">
            <div className="mm-onboarding-zap"><ZapIcon /></div>
            <div>
              <p className="mm-onboarding-title">Enhanced Mode aktif — Lengkapi bahan baku tiap menu</p>
              <p className="mm-onboarding-sub">
                Klik tombol <strong>Bahan Baku</strong> di setiap menu card untuk mengisi bahan yang dibutuhkan per porsi
              </p>
            </div>
          </div>
          <button onClick={() => setDismissedOnboarding(true)} className="mm-onboarding-dismiss">
            Mengerti ✓
          </button>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <div className="mm-hero">
        <div className="mm-hero-bg" />
        <div className="mm-hero-content">
          <div className="mm-hero-text">
            <div className="mm-hero-eyebrow">
              <TagIcon />
              <span>Menu Restoran</span>
            </div>
            <h1 className="mm-hero-title">Manajemen Menu</h1>
            <p className="mm-hero-sub">Kelola, atur, dan pantau semua menu dengan mudah</p>
          </div>

          {/* Stats row */}
          <div className="mm-hero-stats">
            <StatBadge value={menus.length} label="Total Menu" color="#5B8C5A" bg="#EBF4EB" icon={<GridIcon />} />
            <StatBadge value={categories.length} label="Kategori" color="#4AA8D8" bg="#E8F5FB" icon={<TagIcon />} />
            <StatBadge value={availableCount} label="Tersedia" color="#5B8C5A" bg="#EBF4EB" icon={<StarIcon />} />
            {unavailableCount > 0 && (
              <StatBadge value={unavailableCount} label="Nonaktif" color="#E8604A" bg="#FDECEA" icon={<XIcon />} />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mm-hero-actions">
          <button onClick={() => setShowQR(true)} className="mm-btn mm-btn-outline">
            <QrIcon />
            <span>QR Menu</span>
          </button>
          {isAdmin && (
            <button onClick={handleAddMenu} className="mm-btn mm-btn-primary">
              <PlusIcon />
              <span>Tambah Menu</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY MANAGEMENT ── */}
      {isAdmin && (
        <div className="mm-section-card mm-categories-card">
          <div className="mm-section-header">
            <div className="mm-section-title-group">
              <div className="mm-section-icon" style={{ background: '#E8F5FB', color: '#4AA8D8' }}>
                <TagIcon />
              </div>
              <div>
                <h2 className="mm-section-title">Kategori</h2>
                <p className="mm-section-sub">Kelola pengelompokan menu</p>
              </div>
            </div>
          </div>
          <CategoryList categories={categories} onCategoryChange={loadData} />
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="mm-filter-card">
        <div className="mm-filter-row">
          <div className="mm-search-wrap">
            <span className="mm-search-icon" style={{ color: searchFocused ? C.primary : '#b0a898' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Cari menu berdasarkan nama..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="mm-search-input"
              style={{
                borderColor: searchFocused ? C.primary : '#e8e4dc',
                boxShadow: searchFocused ? '0 0 0 3px rgba(91,140,90,0.12)' : 'none',
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mm-search-clear">
                <XIcon />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="mm-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`mm-view-btn ${viewMode === 'grid' ? 'mm-view-btn--active' : ''}`}
              title="Grid view"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`mm-view-btn ${viewMode === 'list' ? 'mm-view-btn--active' : ''}`}
              title="List view"
            >
              <ListIcon />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="mm-cat-pills">
          {[{ id: null, name: 'Semua' }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setSelectedCategory(cat.id as number | null)}
                className={`mm-cat-pill ${active ? 'mm-cat-pill--active' : ''}`}
              >
                {cat.name}
                {active && menus.length > 0 && (
                  <span className="mm-cat-pill-count">{menus.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result summary */}
        {!isLoading && (
          <p className="mm-result-summary">
            {searchTerm
              ? `Ditemukan ${menus.length} menu untuk "${searchTerm}"`
              : `Menampilkan ${menus.length} menu${selectedCategory ? ' dalam kategori ini' : ''}`}
          </p>
        )}
      </div>

      {/* ── MENU GRID ── */}
      {isLoading ? (
        <LoadingScreen />
      ) : menus.length === 0 ? (
        <div className="mm-empty">
          <Lottie animationData={lottieTree} loop autoplay style={{ width: 160, height: 160, opacity: 0.7 }} />
          <p className="mm-empty-title">Belum ada menu</p>
          <p className="mm-empty-sub">
            {searchTerm ? `Tidak ada menu dengan kata kunci "${searchTerm}"` : 'Mulai dengan menambahkan menu pertamamu'}
          </p>
          {isAdmin && !searchTerm && (
            <button onClick={handleAddMenu} className="mm-btn mm-btn-primary" style={{ marginTop: '8px' }}>
              <PlusIcon /> Tambah Menu Pertama
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'mm-grid' : 'mm-list'}>
          {menus.map((menu, i) => (
            <div
              key={menu.id}
              className="mm-grid-item"
              style={{ animationDelay: `${i * 0.035}s` }}
            >
              <MenuCard
                menu={menu}
                onEdit={isAdmin ? () => handleEditMenu(menu) : undefined}
                onDelete={isAdmin ? () => handleDeleteMenu(menu.id) : undefined}
                onToggleAvailability={isAdmin ? () => handleToggleAvailability(menu) : undefined}
                onSetIngredients={enhancedMode && isAdmin ? () => setIngredientMenu(menu) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMenu ? 'Edit Menu' : 'Tambah Menu Baru'} size="lg">
        <MenuForm menu={selectedMenu} categories={categories} onSave={handleSaveMenu} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {ingredientMenu && (
        <IngredientModal
          menu={ingredientMenu}
          allIngredients={allIngredients}
          onClose={() => setIngredientMenu(null)}
          onSaved={() => {}}
        />
      )}

      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink   { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }

        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }

        /* ── ROOT ── */
        .mm-root {
          display: flex; flex-direction: column; gap: 18px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          min-height: 100%;
          animation: fadeUp 0.35s ease;
        }

        /* ── LOTTIE LOADING ── */
        .mm-loading-screen {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 24px;
        }
        .mm-loading-inner {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .mm-loading-text {
          font-size: 14px; font-weight: 600; color: ${C.sub};
        }
        .mm-loading-dots {
          display: flex; gap: 5px; margin-top: 4px;
        }
        .mm-loading-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: blink 1.4s ease-in-out infinite;
        }
        .mm-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .mm-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── ONBOARDING BANNER ── */
        .mm-onboarding-banner {
          background: linear-gradient(135deg, #2d3d26 0%, #3d5438 45%, #5B8C5A 100%);
          border-radius: 18px; padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          box-shadow: 0 8px 32px rgba(45,61,38,0.3);
          flex-wrap: wrap;
        }
        .mm-onboarding-left { display: flex; align-items: center; gap: 14px; flex: 1; }
        .mm-onboarding-zap {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.15); color: #ffd166;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mm-onboarding-title { font-size: 14px; font-weight: 800; color: white; margin-bottom: 3px; }
        .mm-onboarding-sub { font-size: 12px; color: rgba(255,255,255,0.7); }
        .mm-onboarding-dismiss {
          background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9px; padding: 8px 16px; color: white;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .mm-onboarding-dismiss:hover { background: rgba(255,255,255,0.28); }

        /* ── HERO ── */
        .mm-hero {
          background: white;
          border-radius: 22px;
          padding: 24px 26px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 20px rgba(0,0,0,0.055);
          display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
          position: relative; overflow: hidden;
          flex-wrap: wrap;
        }
        .mm-hero-bg {
          position: absolute; top: 0; right: 0; bottom: 0; width: 45%;
          background: linear-gradient(135deg, transparent, rgba(91,140,90,0.04) 50%, rgba(91,140,90,0.08));
          pointer-events: none;
        }
        .mm-hero-bg::after {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px; border-radius: 50%;
          border: 40px solid rgba(91,140,90,0.06);
        }
        .mm-hero-content { flex: 1; min-width: 0; position: relative; }
        .mm-hero-eyebrow {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: ${C.primary};
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
        }
        .mm-hero-title {
          font-family: 'Sora', sans-serif;
          font-size: 26px; font-weight: 800; color: #1a1612;
          letter-spacing: -0.04em; line-height: 1; margin-bottom: 6px;
        }
        .mm-hero-sub { font-size: 13px; color: ${C.sub}; margin-bottom: 18px; }

        .mm-hero-stats {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .mm-stat-badge {
          display: flex; align-items: center; gap: 10px;
          background: var(--badge-bg);
          border-radius: 12px; padding: 10px 14px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .mm-stat-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mm-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 18px; font-weight: 800; line-height: 1;
        }
        .mm-stat-label {
          font-size: 10.5px; color: ${C.sub}; font-weight: 600; margin-top: 1px;
        }

        .mm-hero-actions {
          display: flex; gap: 10px; align-items: center; flex-shrink: 0;
          position: relative;
        }

        /* ── BUTTONS ── */
        .mm-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 12px; border: none;
          cursor: pointer; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .mm-btn-primary {
          background: linear-gradient(135deg, #4a7949, #5B8C5A);
          color: white;
          box-shadow: 0 4px 14px rgba(91,140,90,0.3);
        }
        .mm-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 20px rgba(91,140,90,0.38);
        }
        .mm-btn-outline {
          background: white; color: #217093;
          border: 1.5px solid rgba(33,112,147,0.35);
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        }
        .mm-btn-outline:hover { background: #f0f8fc; border-color: #217093; }

        /* ── SECTION CARD ── */
        .mm-section-card {
          background: white; border-radius: 20px; padding: 20px 22px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .mm-section-header { margin-bottom: 16px; }
        .mm-section-title-group { display: flex; align-items: center; gap: 10px; }
        .mm-section-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mm-section-title { font-size: 14.5px; font-weight: 700; color: #1e1a14; line-height: 1; }
        .mm-section-sub { font-size: 11.5px; color: ${C.sub}; margin-top: 2px; }

        /* ── FILTER CARD ── */
        .mm-filter-card {
          background: white; border-radius: 20px; padding: 18px 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 12px;
        }
        .mm-filter-row {
          display: flex; gap: 10px; align-items: center;
        }
        .mm-search-wrap { position: relative; flex: 1; }
        .mm-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; pointer-events: none;
          transition: color 0.2s;
        }
        .mm-search-input {
          width: 100%; padding: 10px 36px 10px 38px;
          border: 1.5px solid #e8e4dc; border-radius: 11px;
          font-size: 13px; color: ${C.text}; background: #faf9f6;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .mm-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.sub}; display: flex; padding: 3px;
          border-radius: 50%;
        }
        .mm-search-clear:hover { background: #f0ede8; }

        /* View toggle */
        .mm-view-toggle {
          display: flex; background: #f5f2ed; border-radius: 10px; padding: 3px; gap: 2px;
        }
        .mm-view-btn {
          width: 34px; height: 34px; border: none; border-radius: 8px;
          background: transparent; cursor: pointer; color: ${C.sub};
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .mm-view-btn:hover { background: rgba(0,0,0,0.06); }
        .mm-view-btn--active {
          background: white; color: ${C.primary};
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* Category pills */
        .mm-cat-pills {
          display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
        }
        .mm-cat-pills::-webkit-scrollbar { display: none; }
        .mm-cat-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 16px; border-radius: 100px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; white-space: nowrap;
          background: #f5f2ed; color: ${C.sub};
          transition: all 0.18s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .mm-cat-pill:hover { background: #ece8e0; color: ${C.text}; }
        .mm-cat-pill--active {
          background: ${C.primary}; color: white;
          box-shadow: 0 3px 10px rgba(91,140,90,0.28);
        }
        .mm-cat-pill-count {
          background: rgba(255,255,255,0.28); border-radius: 100px;
          padding: 1px 7px; font-size: 10.5px;
        }
        .mm-result-summary {
          font-size: 12px; color: ${C.sub}; font-weight: 500;
        }

        /* ── GRIDS ── */
        .mm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .mm-list {
          display: flex; flex-direction: column; gap: 10px;
        }
        .mm-grid-item {
          animation: fadeUp 0.3s ease both;
        }

        /* ── EMPTY STATE ── */
        .mm-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 24px; gap: 8px;
          background: white; border-radius: 20px;
          border: 1px dashed #d8d4cc;
          text-align: center;
        }
        .mm-empty-title { font-size: 16px; font-weight: 700; color: ${C.text}; }
        .mm-empty-sub { font-size: 13px; color: ${C.sub}; }

        /* ── INGREDIENT MODAL ── */
        .ing-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
          backdrop-filter: blur(6px);
        }
        .ing-modal {
          background: white; border-radius: 22px;
          width: 100%; max-width: 540px; max-height: 88vh;
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          overflow: hidden;
        }
        .ing-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px 16px;
          border-bottom: 1px solid #f0ede8;
          flex-shrink: 0;
        }
        .ing-modal-header-left { display: flex; align-items: center; gap: 12px; }
        .ing-modal-icon {
          width: 36px; height: 36px; border-radius: 11px;
          background: ${C.primaryLight}; color: ${C.primary};
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ing-modal-title {
          font-size: 16px; font-weight: 800; color: #1e1a14; line-height: 1;
        }
        .ing-modal-sub { font-size: 12px; color: ${C.sub}; margin-top: 3px; }
        .ing-modal-close {
          background: #f5f2ed; border: none; border-radius: 8px; width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: ${C.sub};
        }
        .ing-modal-close:hover { background: #ece8e0; }

        .ing-modal-body { flex: 1; overflow-y: auto; padding: 18px 22px; }
        .ing-modal-footer {
          display: flex; gap: 10px; padding: 16px 22px;
          border-top: 1px solid #f0ede8; flex-shrink: 0;
        }
        .ing-btn-cancel {
          flex: 1; padding: 12px; border: 1.5px solid #e8e4dc; border-radius: 11px;
          background: white; cursor: pointer; font-size: 13.5px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; color: ${C.text};
          transition: background 0.15s;
        }
        .ing-btn-cancel:hover { background: #f5f2ed; }
        .ing-btn-save {
          flex: 2; padding: 12px; border: none; border-radius: 11px;
          background: linear-gradient(135deg, #4a7949, #5B8C5A);
          color: white; cursor: pointer; font-size: 13.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(91,140,90,0.28);
          transition: all 0.2s;
        }
        .ing-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,140,90,0.35); }
        .ing-btn-save:disabled { opacity: 0.65; transform: none; }

        .ing-loading {
          display: flex; flex-direction: column; align-items: center;
          padding: 16px 0; gap: 8px; color: ${C.sub}; font-size: 13px;
        }
        .ing-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px; background: #f9f8f5; border-radius: 14px;
          gap: 6px; text-align: center; color: ${C.sub};
        }
        .ing-empty-title { font-size: 14px; font-weight: 700; color: ${C.text}; }
        .ing-empty-sub { font-size: 12.5px; }

        .ing-section { margin-bottom: 18px; }
        .ing-section-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
        }
        .ing-section-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
        .ing-section-title { font-size: 13px; font-weight: 700; color: ${C.text}; }
        .ing-section-note { font-size: 11px; color: ${C.sub}; font-weight: 500; }
        .ing-var-label {
          font-size: 11px; font-weight: 800; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;
        }

        .ing-rows { display: flex; flex-direction: column; gap: 6px; }
        .ing-row {
          display: grid;
          grid-template-columns: 1fr 90px 70px 32px;
          gap: 6px; align-items: center;
        }
        .ing-select, .ing-amount, .ing-unit {
          padding: 8px 10px; border-radius: 9px;
          border: 1.5px solid #e8e4dc; font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: white; color: ${C.text};
          transition: border-color 0.15s;
        }
        .ing-select:focus, .ing-amount:focus, .ing-unit:focus { border-color: ${C.primary}; }
        .ing-remove {
          width: 32px; height: 32px; border: 1px solid #fde8e4;
          border-radius: 8px; background: #fff0ee; cursor: pointer;
          color: #E8604A; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .ing-remove:hover { background: #fddad4; }
        .ing-add-btn {
          width: 100%; padding: 8px; border: 1.5px dashed #d0ccc6;
          border-radius: 10px; background: transparent; cursor: pointer;
          font-size: 12px; font-weight: 700; color: ${C.sub};
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: all 0.15s; margin-top: 4px;
        }
        .ing-add-btn:hover { border-color: ${C.primary}; color: ${C.primary}; background: ${C.primaryLight}; }

        .ing-var-item {
          margin-bottom: 7px; border: 1.5px solid #e8e4dc;
          border-radius: 13px; overflow: hidden; transition: border-color 0.2s;
        }
        .ing-var-item--open { border-color: ${C.primary}; }
        .ing-var-toggle {
          width: 100%; padding: 11px 14px; background: #f9f8f5; border: none;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s;
        }
        .ing-var-item--open .ing-var-toggle { background: ${C.primaryLight}; }
        .ing-var-toggle-left { display: flex; align-items: center; gap: 8px; }
        .ing-var-name { font-size: 13px; font-weight: 700; color: ${C.text}; }
        .ing-var-count {
          font-size: 10px; background: ${C.primary}; color: white;
          border-radius: 100px; padding: 2px 8px; font-weight: 700;
        }
        .ing-var-body { padding: 12px 14px; border-top: 1px solid #e8e4dc; }
        .ing-var-note { font-size: 11.5px; color: ${C.sub}; margin-bottom: 10px; }

        /* ═══════════════════════════
           RESPONSIVE
        ═══════════════════════════ */
        @media (max-width: 1024px) {
          .mm-hero { flex-direction: column; gap: 16px; }
          .mm-hero-actions { align-self: flex-start; }
          .mm-hero-title { font-size: 22px; }
          .mm-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
        }

        @media (max-width: 768px) {
          .mm-root { gap: 14px; }
          .mm-hero { padding: 18px 18px; border-radius: 18px; }
          .mm-hero-title { font-size: 20px; }
          .mm-hero-stats { gap: 8px; }
          .mm-stat-badge { padding: 8px 12px; gap: 8px; }
          .mm-stat-value { font-size: 16px; }
          .mm-filter-card, .mm-section-card { border-radius: 16px; padding: 14px 16px; }
          .mm-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
          .mm-btn { padding: 9px 14px; font-size: 12px; }
          .mm-hero-actions { flex-wrap: wrap; }
          .ing-row { grid-template-columns: 1fr 80px 60px 32px; }
        }

        @media (max-width: 480px) {
          .mm-hero { padding: 16px; border-radius: 16px; }
          .mm-hero-title { font-size: 18px; }
          .mm-hero-stats { flex-wrap: wrap; }
          .mm-stat-badge { flex: 1; min-width: 120px; }
          .mm-hero-actions { width: 100%; }
          .mm-btn { flex: 1; justify-content: center; }
          .mm-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .mm-filter-card { padding: 12px 14px; }
          .mm-filter-row { flex-wrap: wrap; }
          .mm-search-wrap { width: 100%; }
          .ing-modal { border-radius: 18px 18px 0 0; max-height: 92vh; }
          .ing-overlay { align-items: flex-end; }
          .ing-row { grid-template-columns: 1fr 72px 56px 30px; gap: 4px; }
        }

        /* Tablet landscape special */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .mm-hero { flex-direction: row; }
          .mm-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
};