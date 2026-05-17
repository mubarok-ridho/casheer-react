import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import lottieTree from '../assets/Loadingpohon.json';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { menuApi, promoApi } from '../api/menu';
import { orderApi } from '../api/order';
import { reportApi } from '../api/report';
import { Menu, Category, MenuVariation, Order as OrderType, ReceiptTemplate, Promo } from '../types';
import { Modal } from '../components/common/Modal';
import { Cart } from '../components/order/Cart';
import { PaymentModal } from '../components/order/PaymentModal';
import { ReceiptModal } from '../components/order/ReceiptModal';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

// ── SVG Icons (sama seperti sebelumnya, tidak diubah) ──
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TagIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const NotesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const GiftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const ForkKnifeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
  </svg>
);
const FireIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2c0 0-4 5-4 9 0 2.21 1.79 4 4 4s4-1.79 4-4C16 7 12 2 12 2zm0 13c-1.1 0-2-.9-2-2 0-1.5 1-3.5 2-5 1 1.5 2 3.5 2 5 0 1.1-.9 2-2 2z" />
  </svg>
);
const ChevronUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Design tokens ──
const C = {
  bg: '#f4f0e8',
  card: '#ffffff',
  primary: '#5B8C5A',
  primaryDark: '#3d5e3c',
  primaryLight: '#ebf4eb',
  accent: '#E8A23A',
  accentLight: '#fff8e8',
  blue: '#4AA8D8',
  blueLight: '#e8f5fb',
  red: '#E8604A',
  text: '#1e1a14',
  sub: '#8a8278',
  border: 'rgba(0,0,0,0.07)',
  orange: '#e8622a',
  orangeLight: '#fff3ee',
};

// ── Menu Card (tidak diubah) ──
const MenuCard: React.FC<{ menu: Menu; onClick: () => void }> = ({ menu, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="menu-card"
      data-hovered={hovered}
    >
      <div className="menu-card-img-wrap">
        {menu.images?.[0] ? (
          <img
            src={menu.images[0].image_url}
            alt={menu.name}
            className="menu-card-img"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
        ) : (
          <div className="menu-card-img-placeholder">🍽️</div>
        )}
        {menu.variations && menu.variations.length > 0 && (
          <div className="menu-card-variation-badge">
            <TagIcon />
            <span>{menu.variations.length} variasi</span>
          </div>
        )}
        <div className="menu-card-add-btn" style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(4px)',
        }}>
          <PlusIcon />
        </div>
        <div className="menu-card-gradient" />
      </div>
      <div className="menu-card-body">
        <p className="menu-card-name">{menu.name}</p>
        {menu.description && (
          <p className="menu-card-desc">{menu.description}</p>
        )}
        <p className="menu-card-price">{formatCurrency(menu.base_price)}</p>
      </div>
      <div className="menu-card-border" style={{ opacity: hovered ? 1 : 0 }} />
    </button>
  );
};

// ── Category pill (tidak diubah) ──
const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`cat-pill ${active ? 'cat-pill--active' : ''}`}>
    {label}
  </button>
);

