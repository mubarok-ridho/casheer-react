import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { menuApi } from '../api/menu';
import { orderApi } from '../api/order';
import { reportApi } from '../api/report';
import { Menu, Category, MenuVariation, Order as OrderType, ReceiptTemplate } from '../types';
import { Modal } from '../components/common/Modal';
import { Cart } from '../components/order/Cart';
import { PaymentModal } from '../components/order/PaymentModal';
import { ReceiptModal } from '../components/order/ReceiptModal';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const NotesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
// const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Color palette ──────────────────────────────────────────────────────────────
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
  text: '#2a2420',
  sub: '#8a8278',
  border: 'rgba(0,0,0,0.07)',
};

// ── Menu Card ──────────────────────────────────────────────────────────────────
const MenuCard: React.FC<{ menu: Menu; onClick: () => void }> = ({ menu, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', border: `1.5px solid ${hovered ? C.primary : C.border}`,
        borderRadius: '16px', padding: 0, cursor: 'pointer', textAlign: 'left',
        boxShadow: hovered ? `0 8px 28px rgba(91,140,90,0.18)` : '0 2px 10px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease', overflow: 'hidden', width: '100%',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: '120px', overflow: 'hidden' }}>
        {menu.images?.[0] ? (
          <img src={menu.images[0].image_url} alt={menu.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s ease' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8e4de, #d8d4cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
          }}>🍽️</div>
        )}
        {/* Variation badge */}
        {menu.variations && menu.variations.length > 0 && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(74,168,216,0.92)', color: 'white',
            borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '3px', backdropFilter: 'blur(4px)',
          }}>
            <TagIcon /> {menu.variations.length} variasi
          </div>
        )}
        {/* Add button overlay */}
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          width: '28px', height: '28px', borderRadius: '50%',
          background: C.primary, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.7)',
          transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(91,140,90,0.4)',
        }}>
          <PlusIcon />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: C.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {menu.name}
        </p>
        {menu.description && (
          <p style={{ margin: '0 0 6px', fontSize: '11px', color: C.sub, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {menu.description}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C.primary }}>
          {formatCurrency(menu.base_price)}
        </p>
      </div>
    </button>
  );
};

// ── Category pill ──────────────────────────────────────────────────────────────
const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
    background: active ? C.primary : 'white',
    color: active ? 'white' : C.sub,
    boxShadow: active ? '0 4px 14px rgba(91,140,90,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    transform: active ? 'scale(1.04)' : 'scale(1)',
  }}>
    {label}
  </button>
);

