import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/format';
import { PAYMENT_METHODS } from '../../utils/constants';
import { Order, Tenant, ReceiptTemplate, CartItem } from '../../types';
import { useReceipt } from '../../hooks/useReceipt';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (
    method: string,
    customerName?: string,
    cashAmount?: number,
    discountType?: 'percent' | 'nominal',
    discountValue?: number,
  ) => Promise<any>;
  total: number;
  items?: CartItem[];
  tenant: Tenant | null;
  defaultTemplate?: ReceiptTemplate | null;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
  </svg>
);
const QrisIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    <path d="M14 14h3v3"/><path d="M17 21v-3h3"/><path d="M14 21h3"/>
  </svg>
);
const TransferIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: '#e8e4dc',
  red: '#E8604A', redLight: '#fdecea',
  orange: '#E8A23A', orangeLight: '#fff8e8',
};

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];
const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash: <CashIcon />, qris: <QrisIcon />, transfer: <TransferIcon />,
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, onClose, onPayment, total, items = [], tenant, defaultTemplate,
}) => {
  const [selectedMethod,  setSelectedMethod]  = useState('cash');
  const [customerName,    setCustomerName]    = useState('');
  const [cashInput,       setCashInput]       = useState('');
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [nameFocused,     setNameFocused]     = useState(false);
  const [cashFocused,     setCashFocused]     = useState(false);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType,    setDiscountType]    = useState<'percent' | 'nominal'>('percent');
  const [discountInput,   setDiscountInput]   = useState('');
  const [discountFocused, setDiscountFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCashInput('');
      setCustomerName('');
      setSelectedMethod('cash');
      setDiscountEnabled(false);
      setDiscountInput('');
      setDiscountType('percent');
    }
  }, [isOpen]);

  // ── Discount calculation ───────────────────────────────────────────────────
  const discountRaw   = parseFloat(discountInput || '0');
  const discountAmount = discountEnabled
    ? discountType === 'percent'
      ? Math.min(total, (total * Math.min(discountRaw, 100)) / 100)
      : Math.min(total, discountRaw)
    : 0;
  const finalTotal    = Math.max(0, total - discountAmount);

  // ── Cash ──────────────────────────────────────────────────────────────────
  const cashAmount = parseInt(cashInput.replace(/\D/g, '') || '0', 10);
  const change     = cashAmount - finalTotal;
  const canPay     = selectedMethod !== 'cash' || cashAmount >= finalTotal;

  const handleCashInput = (val: string) => {
    const digits = val.replace(/\D/g, '').replace(/^0+/, '');
    setCashInput(digits);
  };
  const handleQuickAmount = (amount: number) => {
    const current = parseInt(cashInput.replace(/\D/g, '') || '0', 10);
    setCashInput(String(current + amount));
  };
  const handleBackspace = () => setCashInput(prev => prev.slice(0, -1));

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await onPayment(
        selectedMethod,
        customerName || undefined,
        selectedMethod === 'cash' ? cashAmount : undefined,
        discountEnabled ? discountType : undefined,
        discountEnabled ? discountAmount : undefined,
      );
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: `1.5px solid ${focused ? C.primary : C.border}`,
    fontSize: '13px', color: C.text, background: '#faf9f6', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    boxShadow: focused ? '0 0 0 3px rgba(91,140,90,0.1)' : 'none',
    transition: 'all 0.2s',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pembayaran" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Order Summary ── */}
        {items.length > 0 && (
          <div style={{
            background: '#f9f8f5', borderRadius: '12px', padding: '12px 14px',
            border: '1.5px solid #f0ece4',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#8a8278', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ringkasan Order
            </p>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '13px', color: '#2a2420', fontWeight: '600' }}>
                    {item.name}
                  </span>
                  {item.variation_name && (
                    <span style={{ fontSize: '11px', color: '#8a8278', marginLeft: '4px' }}>
                      ({item.variation_name})
                    </span>
                  )}
                  {item.notes && (
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#9a9288', fontStyle: 'italic' }}>
                      * {item.notes}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#8a8278' }}>{item.quantity}x</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#5B8C5A', marginLeft: '6px' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed #e8e4dc', marginTop: '8px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#8a8278', fontWeight: '600' }}>Subtotal</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#2a2420' }}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
              </span>
            </div>
          </div>
        )}

        {/* ── Total ── */}
        <div style={{
          background: 'linear-gradient(135deg, #3d5e3c, #5B8C5A)',
          borderRadius: '14px', padding: '16px 20px',
          boxShadow: '0 4px 16px rgba(91,140,90,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>Subtotal</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)', textDecoration: 'line-through' }}>{formatCurrency(total)}</p>
            </div>
          )}
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#ffd580', fontWeight: 700 }}>
                Diskon {discountType === 'percent' ? `${discountRaw}%` : ''}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#ffd580', fontWeight: 700 }}>
                -{formatCurrency(discountAmount)}
              </p>
            </div>
          )}
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {discountAmount > 0 ? 'Total Setelah Diskon' : 'Total Pembayaran'}
          </p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
            {formatCurrency(finalTotal)}
          </p>
        </div>

        {/* ── Customer name ── */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            <UserIcon /> Nama Pelanggan <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opsional)</span>
          </label>
          <input
            value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="Walk-in Customer"
            onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)}
            style={inputStyle(nameFocused)}
          />
        </div>

        {/* ── Diskon ── */}
        <div style={{
          border: `1.5px solid ${discountEnabled ? C.orange : C.border}`,
          borderRadius: '12px', overflow: 'hidden',
          transition: 'border-color .2s',
        }}>
          {/* Toggle header */}
          <div
            onClick={() => setDiscountEnabled(d => !d)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 14px', cursor: 'pointer',
              background: discountEnabled ? C.orangeLight : 'white',
              transition: 'background .2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '700', color: discountEnabled ? '#a06010' : C.sub }}>
              <TagIcon /> Tambah Diskon
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 36, height: 20, borderRadius: 10,
              background: discountEnabled ? C.orange : '#d8d4cc',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2,
                left: discountEnabled ? 18 : 2,
                transition: 'left .2s',
                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
              }}/>
            </div>
          </div>

          {/* Diskon content */}
          {discountEnabled && (
            <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Type toggle */}
              <div style={{ display: 'flex', background: '#f0ede8', borderRadius: 8, padding: 3 }}>
                {([['percent', 'Persentase (%)'], ['nominal', 'Nominal (Rp)']] as const).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => { setDiscountType(type); setDiscountInput(''); }}
                    style={{
                      flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                      background: discountType === type ? 'white' : 'transparent',
                      color: discountType === type ? C.text : C.sub,
                      boxShadow: discountType === type ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                      transition: 'all .15s',
                    }}
                  >{label}</button>
                ))}
              </div>

              {/* Input */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: C.sub }}>
                  {discountType === 'percent' ? '%' : 'Rp'}
                </span>
                <input
                  type="text" inputMode="numeric"
                  value={discountInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (discountType === 'percent') {
                      const n = parseInt(raw || '0');
                      setDiscountInput(n > 100 ? '100' : raw);
                    } else {
                      setDiscountInput(raw.replace(/^0+/, ''));
                    }
                  }}
                  onFocus={() => setDiscountFocused(true)}
                  onBlur={() => setDiscountFocused(false)}
                  placeholder={discountType === 'percent' ? '0' : '0'}
                  style={{
                    ...inputStyle(discountFocused),
                    paddingLeft: 36,
                    borderColor: discountFocused ? C.orange : C.border,
                    boxShadow: discountFocused ? '0 0 0 3px rgba(232,162,58,.12)' : 'none',
                  }}
                />
              </div>

              {/* Quick percent buttons */}
              {discountType === 'percent' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {[5, 10, 15, 20, 25, 50].map(p => (
                    <button key={p} onClick={() => setDiscountInput(String(p))} style={{
                      flex: 1, padding: '6px 0', borderRadius: 7, border: `1.5px solid ${discountInput === String(p) ? C.orange : C.border}`,
                      background: discountInput === String(p) ? C.orangeLight : 'white',
                      fontSize: 11, fontWeight: 700, color: discountInput === String(p) ? '#a06010' : C.sub,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                    }}>{p}%</button>
                  ))}
                </div>
              )}

              {/* Preview diskon */}
              {discountAmount > 0 && (
                <div style={{
                  background: C.orangeLight, borderRadius: 9, padding: '9px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: `1px solid rgba(232,162,58,.25)`,
                }}>
                  <span style={{ fontSize: 12, color: '#a06010', fontWeight: 600 }}>Hemat</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#a06010' }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Payment method ── */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
            Metode Pembayaran
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {PAYMENT_METHODS.map(method => {
              const active = selectedMethod === method.value;
              return (
                <button key={method.value} onClick={() => setSelectedMethod(method.value)} style={{
                  padding: '12px 8px', borderRadius: '12px',
                  border: `2px solid ${active ? C.primary : C.border}`,
                  background: active ? C.primaryLight : 'white', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  color: active ? C.primaryDark : C.sub, transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 12px rgba(91,140,90,0.2)' : 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <div style={{ color: active ? C.primary : C.sub }}>{METHOD_ICONS[method.value] || <CashIcon />}</div>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{method.label}</span>
                  {active && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><CheckIcon /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cash detail ── */}
        {selectedMethod === 'cash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Jumlah Uang Diterima
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: '700', color: C.sub }}>Rp</span>
                <input
                  type="text" inputMode="numeric"
                  value={cashInput ? parseInt(cashInput).toLocaleString('id-ID') : ''}
                  onChange={e => handleCashInput(e.target.value)}
                  onFocus={() => setCashFocused(true)} onBlur={() => setCashFocused(false)}
                  placeholder="0"
                  style={{ ...inputStyle(cashFocused), paddingLeft: '36px', paddingRight: '40px', fontSize: '16px', fontWeight: '700' }}
                />
                {cashInput && (
                  <button onClick={handleBackspace} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: C.sub,
                    display: 'flex', alignItems: 'center', padding: '2px',
                  }}><DeleteIcon /></button>
                )}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>Nominal Cepat (+)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {QUICK_AMOUNTS.map(amount => (
                  <button key={amount} onClick={() => handleQuickAmount(amount)} style={{
                    padding: '8px 4px', borderRadius: '9px', border: `1.5px solid ${C.border}`,
                    background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    color: C.primary, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                  >
                    +{amount >= 1000 ? `${amount / 1000}rb` : amount}
                  </button>
                ))}
              </div>
              <button onClick={() => setCashInput(String(Math.ceil(finalTotal)))} style={{
                width: '100%', marginTop: '6px', padding: '8px', borderRadius: '9px',
                border: `1.5px dashed ${C.primary}`, background: C.primaryLight,
                cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: C.primary,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Uang Pas {formatCurrency(finalTotal)}
              </button>
            </div>

            {cashAmount > 0 && (
              <div style={{
                padding: '14px 16px', borderRadius: '12px',
                background: change >= 0 ? C.primaryLight : C.redLight,
                border: `1.5px solid ${change >= 0 ? 'rgba(91,140,90,0.2)' : 'rgba(232,96,74,0.2)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: change >= 0 ? C.primaryDark : C.red }}>
                  {change >= 0 ? 'Kembalian' : 'Kurang'}
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: change >= 0 ? C.primary : C.red, letterSpacing: '-0.02em' }}>
                  {formatCurrency(Math.abs(change))}
                </p>
              </div>
            )}
          </div>
        )}

        {selectedMethod === 'qris' && (
          <div style={{ background: C.primaryLight, borderRadius: '12px', padding: '20px', textAlign: 'center', border: `1.5px solid rgba(91,140,90,0.2)` }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: C.primaryDark, fontWeight: '600' }}>Scan QRIS untuk membayar</p>
            <div style={{ background: 'white', borderRadius: '10px', padding: '16px', display: 'inline-block' }}>
              <div style={{ width: '120px', height: '120px', background: '#f0ede8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '12px' }}>QR Code</div>
            </div>
          </div>
        )}

        {selectedMethod === 'transfer' && (
          <div style={{ background: '#e8f5fb', borderRadius: '12px', padding: '16px', border: '1.5px solid rgba(74,168,216,0.2)', fontSize: '13px', color: '#2a5a78', fontWeight: '600', textAlign: 'center' }}>
            Konfirmasi transfer ke rekening toko
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: '11px', border: `1.5px solid ${C.border}`,
            background: 'white', color: C.sub, cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            fontFamily: "'DM Sans', sans-serif",
          }}>Batal</button>
          <button onClick={handlePayment} disabled={!canPay || isProcessing} style={{
            flex: 1, padding: '12px', borderRadius: '11px', border: 'none',
            cursor: canPay && !isProcessing ? 'pointer' : 'not-allowed',
            background: canPay ? `linear-gradient(135deg, ${C.primary}, #7aae78)` : '#c8d4c7',
            color: 'white', fontSize: '13px', fontWeight: '700',
            boxShadow: canPay ? '0 4px 14px rgba(91,140,90,0.3)' : 'none',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
          }}>
            {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
