import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/format';
import { PAYMENT_METHODS } from '../../utils/constants';
import { Order, Tenant, ReceiptTemplate } from '../../types';
import { useReceipt } from '../../hooks/useReceipt';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (method: string, customerName?: string, cashAmount?: number) => Promise<Order>;
  total: number;
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
const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const SuccessIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
  </svg>
);

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: '#e8e4dc',
  red: '#E8604A', redLight: '#fdecea',
  blue: '#217093', blueLight: '#e8f4fb',
};

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash: <CashIcon />, qris: <QrisIcon />, transfer: <TransferIcon />,
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, onClose, onPayment, total, tenant, defaultTemplate,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [customerName,   setCustomerName]   = useState('');
  const [cashInput,      setCashInput]      = useState('');
  const [isProcessing,   setIsProcessing]   = useState(false);
  const [nameFocused,    setNameFocused]    = useState(false);
  const [cashFocused,    setCashFocused]    = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const { defaultTemplate: fetchedTemplate, printReceipt } = useReceipt();
  const template = defaultTemplate ?? fetchedTemplate;

  useEffect(() => {
    if (isOpen) {
      setCashInput('');
      setCustomerName('');
      setSelectedMethod('cash');
      setCompletedOrder(null);
    }
  }, [isOpen]);

  const cashAmount = parseInt(cashInput.replace(/\D/g, '') || '0', 10);
  const change     = cashAmount - total;
  const canPay     = selectedMethod !== 'cash' || cashAmount >= total;

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
      const order = await onPayment(
        selectedMethod,
        customerName || undefined,
        selectedMethod === 'cash' ? cashAmount : undefined,
      );
      setCompletedOrder(order);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!completedOrder) return;
    printReceipt(
      completedOrder,
      tenant,
      template ?? null,
      selectedMethod === 'cash' ? cashAmount : undefined,
    );
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: `1.5px solid ${focused ? C.primary : C.border}`,
    fontSize: '13px', color: C.text, background: '#faf9f6', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    boxShadow: focused ? '0 0 0 3px rgba(91,140,90,0.1)' : 'none',
    transition: 'all 0.2s',
  });

  // ── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (completedOrder) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Pembayaran Berhasil" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'DM Sans', sans-serif" }}>

          {/* Success badge */}
          <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
            <div style={{ color: C.primary, display: 'inline-block', marginBottom: 8 }}>
              <SuccessIcon />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
              {formatCurrency(completedOrder.total_amount)}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              #{completedOrder.order_number}
            </div>
          </div>

          {/* Ringkasan struk mini */}
          <div style={{
            background: '#faf9f6', borderRadius: 14, padding: '14px 16px',
            border: `1px dashed ${C.border}`, fontFamily: 'monospace', fontSize: 12,
          }}>
            {/* Tenant name */}
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6, fontSize: 13 }}>
              {tenant?.store_name ?? 'Struk Pembayaran'}
            </div>

            <div style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }}/>

            {/* Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: C.sub }}>No</span>
              <span>{completedOrder.order_number.slice(-8)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: C.sub }}>Waktu</span>
              <span>{new Date(completedOrder.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {completedOrder.customer_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: C.sub }}>Pelanggan</span>
                <span>{completedOrder.customer_name}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: C.sub }}>Metode</span>
              <span>{selectedMethod.toUpperCase()}</span>
            </div>

            <div style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }}/>

            {/* Items */}
            {(completedOrder.items ?? []).map((item, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 600 }}>{item.menu_name}{item.variation_name ? ` (${item.variation_name})` : ''}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub }}>
                  <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }}/>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
              <span>TOTAL</span>
              <span>{formatCurrency(completedOrder.total_amount)}</span>
            </div>
            {selectedMethod === 'cash' && cashAmount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub, marginTop: 2 }}>
                  <span>Tunai</span><span>{formatCurrency(cashAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: C.primary, fontWeight: 700, marginTop: 2 }}>
                  <span>Kembali</span><span>{formatCurrency(Math.max(0, cashAmount - completedOrder.total_amount))}</span>
                </div>
              </>
            )}

            <div style={{ borderTop: '1px dashed #ccc', margin: '6px 0' }}/>
            <div style={{ textAlign: 'center', color: C.sub }}>
              {template?.footer || 'Terima kasih!'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleClose} style={{
              flex: 1, padding: '12px', borderRadius: '11px',
              border: `1.5px solid ${C.border}`, background: 'white',
              color: C.sub, cursor: 'pointer', fontSize: '13px', fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
            }}>Tutup</button>

            <button onClick={handlePrint} style={{
              flex: 2, padding: '12px', borderRadius: '11px', border: 'none',
              background: `linear-gradient(135deg, ${C.blue}, #4eb8dd)`,
              color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 14px rgba(33,112,147,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <PrintIcon /> Cetak Struk
            </button>
          </div>

          {/* Info ukuran kertas */}
          <div style={{ textAlign: 'center', fontSize: 11, color: C.sub }}>
            Template: {template?.name ?? 'Default'} · {template?.paper_width ?? '58mm'}
          </div>
        </div>
      </Modal>
    );
  }

  // ── PAYMENT FORM ──────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pembayaran" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Total */}
        <div style={{
          background: 'linear-gradient(135deg, #3d5e3c, #5B8C5A)',
          borderRadius: '14px', padding: '18px 20px',
          boxShadow: '0 4px 16px rgba(91,140,90,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Pembayaran</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>{formatCurrency(total)}</p>
        </div>

        {/* Customer name */}
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

        {/* Payment method */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
            Metode Pembayaran
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {PAYMENT_METHODS.map(method => {
              const active = selectedMethod === method.value;
              return (
                <button key={method.value} onClick={() => setSelectedMethod(method.value)} style={{
                  padding: '12px 8px', borderRadius: '12px', border: `2px solid ${active ? C.primary : C.border}`,
                  background: active ? C.primaryLight : 'white', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  color: active ? C.primaryDark : C.sub, transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 12px rgba(91,140,90,0.2)' : 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <div style={{ color: active ? C.primary : C.sub }}>{METHOD_ICONS[method.value] || <CashIcon />}</div>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{method.label}</span>
                  {active && (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <CheckIcon />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash detail */}
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
              <button onClick={() => setCashInput(String(total))} style={{
                width: '100%', marginTop: '6px', padding: '8px', borderRadius: '9px',
                border: `1.5px dashed ${C.primary}`, background: C.primaryLight,
                cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: C.primary,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Uang Pas {formatCurrency(total)}
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
            <div style={{ background: 'white', borderRadius: '10px', padding: '16px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '120px', height: '120px', background: '#f0ede8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '12px' }}>QR Code</div>
            </div>
          </div>
        )}

        {selectedMethod === 'transfer' && (
          <div style={{ background: '#e8f5fb', borderRadius: '12px', padding: '16px', border: '1.5px solid rgba(74,168,216,0.2)', fontSize: '13px', color: '#2a5a78', fontWeight: '600', textAlign: 'center' }}>
            Konfirmasi transfer ke rekening toko
          </div>
        )}

        {/* Actions */}
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