// ── Promo Card (tidak diubah) ──
const PromoCard: React.FC<{ promo: Promo; onAdd: () => void }> = ({ promo, onAdd }) => {
  const [hovered, setHovered] = useState(false);
  const originalTotal = promo.items?.reduce((s, i) => {
    const base = (i.menu?.base_price ?? 0) * (i.quantity ?? 1);
    const varPrice = (i.variation?.price ?? 0) * (i.quantity ?? 1);
    return s + base + varPrice;
  }, 0) ?? 0;
  const hasDynamic = promo.items?.some(i => i.addon_mode === 'dynamic');
  const savingsPct = originalTotal > 0
    ? Math.round(((originalTotal - promo.promo_price) / originalTotal) * 100)
    : 0;
  const isUnavailable = !!promo.unavailable_reason;

  return (
    <button
      onClick={isUnavailable ? undefined : onAdd}
      disabled={isUnavailable}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="promo-card"
      data-hovered={hovered}
      style={{ cursor: isUnavailable ? 'not-allowed' : 'pointer', opacity: isUnavailable ? 0.82 : 1 }}
    >
      <div className="promo-card-header">
        {promo.image_url
          ? <img src={promo.image_url} alt={promo.name} className="promo-card-img" />
          : <div className="promo-card-emoji">🎁</div>
        }
        <div className="promo-card-overlay" />
        {isUnavailable && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: 'rgba(0,0,0,0.52)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '12px',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.78)', color: 'white',
              borderRadius: '10px', padding: '8px 14px',
              fontSize: '11px', fontWeight: '700',
              backdropFilter: 'blur(6px)',
              textAlign: 'center', lineHeight: 1.4,
            }}>
              🚫 {promo.unavailable_reason}
            </div>
          </div>
        )}
        {savingsPct > 0 && (
          <div className="promo-savings-badge">
            <SparkleIcon />
            <span>Hemat {savingsPct}%</span>
          </div>
        )}
        <div className="promo-card-add-btn" style={{
          opacity: isUnavailable ? 0 : hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.7)',
          pointerEvents: isUnavailable ? 'none' : 'auto',
        }}>
          <PlusIcon />
        </div>
      </div>
      <div className="promo-card-body">
        <p className="promo-card-name">{promo.name}</p>
        <div className="promo-card-items">
          {promo.items?.slice(0, 3).map((item, i) => (
            <p key={i} className="promo-card-item">· {item.quantity}× {item.menu?.name ?? `Menu #${item.menu_id}`}</p>
          ))}
          {(promo.items?.length ?? 0) > 3 && (
            <p className="promo-card-item">+{promo.items.length - 3} item lainnya</p>
          )}
        </div>
        <div className="promo-card-prices">
          <span className="promo-card-price">{formatCurrency(promo.promo_price)}{hasDynamic ? <span style={{fontSize:'10px',opacity:0.7}}>+</span> : ''}</span>
          {originalTotal > promo.promo_price && (
            <span className="promo-card-original">{formatCurrency(originalTotal)}</span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Promo Variation Modal (tidak diubah, hanya tambah style mobile) ──
const PromoVariationModal: React.FC<{
  promo: Promo;
  onConfirm: (selectedItems: any[]) => void;
  onClose: () => void;
}> = ({ promo, onConfirm, onClose }) => {
  const [selectedVariations, setSelectedVariations] = React.useState<Record<number, number | null>>(() => {
    const init: Record<number, number | null> = {};
    promo.items?.forEach(pi => {
      if (pi.addon_mode === 'dynamic') {
        init[pi.menu_id] = -1;
      } else if (pi.addon_mode === 'fixed' && pi.variation_id) {
        init[pi.menu_id] = pi.variation_id;
      } else {
        init[pi.menu_id] = null;
      }
    });
    return init;
  });

  const allSelected = Object.values(selectedVariations).every(v => v !== -1);
  const dynamicItems = promo.items?.filter(pi => pi.addon_mode === 'dynamic') ?? [];
  const hasAnyVariation = dynamicItems.length > 0;

  const handleConfirm = () => {
    if (!allSelected) {
      toast.error('Pilih variasi untuk semua menu yang memiliki variasi');
      return;
    }
    const selectedItems = promo.items?.map(pi => ({
      ...pi,
      variation_id: pi.addon_mode === 'fixed' 
        ? pi.variation_id
        : (selectedVariations[pi.menu_id] ?? undefined),
    })) ?? [];
    onConfirm(selectedItems);
  };

  React.useEffect(() => {
    if (!hasAnyVariation) {
      onConfirm(promo.items ?? []);
    }
  }, [hasAnyVariation]);

  if (!hasAnyVariation) return null;

  return (
    <div className="promo-var-overlay">
      <div className="promo-var-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '800', color: C.text }}>
              🎁 {promo.name}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>Pilih variasi untuk setiap menu</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, display: 'flex' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {dynamicItems.map((pi, idx) => {
            const variations = pi.menu?.variations ?? [];
            const hasVar = variations.length > 0;
            const selected = selectedVariations[pi.menu_id];

            const grouped = variations.reduce((acc, v) => {
              if (!acc[v.name]) acc[v.name] = [];
              acc[v.name].push(v);
              return acc;
            }, {} as Record<string, typeof variations>);

            return (
              <div key={idx} style={{
                background: '#f9f8f5', borderRadius: '12px', padding: '12px 14px',
                border: hasVar && selected === -1 ? '1.5px solid #fde8e4' : '1.5px solid #f0ece4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasVar ? '10px' : '0' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.text }}>
                      {pi.quantity}× {pi.menu?.name ?? `Menu #${pi.menu_id}`}
                    </p>
                    {!hasVar && (
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.primary }}>✓ Tidak ada variasi</p>
                    )}
                    {hasVar && selected === -1 && (
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.red }}>Pilih variasi</p>
                    )}
                    {hasVar && selected !== null && selected !== -1 && (
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.primary }}>
                        ✓ {variations.find(v => v.id === selected)?.name}: {variations.find(v => v.id === selected)?.option}
                      </p>
                    )}
                  </div>
                </div>

                {hasVar && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(grouped).map(([groupName, opts]) => (
                      <div key={groupName}>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{groupName}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {opts.map(v => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariations(prev => ({ ...prev, [pi.menu_id]: v.id }))}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                                background: selected === v.id ? C.primary : 'white',
                                color: selected === v.id ? 'white' : C.text,
                                border: `1.5px solid ${selected === v.id ? C.primary : '#e8e4dc'}`,
                                transition: 'all 0.15s',
                              }}
                            >
                              {v.option}
                              {v.price > 0 && <span style={{ opacity: 0.7, marginLeft: '4px', fontSize: '10px' }}>+{(v.price / 1000).toFixed(0)}k</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', border: '1.5px solid #e8e4dc', borderRadius: '10px',
            background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', color: C.sub,
          }}>Batal</button>
          <button
            onClick={handleConfirm}
            disabled={!allSelected}
            style={{
              flex: 2, padding: '12px', border: 'none', borderRadius: '10px',
              background: allSelected ? `linear-gradient(135deg, ${C.orange}, #f5a623)` : '#e8e4dc',
              color: allSelected ? 'white' : C.sub,
              cursor: allSelected ? 'pointer' : 'not-allowed',
              fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
              boxShadow: allSelected ? '0 4px 14px rgba(232,98,42,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Tambah ke Keranjang →
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Order Page ──
export const Order: React.FC = () => {
  const { tenant } = useAuth();
  const { items, clearCart, addToCart, addPromoToCart, subtotal } = useCart();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<MenuVariation | null>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [completedOrder, setCompletedOrder] = useState<OrderType | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [defaultTemplate, setDefaultTemplate] = useState<ReceiptTemplate | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const [promos, setPromos] = useState<Promo[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'promo'>('menu');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoVariationModal, setPromoVariationModal] = useState<Promo | null>(null);

  // ── NEW: Mobile state ──
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Processing overlay state ──
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('Memproses...');
  const [isAdding, setIsAdding] = useState(false);
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  // ── Detect mobile ──
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Fetch logic ──
  useEffect(() => { loadMenus(); }, [selectedCategory, searchTerm]);

  useEffect(() => {
    reportApi.getTemplates().then(res => {
      const templates = Array.isArray(res) ? res : res.data || [];
      const def = templates.find((t: ReceiptTemplate) => t.is_default) || templates[0] || null;
      setDefaultTemplate(def);
    }).catch(() => { });
  }, []);

  useEffect(() => { loadPromos(); }, []);

  const loadMenus = async () => {
    setIsLoading(true);
    try {
      const [menusData, categoriesData] = await Promise.all([
        menuApi.getMenus(selectedCategory || undefined, searchTerm),
        menuApi.getCategories(),
      ]);
      setMenus(menusData.filter((menu: Menu) => menu.is_available));
      setCategories(categoriesData);
    } catch {
      toast.error('Gagal memuat menu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPromos = async () => {
    setPromoLoading(true);
    try {
      const data = await promoApi.getActive();
      setPromos(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Gagal memuat promo');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleMenuClick = (menu: Menu) => {
    setSelectedMenu(menu); setSelectedVariation(null); setQty(1); setNotes('');
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;
    if (selectedMenu.variations?.length > 0 && !selectedVariation) {
      toast.error('Pilih variasi terlebih dahulu'); return;
    }
    setIsAdding(true);
    setTimeout(() => {
      addToCart(selectedMenu, qty, selectedVariation || undefined, notes);
      toast.success(`${selectedMenu.name} ditambahkan!`);
      setSelectedMenu(null);
      setIsAdding(false);
    }, 600);
  };

  const groupedVariations = (variations: MenuVariation[]) =>
    variations.reduce((acc, v) => {
      if (!acc[v.name]) acc[v.name] = [];
      acc[v.name].push(v);
      return acc;
    }, {} as Record<string, MenuVariation[]>);

  const handleCheckout = () => {
    if (items.length === 0) { toast.error('Keranjang masih kosong'); return; }
    setIsPaymentModalOpen(true);
    // Close mobile cart if open
    if (isMobile) setIsMobileCartOpen(false);
  };

  const handlePayment = async (
    paymentMethod: string,
    customerName?: string,
    cashAmount?: number,
    discountType?: 'percent' | 'nominal',
    discountValue?: number,
  ): Promise<any> => {
    if (cashAmount) setPaidAmount(cashAmount);
    setIsProcessing(true);
    setProcessingMsg('Mengecek stok bahan baku...');
    await new Promise(r => setTimeout(r, 600));
    setProcessingMsg('Membuat pesanan...');
    try {
      const orderData = {
        customer_name: customerName || 'Walk-in Customer',
        payment_method: paymentMethod,
        discount_type: discountType,
        discount_amount: discountValue,
        items: items.flatMap(item => {
          if (!item.is_promo || !item.promo_id) {
            return [{
              menu_id: item.menu_id,
              variation_id: item.variation_id,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes,
            }];
          }
          const promo = promos.find(p => p.id === item.promo_id);
          if (!promo) return [];

          const promoItems = (item.promo_items && item.promo_items.length > 0)
            ? item.promo_items
            : promo.items;

          const normalTotal = promoItems.reduce(
            (sum, pi) => sum + (pi.menu?.base_price ?? 0) * pi.quantity, 0
          );
          return promoItems.map(pi => {
            const proportion = normalTotal > 0
              ? ((pi.menu?.base_price ?? 0) * pi.quantity) / normalTotal
              : 1 / promoItems.length;
            const basePromoItemPrice = normalTotal > 0
              ? Math.round((promo.promo_price * proportion) / pi.quantity)
              : Math.round(promo.promo_price / promoItems.reduce((s, x) => s + x.quantity, 0));
            const varDeltaPrice = pi.addon_mode === 'dynamic' && pi.variation_id
              ? (pi.menu?.variations?.find((v: any) => v.id === pi.variation_id)?.price ?? 0)
              : 0;
            return {
              menu_id: pi.menu_id,
              variation_id: pi.variation_id ?? undefined,
              quantity: pi.quantity * item.quantity,
              price: basePromoItemPrice + varDeltaPrice,
              notes: `[Bundle: ${promo.name}]`,
            };
          });
        }),
      };

      const order = await orderApi.createOrder(orderData);
      setProcessingMsg('Menyimpan pesanan...');
      toast.success('Transaksi berhasil!');
      clearCart();
      setIsPaymentModalOpen(false);

      if (tenant?.printer_mac) {
        setProcessingMsg('Mengirim ke printer...');
        try {
          await fetch(`${import.meta.env.VITE_REPORT_SERVICE_URL}/api/v1/print/receipt/${order.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ printer_mac: tenant.printer_mac, copies: 1 }),
          });
        } catch (e) { console.error('Print error:', e); }
      }

      setProcessingMsg('Menyiapkan nota...');
      setCompletedOrder(order);
      setIsReceiptOpen(true);
    } catch (err: any) {
      const errData = err?.response?.data;
      if (errData?.error_code === 'STOCK_INSUFFICIENT') {
        setStockAlert(errData.error);
      } else {
        toast.error('Transaksi gagal');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = selectedMenu
    ? (selectedMenu.base_price + (selectedVariation?.price || 0)) * qty
    : 0;

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  // ── Render ──
  return (
    <div className="pos-root">
      {/* ── FULLSCREEN PROCESSING OVERLAY ── */}
      {isProcessing && (
        <div className="pos-process-overlay">
          <div className="pos-process-card">
            <Lottie animationData={lottieTree} loop autoplay style={{ width: 180, height: 180 }} />
            <p className="pos-process-msg">{processingMsg}</p>
            <div className="pos-loading-dots pos-loading-dots--dark"><span /><span /><span /></div>
          </div>
        </div>
      )}

      {/* ── LEFT PANEL ── */}
      <div className="pos-left">
        {/* Page header */}
        <div className="pos-header">
          <div className="pos-header-title-group">
            <div className="pos-header-icon">
              <ForkKnifeIcon />
            </div>
            <div>
              <h1 className="pos-title">Kasir</h1>
              <p className="pos-subtitle">
                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ·&nbsp;
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Cart pill - desktop only */}
          {!isMobile && items.length > 0 && (
            <div className="pos-cart-pill">
              <CartIcon />
              <span>{totalItems} item</span>
              <span className="pos-cart-pill-sep" />
              <span className="pos-cart-pill-total">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>

        {/* ── Tab switcher ── */}
        <div className="pos-tabs">
          <button
            className={`pos-tab ${activeTab === 'menu' ? 'pos-tab--active pos-tab--menu' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <ForkKnifeIcon />
            <span>Menu</span>
          </button>
          <button
            className={`pos-tab ${activeTab === 'promo' ? 'pos-tab--active pos-tab--promo' : ''}`}
            onClick={() => setActiveTab('promo')}
          >
            <GiftIcon />
            <span>Promo</span>
            {promos.length > 0 && (
              <span className="pos-tab-badge">{promos.length}</span>
            )}
          </button>
        </div>

        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && (
          <div className="pos-menu-tab">
            {/* Search + Categories */}
            <div className="pos-filter-bar">
              <div className="pos-search-wrap">
                <span className="pos-search-icon" style={{ color: searchFocused ? C.primary : '#b0a898' }}>
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pos-search-input"
                  style={{ borderColor: searchFocused ? C.primary : '#e8e4dc', boxShadow: searchFocused ? '0 0 0 3px rgba(91,140,90,0.12)' : 'none' }}
                />
                {searchTerm && (
                  <button className="pos-search-clear" onClick={() => setSearchTerm('')}>
                    <XIcon />
                  </button>
                )}
              </div>

              <div className="pos-cats">
                <CategoryPill label="Semua" active={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
                {categories.map(cat => (
                  <CategoryPill key={cat.id} label={cat.name} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
                ))}
              </div>
            </div>

            {/* Menu grid */}
            <div className="pos-menu-scroll">
              {isLoading ? (
                <div className="pos-loading">
                  <Lottie animationData={lottieTree} loop autoplay style={{ width: 140, height: 140 }} />
                  <p>Memuat menu...</p>
                  <div className="pos-loading-dots"><span /><span /><span /></div>
                </div>
              ) : menus.length === 0 ? (
                <div className="pos-empty">
                  <div className="pos-empty-icon">🍽️</div>
                  <p className="pos-empty-title">Tidak ada menu tersedia</p>
                  <p className="pos-empty-sub">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              ) : (
                <div className="pos-menu-grid">
                  {menus.map((menu, i) => (
                    <div key={menu.id} className="pos-menu-grid-item" style={{ animationDelay: `${i * 0.03}s` }}>
                      <MenuCard menu={menu} onClick={() => handleMenuClick(menu)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROMO TAB ── */}
        {activeTab === 'promo' && (
          <div className="pos-promo-tab">
            {promoLoading ? (
              <div className="pos-loading">
                <Lottie animationData={lottieTree} loop autoplay style={{ width: 140, height: 140 }} />
                <p>Memuat promo...</p>
                <div className="pos-loading-dots"><span /><span /><span /></div>
              </div>
            ) : promos.length === 0 ? (
              <div className="pos-empty">
                <div className="pos-empty-icon">🎁</div>
                <p className="pos-empty-title">Tidak ada promo aktif</p>
                <p className="pos-empty-sub">Buat promo di halaman Promo & Bundle</p>
              </div>
            ) : (
              <div className="pos-promo-grid">
                {promos.map((promo, i) => (
                  <div key={promo.id} className="pos-menu-grid-item" style={{ animationDelay: `${i * 0.04}s` }}>
                    <PromoCard promo={promo} onAdd={() => {
                      if (promo.unavailable_reason) return;
                      const hasDynamicItems = promo.items?.some(pi => pi.addon_mode === 'dynamic');
                      if (hasDynamicItems) {
                        setPromoVariationModal(promo);
                      } else {
                        addPromoToCart(promo, promo.items);
                      }
                    }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Cart (Desktop) ── */}
      {!isMobile && (
        <div className="pos-right">
          <Cart onCheckout={handleCheckout} />
        </div>
      )}

      {/* ── MOBILE: Bottom Cart Bar + Drawer ── */}
      {isMobile && (
        <>
          {/* Floating cart bar at bottom */}
          <div className={`mobile-cart-bar ${items.length > 0 ? 'mobile-cart-bar--active' : ''}`}>
            <button
              className="mobile-cart-bar-btn"
              onClick={() => setIsMobileCartOpen(!isMobileCartOpen)}
            >
              <div className="mobile-cart-bar-left">
                <div className="mobile-cart-bar-icon">
                  <CartIcon />
                  {totalItems > 0 && (
                    <span className="mobile-cart-bar-badge">{totalItems}</span>
                  )}
                </div>
                <span className="mobile-cart-bar-label">
                  {items.length === 0 ? 'Keranjang Kosong' : 'Lihat Keranjang'}
                </span>
              </div>
              <div className="mobile-cart-bar-right">
                {items.length > 0 && (
                  <span className="mobile-cart-bar-total">{formatCurrency(subtotal)}</span>
                )}
                {isMobileCartOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
              </div>
            </button>
          </div>

          {/* Mobile cart drawer */}
          {isMobileCartOpen && (
            <div className="mobile-cart-overlay" onClick={() => setIsMobileCartOpen(false)} />
          )}
          <div className={`mobile-cart-drawer ${isMobileCartOpen ? 'mobile-cart-drawer--open' : ''}`}>
            <div className="mobile-cart-drawer-handle" />
            <div className="mobile-cart-drawer-content">
              <Cart onCheckout={handleCheckout} />
            </div>
          </div>
        </>
      )}

      {/* ── Menu Detail Modal ── */}
      <Modal isOpen={!!selectedMenu} onClose={() => setSelectedMenu(null)} title={selectedMenu?.name || ''} size="md">
        {selectedMenu && (
          <div className="modal-body">
            {/* Hero image */}
            {selectedMenu.images?.[0] && (
              <div className="modal-img-wrap">
                <img src={selectedMenu.images[0].image_url} alt={selectedMenu.name} className="modal-img" />
                <div className="modal-img-gradient" />
                <div className="modal-img-price">{formatCurrency(selectedMenu.base_price)}</div>
              </div>
            )}

            {selectedMenu.description && (
              <p className="modal-desc">{selectedMenu.description}</p>
            )}

            {!selectedMenu.images?.[0] && (
              <p className="modal-price-standalone">{formatCurrency(selectedMenu.base_price)}</p>
            )}

            {/* Variations */}
            {selectedMenu.variations?.length > 0 && (
              <div className="modal-variations">
                {Object.entries(groupedVariations(selectedMenu.variations)).map(([groupName, options]) => (
                  <div key={groupName} className="modal-var-group">
                    <p className="modal-var-label">
                      <span className="modal-var-label-dot" />
                      {groupName}
                    </p>
                    <div className="modal-var-options">
                      {options.map(v => {
                        const selected = selectedVariation?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariation(v)}
                            className={`modal-var-btn ${selected ? 'modal-var-btn--active' : ''}`}
                          >
                            <div className="modal-var-btn-top">
                              <span className="modal-var-btn-name" style={{ color: selected ? C.primaryDark : C.text }}>
                                {v.option}
                              </span>
                              {selected && (
                                <span className="modal-var-check">
                                  <CheckIcon />
                                </span>
                              )}
                            </div>
                            {v.price > 0 && (
                              <p className="modal-var-btn-price" style={{ color: selected ? C.primary : C.sub }}>
                                +{formatCurrency(v.price)}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="modal-notes-wrap">
              <label className="modal-notes-label">
                <NotesIcon />
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: tanpa gula, extra pedas..."
                className="modal-notes-input"
              />
            </div>

            {/* Qty + Total + Add */}
            <div className="modal-footer">
              <div className="modal-qty-total">
                <div className="modal-qty">
                  <button
                    className={`modal-qty-btn ${qty <= 1 ? 'modal-qty-btn--disabled' : ''}`}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                  >
                    <MinusIcon />
                  </button>
                  <span className="modal-qty-num">{qty}</span>
                  <button className="modal-qty-btn" onClick={() => setQty(q => q + 1)}>
                    <PlusIcon />
                  </button>
                </div>
                <div className="modal-total">
                  <p className="modal-total-label">Total</p>
                  <p className="modal-total-value">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={isAdding} className="modal-add-btn">
                {isAdding ? (
                  <>
                    <Lottie animationData={lottieTree} loop autoplay style={{ width: 24, height: 24 }} />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <CartIcon />
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── STOCK ALERT MODAL ── */}
      {stockAlert && (
        <div className="stock-alert-overlay">
          <div className="stock-alert-modal">
            <div className="stock-alert-icon">⚠️</div>
            <h3 className="stock-alert-title">Stok Tidak Mencukupi</h3>
            <p className="stock-alert-msg">{stockAlert}</p>
            <p className="stock-alert-hint">Pesanan tidak dapat diproses. Tambahkan stok bahan baku terlebih dahulu di menu stok bahan.</p>
            <button onClick={() => setStockAlert(null)} className="stock-alert-btn">
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {promoVariationModal && (
        <PromoVariationModal
          promo={promoVariationModal}
          onConfirm={(selectedItems) => {
            addPromoToCart(promoVariationModal, selectedItems);
            setPromoVariationModal(null);
          }}
          onClose={() => setPromoVariationModal(null)}
        />
      )}

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => { setIsReceiptOpen(false); setCompletedOrder(null); }}
        order={completedOrder}
        template={defaultTemplate}
        tenant={tenant}
        cashAmount={paidAmount}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayment={handlePayment}
        total={subtotal}
        items={items}
        tenant={tenant}
      />

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cardIn { from {opacity:0;transform:scale(0.88) translateY(16px)} to {opacity:1;transform:scale(1) translateY(0)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }

        /* ── ROOT ── */
        .pos-root {
          height: calc(100vh - 120px);
          display: flex;
          gap: 18px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT ── */
        .pos-left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
        }

        /* ── HEADER ── */
        .pos-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .pos-header-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pos-header-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4a7949, #5B8C5A);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(91,140,90,0.3);
          flex-shrink: 0;
        }
        .pos-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #1e1a14; letter-spacing: -0.03em; line-height: 1;
        }
        .pos-subtitle {
          font-size: 11.5px; color: #9a8878; font-weight: 500; margin-top: 3px;
        }

        /* Cart pill */
        .pos-cart-pill {
          display: flex; align-items: center; gap: 7px;
          background: white;
          border: 1.5px solid rgba(91,140,90,0.2);
          border-radius: 100px; padding: 7px 14px;
          font-size: 12.5px; font-weight: 700; color: ${C.primary};
          box-shadow: 0 2px 12px rgba(91,140,90,0.15);
          animation: fadeUp 0.3s ease;
        }
        .pos-cart-pill-sep {
          width: 1px; height: 14px; background: rgba(91,140,90,0.25);
        }
        .pos-cart-pill-total { color: #1e1a14; }

        /* ── TABS ── */
        .pos-tabs {
          display: flex;
          gap: 6px;
          background: white;
          border-radius: 14px;
          padding: 5px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
          flex-shrink: 0;
        }
        .pos-tab {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 7px; padding: 10px 12px;
          border: none; border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent; color: ${C.sub};
          transition: all 0.22s ease;
          position: relative;
        }
        .pos-tab:hover { background: #f5f2ed; color: ${C.text}; }
        .pos-tab--active.pos-tab--menu {
          background: linear-gradient(135deg, #4a7949, #5B8C5A);
          color: white;
          box-shadow: 0 4px 14px rgba(91,140,90,0.32);
        }
        .pos-tab--active.pos-tab--promo {
          background: linear-gradient(135deg, #c94f1a, #e8622a, #f5a623);
          color: white;
          box-shadow: 0 4px 14px rgba(232,98,42,0.32);
        }
        .pos-tab-badge {
          background: rgba(255,255,255,0.25);
          border-radius: 100px; padding: 1px 7px;
          font-size: 11px; font-weight: 800;
        }
        .pos-tab--active .pos-tab-badge { background: rgba(255,255,255,0.25); color: white; }
        .pos-tab:not(.pos-tab--active) .pos-tab-badge { background: ${C.orange}; color: white; }

        /* ── MENU TAB ── */
        .pos-menu-tab {
          flex: 1; display: flex; flex-direction: column; gap: 12px; min-height: 0;
        }

        /* Filter bar */
        .pos-filter-bar {
          background: white;
          border-radius: 16px; padding: 14px 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.055);
          border: 1px solid rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 11px;
          flex-shrink: 0;
        }
        .pos-search-wrap { position: relative; }
        .pos-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center;
          transition: color 0.2s;
          pointer-events: none;
        }
        .pos-search-input {
          width: 100%; padding: 10px 36px 10px 38px;
          border: 1.5px solid #e8e4dc;
          border-radius: 10px; font-size: 13px; color: ${C.text};
          background: #faf9f6; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .pos-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: ${C.sub}; display: flex; align-items: center; padding: 3px;
          border-radius: 50%;
        }
        .pos-search-clear:hover { background: #f0ede8; }

        .pos-cats {
          display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
        }
        .pos-cats::-webkit-scrollbar { display: none; }

        .cat-pill {
          padding: 6px 16px; border-radius: 100px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; white-space: nowrap;
          background: #f5f2ed; color: ${C.sub};
          transition: all 0.18s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cat-pill:hover { background: #ece8e0; color: ${C.text}; }
        .cat-pill--active {
          background: ${C.primary}; color: white;
          box-shadow: 0 3px 10px rgba(91,140,90,0.28);
          transform: scale(1.04);
        }

        /* Menu scroll area */
        .pos-menu-scroll {
          flex: 1; overflow-y: auto; padding-right: 2px;
        }
        .pos-menu-scroll::-webkit-scrollbar { width: 3px; }
        .pos-menu-scroll::-webkit-scrollbar-track { background: transparent; }
        .pos-menu-scroll::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }

        /* Menu grid */
        .pos-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          gap: 12px;
          padding-bottom: 12px;
        }
        .pos-menu-grid-item {
          animation: fadeUp 0.3s ease both;
        }

        /* ── MENU CARD ── */
        .menu-card {
          width: 100%; border: none; padding: 0;
          background: white; border-radius: 16px;
          cursor: pointer; text-align: left; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.055);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .menu-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(91,140,90,0.18);
        }
        .menu-card-border {
          position: absolute; inset: 0; border-radius: 16px;
          border: 2px solid ${C.primary};
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .menu-card-img-wrap {
          position: relative; width: 100%; height: 118px; overflow: hidden;
        }
        .menu-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.35s ease;
        }
        .menu-card-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #e8e4de, #d0ccc4);
          display: flex; align-items: center; justify-content: center;
          font-size: 34px;
        }
        .menu-card-gradient {
          position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.35), transparent);
          pointer-events: none;
        }
        .menu-card-variation-badge {
          position: absolute; top: 7px; right: 7px;
          background: rgba(74,168,216,0.92); color: white;
          border-radius: 20px; padding: 3px 8px;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; gap: 3px;
          backdrop-filter: blur(4px);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .menu-card-add-btn {
          position: absolute; bottom: 8px; right: 8px;
          width: 28px; height: 28px; border-radius: 50%;
          background: ${C.primary}; color: white;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 3px 10px rgba(91,140,90,0.45);
        }
        .menu-card-body { padding: 10px 12px 12px; }
        .menu-card-name {
          font-size: 13px; font-weight: 700; color: ${C.text};
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          margin-bottom: 2px;
        }
        .menu-card-desc {
          font-size: 11px; color: ${C.sub};
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 1; -webkit-box-orient: vertical;
          margin-bottom: 5px;
        }
        .menu-card-price {
          font-size: 13.5px; font-weight: 800; color: ${C.primary};
        }

        /* ── PROMO TAB ── */
        .pos-promo-tab {
          flex: 1; overflow-y: auto; padding-right: 2px;
        }
        .pos-promo-tab::-webkit-scrollbar { width: 3px; }
        .pos-promo-tab::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }
        .pos-promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
          gap: 12px; padding-bottom: 12px;
        }

        /* ── PROMO CARD ── */
        .promo-card {
          width: 100%; border: 1.5px solid rgba(232,98,42,0.18);
          background: white; border-radius: 16px;
          cursor: pointer; text-align: left; overflow: hidden; padding: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .promo-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(232,98,42,0.18);
          border-color: ${C.orange};
        }
        .promo-card-header {
          position: relative; height: 108px; overflow: hidden;
          background: linear-gradient(135deg, #c94f1a, #e8622a, #f5a623);
        }
        .promo-card-img { width: 100%; height: 100%; object-fit: cover; opacity: .8; }
        .promo-card-emoji {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center; font-size: 38px;
        }
        .promo-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.45));
        }
        .promo-savings-badge {
          position: absolute; top: 8px; right: 8px;
          background: white; color: ${C.orange};
          border-radius: 20px; padding: 3px 9px;
          font-size: 10.5px; font-weight: 800;
          display: flex; align-items: center; gap: 4px;
        }
        .promo-card-add-btn {
          position: absolute; bottom: 8px; right: 8px;
          width: 28px; height: 28px; border-radius: 50%;
          background: white; color: ${C.orange};
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .promo-card-body { padding: 10px 12px 13px; }
        .promo-card-name {
          font-size: 13px; font-weight: 700; color: ${C.text};
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          margin-bottom: 5px;
        }
        .promo-card-items { display: flex; flex-direction: column; gap: 1px; margin-bottom: 7px; }
        .promo-card-item { font-size: 11px; color: ${C.sub}; }
        .promo-card-prices { display: flex; align-items: center; gap: 7px; }
        .promo-card-price { font-size: 14px; font-weight: 800; color: ${C.orange}; }
        .promo-card-original { font-size: 11px; color: ${C.sub}; text-decoration: line-through; }

        /* ── RIGHT PANEL ── */
        .pos-right {
          width: 355px;
          flex-shrink: 0;
        }

        /* ── LOADING / EMPTY ── */
        .pos-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 32px 24px; gap: 6px;
          color: ${C.sub}; font-size: 13px; font-weight: 500;
        }
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .pos-loading-dots {
          display: flex; gap: 5px; margin-top: 4px;
        }
        .pos-loading-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.primary}; opacity: 0;
          animation: blink 1.4s ease-in-out infinite;
        }
        .pos-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .pos-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        .pos-loading-dots--dark span { background: ${C.primaryDark}; }

        /* ── FULLSCREEN PROCESSING OVERLAY ── */
        .pos-process-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(244,240,232,0.82);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          animation: overlayIn 0.2s ease;
        }
        .pos-process-card {
          background: white; border-radius: 28px;
          padding: 36px 48px; text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(91,140,90,0.12);
          border: 1px solid rgba(91,140,90,0.12);
          animation: cardIn 0.28s cubic-bezier(0.34,1.1,0.64,1);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .pos-process-msg {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700; color: ${C.text};
          margin-top: 4px;
        }
        .pos-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 24px; gap: 8px;
          background: white; border-radius: 18px;
          border: 1px dashed #e0dbd4;
          text-align: center;
        }
        .pos-empty-icon { font-size: 40px; margin-bottom: 4px; }
        .pos-empty-title { font-size: 14px; font-weight: 700; color: ${C.text}; }
        .pos-empty-sub { font-size: 12px; color: ${C.sub}; }

        /* ── MODAL BODY ── */
        .modal-body {
          display: flex; flex-direction: column; gap: 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .modal-img-wrap {
          position: relative; border-radius: 14px; overflow: hidden; height: 185px;
        }
        .modal-img { width: 100%; height: 100%; object-fit: cover; }
        .modal-img-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%);
        }
        .modal-img-price {
          position: absolute; bottom: 12px; left: 14px;
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 800; color: white;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          letter-spacing: -0.02em;
        }
        .modal-price-standalone {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 800; color: ${C.primary}; letter-spacing: -0.02em;
        }
        .modal-desc { font-size: 13px; color: ${C.sub}; line-height: 1.55; }

        /* Variations */
        .modal-variations { display: flex; flex-direction: column; gap: 14px; }
        .modal-var-group {}
        .modal-var-label {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 800; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 9px;
        }
        .modal-var-label-dot {
          width: 5px; height: 5px; border-radius: 50%; background: ${C.primary};
          flex-shrink: 0;
        }
        .modal-var-options {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .modal-var-btn {
          padding: 10px 12px; border-radius: 11px; cursor: pointer; text-align: left;
          border: 2px solid #e8e4dc; background: white;
          transition: all 0.15s ease; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .modal-var-btn:hover { border-color: rgba(91,140,90,0.4); background: #fafaf6; }
        .modal-var-btn--active { border-color: ${C.primary}; background: ${C.primaryLight}; }
        .modal-var-btn-top {
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-var-btn-name { font-size: 13px; font-weight: 600; }
        .modal-var-check {
          color: ${C.primary};
          display: flex; align-items: center;
        }
        .modal-var-btn-price { margin-top: 2px; font-size: 11px; font-weight: 600; }

        /* Notes */
        .modal-notes-wrap {}
        .modal-notes-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 800; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 7px;
        }
        .modal-notes-input {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e8e4dc; border-radius: 10px;
          font-size: 13px; color: ${C.text}; background: #faf9f6;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .modal-notes-input:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(91,140,90,0.1);
        }

        /* Footer */
        .modal-footer {
          display: flex; flex-direction: column; gap: 12px;
          padding-top: 14px;
          border-top: 1.5px dashed #e8e4dc;
        }
        .modal-qty-total {
          display: flex; align-items: center; justify-content: space-between;
        }
        .modal-qty {
          display: flex; align-items: center; gap: 2px;
          background: #f5f2ed; border-radius: 100px; padding: 4px;
        }
        .modal-qty-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: none; cursor: pointer;
          background: white; color: ${C.text};
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: all 0.15s;
        }
        .modal-qty-btn:hover { background: #e8e4de; }
        .modal-qty-btn--disabled {
          background: transparent; color: #c0b8b0; box-shadow: none; cursor: default;
        }
        .modal-qty-num {
          width: 36px; text-align: center;
          font-size: 16px; font-weight: 800; color: ${C.text};
        }
        .modal-total { text-align: right; }
        .modal-total-label {
          font-size: 10.5px; font-weight: 700; color: ${C.sub};
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px;
        }
        .modal-total-value {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 800; color: ${C.primary}; letter-spacing: -0.02em;
        }
        .modal-add-btn {
          width: 100%; padding: 13px; border: none; border-radius: 13px; cursor: pointer;
          background: linear-gradient(135deg, #4a7949 0%, #5B8C5A 50%, #7aae78 100%);
          color: white; font-size: 14px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 5px 18px rgba(91,140,90,0.38);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease;
        }
        .modal-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(91,140,90,0.45);
        }
        .modal-add-btn:active { transform: translateY(0); }

        /* ── STOCK ALERT ── */
        .stock-alert-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .stock-alert-modal {
          background: white; border-radius: 24px;
          padding: 32px 28px; max-width: 400px; width: 100%;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: cardIn 0.28s cubic-bezier(0.34,1.1,0.64,1);
        }
        .stock-alert-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: #fff3ee; margin: 0 auto 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
        }
        .stock-alert-title {
          margin: 0 0 8px; font-size: 18px; font-weight: 800;
          color: #1e1a14; letter-spacing: -0.02em;
        }
        .stock-alert-msg {
          margin: 0 0 24px; font-size: 14px; color: #8a8278;
          line-height: 1.6; font-weight: 500;
        }
        .stock-alert-hint {
          margin: 0 0 24px; font-size: 12px;
          color: #e8622a; font-weight: 600;
          background: #fff3ee; border-radius: 8px; padding: 8px 12px;
        }
        .stock-alert-btn {
          width: 100%; padding: 13px; border: none;
          border-radius: 13px; cursor: pointer;
          background: linear-gradient(135deg, #c94f1a, #e8622a);
          color: white; font-size: 14px; font-weight: 700;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(232,98,42,0.35);
        }

        /* ── PROMO VARIATION MODAL ── */
        .promo-var-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 20px; backdrop-filter: blur(4px);
        }
        .promo-var-modal {
          background: white; border-radius: 20px; padding: 24px;
          width: 100%; max-width: 440px; max-height: 80vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        /* ═══════════════════════════════════════════ */
        /* ── MOBILE STYLES ── */
        /* ═══════════════════════════════════════════ */
        @media (max-width: 767px) {
          .pos-root {
            height: 100vh;
            flex-direction: column;
            gap: 0;
            overflow: hidden;
          }

          .pos-left {
            flex: 1;
            overflow-y: auto;
            padding: 12px 12px 80px 12px; /* extra bottom padding for cart bar */
          }

          .pos-header {
            padding: 4px 0;
          }
          .pos-header-icon {
            width: 34px; height: 34px;
            border-radius: 10px;
          }
          .pos-header-icon svg {
            width: 14px; height: 14px;
          }
          .pos-title {
            font-size: 18px;
          }
          .pos-subtitle {
            font-size: 10.5px;
          }

          .pos-tabs {
            gap: 4px;
            padding: 4px;
          }
          .pos-tab {
            padding: 8px 10px;
            font-size: 12px;
            gap: 5px;
          }

          .pos-filter-bar {
            padding: 10px 12px;
            gap: 8px;
          }
          .pos-search-input {
            padding: 8px 30px 8px 34px;
            font-size: 12px;
          }

          .pos-menu-grid {
            grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
            gap: 8px;
          }
          .pos-promo-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 8px;
          }

          .menu-card-img-wrap {
            height: 100px;
          }
          .menu-card-body {
            padding: 8px 10px 10px;
          }
          .menu-card-name {
            font-size: 11.5px;
          }
          .menu-card-price {
            font-size: 12px;
          }

          .promo-card-header {
            height: 90px;
          }
          .promo-card-body {
            padding: 8px 10px 11px;
          }
          .promo-card-name {
            font-size: 11.5px;
          }
          .promo-card-price {
            font-size: 12.5px;
          }

          /* Hide right panel on mobile */
          .pos-right {
            display: none;
          }

          /* Mobile cart bar */
          .mobile-cart-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 500;
            background: white;
            border-top: 1px solid #e8e4dc;
            padding: 8px 12px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
            transition: all 0.25s ease;
          }
          .mobile-cart-bar--active {
            box-shadow: 0 -4px 24px rgba(91,140,90,0.2);
          }
          .mobile-cart-bar-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: none;
            background: none;
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 4px 0;
          }
          .mobile-cart-bar-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .mobile-cart-bar-icon {
            position: relative;
            display: flex;
            align-items: center;
            color: ${C.sub};
          }
          .mobile-cart-bar--active .mobile-cart-bar-icon {
            color: ${C.primary};
          }
          .mobile-cart-bar-badge {
            position: absolute;
            top: -6px;
            right: -8px;
            background: ${C.orange};
            color: white;
            font-size: 10px;
            font-weight: 800;
            min-width: 16px;
            height: 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
          }
          .mobile-cart-bar-label {
            font-size: 13px;
            font-weight: 700;
            color: ${C.sub};
          }
          .mobile-cart-bar--active .mobile-cart-bar-label {
            color: ${C.text};
          }
          .mobile-cart-bar-right {
            display: flex;
            align-items: center;
            gap: 6px;
            color: ${C.sub};
          }
          .mobile-cart-bar-total {
            font-size: 14px;
            font-weight: 800;
            color: ${C.primary};
          }

          /* Mobile cart drawer */
          .mobile-cart-overlay {
            position: fixed;
            inset: 0;
            z-index: 598;
            background: rgba(0,0,0,0.4);
            animation: fadeIn 0.2s ease;
          }
          .mobile-cart-drawer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 599;
            background: white;
            border-radius: 20px 20px 0 0;
            max-height: 70vh;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
          }
          .mobile-cart-drawer--open {
            transform: translateY(0);
          }
          .mobile-cart-drawer-handle {
            width: 36px;
            height: 4px;
            background: #d0c8be;
            border-radius: 2px;
            margin: 10px auto 4px;
            flex-shrink: 0;
          }
          .mobile-cart-drawer-content {
            flex: 1;
            overflow-y: auto;
            padding: 0 8px 8px;
          }

          /* Modal full screen on mobile */
          .modal-body {
            gap: 12px;
          }
          .modal-img-wrap {
            height: 150px;
          }
        }

        /* scrollbar */
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0c8be; border-radius: 10px; }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
};