// ── Main Order Page ────────────────────────────────────────────────────────────
export const Order: React.FC = () => {
  const { tenant } = useAuth();
  const { items, clearCart, addToCart, subtotal } = useCart();
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

  useEffect(() => { loadMenus(); }, [selectedCategory, searchTerm]);

  useEffect(() => {
    reportApi.getTemplates().then(res => {
      const templates = Array.isArray(res) ? res : res.data || [];
      const def = templates.find((t: ReceiptTemplate) => t.is_default) || templates[0] || null;
      setDefaultTemplate(def);
    }).catch(() => {});
  }, []);

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

  const handleMenuClick = (menu: Menu) => {
    setSelectedMenu(menu); setSelectedVariation(null); setQty(1); setNotes('');
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;
    if (selectedMenu.variations?.length > 0 && !selectedVariation) {
      toast.error('Pilih variasi terlebih dahulu'); return;
    }
    addToCart(selectedMenu, qty, selectedVariation || undefined, notes);
    toast.success(`${selectedMenu.name} ditambahkan!`);
    setSelectedMenu(null);
  };

  const groupedVariations = (variations: MenuVariation[]) =>
    variations.reduce((acc, v) => { if (!acc[v.name]) acc[v.name] = []; acc[v.name].push(v); return acc; }, {} as Record<string, MenuVariation[]>);

  const handleCheckout = () => {
    if (items.length === 0) { toast.error('Keranjang masih kosong'); return; }
    setIsPaymentModalOpen(true);
  };

const handlePayment = async (paymentMethod: string, customerName?: string, cashAmount?: number): Promise<any> => {
    if (cashAmount) setPaidAmount(cashAmount);
    try {
      const orderData = {
        customer_name: customerName || 'Walk-in Customer',
        payment_method: paymentMethod,
        items: items.map(item => ({
          menu_id: item.menu_id, variation_id: item.variation_id,
          quantity: item.quantity, price: item.price, notes: item.notes,
        })),
      };
      const order = await orderApi.createOrder(orderData);
      toast.success('Transaksi berhasil!');
      clearCart(); setIsPaymentModalOpen(false);
      setCompletedOrder(order); setIsReceiptOpen(true);
      if (tenant?.printer_mac) {
        try {
          await fetch(`${import.meta.env.VITE_REPORT_SERVICE_URL}/api/v1/print/receipt/${order.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ printer_mac: tenant.printer_mac, copies: 1 }),
          });
        } catch (e) { console.error('Print error:', e); }
      }
    } catch { toast.error('Transaksi gagal'); }
  };

  const totalPrice = selectedMenu
    ? (selectedMenu.base_price + (selectedVariation?.price || 0)) * qty
    : 0;

  return (
    <div style={{
      height: 'calc(100vh - 120px)', display: 'flex', gap: '20px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* ── LEFT: Menu Panel ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: C.text, letterSpacing: '-0.02em' }}>Kasir</h1>
          <p style={{ margin: 0, fontSize: '13px', color: C.sub }}>Pilih menu untuk ditambahkan ke keranjang</p>
        </div>

        {/* Search + Filter bar */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? C.primary : '#b0a898', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center',
            }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px',
                border: `1.5px solid ${searchFocused ? C.primary : '#e8e4dc'}`,
                borderRadius: '10px', fontSize: '13px', color: C.text,
                background: '#faf9f6', outline: 'none', boxSizing: 'border-box',
                boxShadow: searchFocused ? `0 0 0 3px rgba(91,140,90,0.1)` : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: C.sub,
                display: 'flex', alignItems: 'center', padding: '2px',
              }}><XIcon /></button>
            )}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            <CategoryPill label="Semua" active={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
            {categories.map(cat => (
              <CategoryPill key={cat.id} label={cat.name} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid #e8e4de`, borderTopColor: C.primary, animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : menus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '16px', color: C.sub }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🍽️</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada menu tersedia</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', paddingBottom: '16px' }}>
              {menus.map(menu => <MenuCard key={menu.id} menu={menu} onClick={() => handleMenuClick(menu)} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart ── */}
      <div style={{ width: '360px', flexShrink: 0 }}>
        <Cart onCheckout={handleCheckout} />
      </div>

      {/* ── Menu Detail Modal ── */}
      <Modal isOpen={!!selectedMenu} onClose={() => setSelectedMenu(null)} title={selectedMenu?.name || ''} size="md">
        {selectedMenu && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>

            {/* Image */}
            {selectedMenu.images?.[0] && (
              <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
                <img src={selectedMenu.images[0].image_url} alt={selectedMenu.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {selectedMenu.description && (
              <p style={{ margin: 0, fontSize: '13px', color: C.sub, lineHeight: 1.5 }}>{selectedMenu.description}</p>
            )}

            <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: C.primary, letterSpacing: '-0.02em' }}>
              {formatCurrency(selectedMenu.base_price)}
            </p>

            {/* Variations */}
            {selectedMenu.variations?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(groupedVariations(selectedMenu.variations)).map(([groupName, options]) => (
                  <div key={groupName}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {groupName}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {options.map(v => {
                        const selected = selectedVariation?.id === v.id;
                        return (
                          <button key={v.id} onClick={() => setSelectedVariation(v)} style={{
                            padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                            border: `2px solid ${selected ? C.primary : '#e8e4dc'}`,
                            background: selected ? C.primaryLight : 'white',
                            transition: 'all 0.15s ease',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: selected ? C.primaryDark : C.text }}>{v.option}</p>
                              {selected && <CheckIcon />}
                            </div>
                            {v.price > 0 && (
                              <p style={{ margin: '2px 0 0', fontSize: '11px', color: selected ? C.primary : C.sub, fontWeight: 600 }}>+{formatCurrency(v.price)}</p>
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
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                <NotesIcon /> Catatan (opsional)
              </label>
              <input
                type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: tanpa gula, extra pedas..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #e8e4dc', fontSize: '13px', color: C.text,
                  background: '#faf9f6', outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Qty + Total + Add */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '14px', borderTop: '1.5px dashed #e8e4dc',
            }}>
              {/* Qty stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f5f2ed', borderRadius: '100px', padding: '4px' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: qty <= 1 ? 'transparent' : 'white', color: qty <= 1 ? '#c0b8b0' : C.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: qty <= 1 ? 'none' : '0 1px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s',
                }}><MinusIcon /></button>
                <span style={{ width: '32px', textAlign: 'center', fontSize: '15px', fontWeight: '800', color: C.text }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'white', color: C.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)', transition: 'all 0.15s',
                }}><PlusIcon /></button>
              </div>

              {/* Total */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '11px', color: C.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: C.primary, letterSpacing: '-0.02em' }}>{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            {/* Add button */}
            <button onClick={handleAddToCart} style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: '12px', cursor: 'pointer',
              background: `linear-gradient(135deg, ${C.primary} 0%, #7aae78 100%)`,
              color: 'white', fontSize: '14px', fontWeight: '700',
              boxShadow: '0 4px 16px rgba(91,140,90,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s ease',
            }}>
              <CartIcon /> Tambah ke Keranjang
            </button>
          </div>
        )}
      </Modal>

      {/* Receipt & Payment Modals */}
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
        tenant={tenant}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d8d4cc; border-radius: 10px; }
      `}</style>
    </div>
  );
};