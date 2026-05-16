import React from 'react';
import { Modal } from '../common/Modal';
import { Order, ReceiptTemplate, Tenant } from '../../types';
import { formatCurrency } from '../../utils/format';
import { useReceipt } from '../../hooks/useReceipt';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  template?: ReceiptTemplate | null;
  tenant?: Tenant | null;
  storeName?: string;
  logoUrl?: string;
  cashAmount?: number;
}

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen, onClose, order, template, tenant,
  storeName, logoUrl, cashAmount,
}) => {
  const { printReceipt, taxRate } = useReceipt();

  if (!order) return null;

  const resolvedTenant = tenant ?? (storeName || logoUrl
    ? { store_name: storeName, logo_url: logoUrl } as any
    : null);

  const paperWidth = template?.paper_width ?? '58mm';
  const maxWidth   = paperWidth === '58mm' ? '230px' : '300px';
  const fontSize   = template?.font_size ?? 12;
  const logoPos    = template?.logo_position ?? 'center';
  const logoAlign  = logoPos === 'left' ? 'left' as const : logoPos === 'right' ? 'right' as const : 'center' as const;
  const showLogo   = template?.show_logo !== false;

  const discount      = (order as any).discount_amount ?? 0;
  const discountType  = (order as any).discount_type ?? '';
  const subtotalBefore = discount > 0 ? order.total_amount + discount : order.total_amount;
  const effectiveTax  = template?.show_tax ? (taxRate > 0 ? taxRate : 0) : 0;
  const taxAmount     = order.total_amount * (effectiveTax / 100);
  const grand         = order.total_amount + taxAmount;
  const change        = cashAmount != null ? cashAmount - grand : null;

  const paymentLabels: Record<string, string> = {
    cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer',
  };

  const Row = ({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: bold ? 700 : 400, color: color ?? 'inherit' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  const Divider = () => (
    <div style={{ borderTop: '1px dashed #aaa', margin: '5px 0' }} />
  );

  const handlePrint = () => printReceipt(order, resolvedTenant, template ?? null, cashAmount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nota Transaksi" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Receipt preview */}
        <div style={{
          background: '#f0ede8', borderRadius: '12px', padding: '16px',
          display: 'flex', justifyContent: 'center',
          maxHeight: '62vh', overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <div style={{
            background: 'white', width: maxWidth,
            fontFamily: "'Courier New', monospace",
            fontSize: `${fontSize}px`, color: '#111',
            padding: `${(template?.margin_top ?? 0) * 4 + 12}px 12px ${(template?.margin_bottom ?? 0) * 4 + 32}px`,
            boxShadow: '0 4px 20px rgba(0,0,0,.12)',
            minHeight: 'fit-content',
          }}>

            {/* Logo / Store name */}
            {showLogo && (
              <div style={{ textAlign: logoAlign, marginBottom: 6 }}>
                {resolvedTenant?.logo_url
                  ? <img src={resolvedTenant.logo_url} alt="logo"
                      style={{ maxHeight: 52, maxWidth: '90%', display: 'inline-block' }} />
                  : <div style={{ fontWeight: 700, fontSize: fontSize + 3 }}>
                      {resolvedTenant?.store_name ?? 'Kasir'}
                    </div>
                }
              </div>
            )}
            {!showLogo && (
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: fontSize + 3, marginBottom: 6 }}>
                {resolvedTenant?.store_name ?? 'Kasir'}
              </div>
            )}

            {/* Header */}
            {template?.header && (
              <div style={{ textAlign: 'center', fontSize: fontSize - 1, whiteSpace: 'pre-line', marginBottom: 5 }}>
                {template.header}
              </div>
            )}

            <Divider />

            {/* Order info */}
            <div style={{ fontSize: fontSize - 1, marginBottom: 4 }}>
              <Row label="No" value={order.order_number.slice(-10)} />
              <Row label="Tgl" value={new Date(order.created_at).toLocaleDateString('id-ID')} />
              <Row label="Jam" value={new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
              {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
                <Row label="Pelanggan" value={order.customer_name} />
              )}
              <Row label="Bayar" value={paymentLabels[order.payment_method] ?? order.payment_method} />
            </div>

            <Divider />

            {/* Items */}
            <div style={{ marginBottom: 4 }}>
              {(order.items ?? []).map((item: any, i: number) => (
                <div key={i} style={{ marginBottom: 5, fontSize: fontSize - 1 }}>
                  <div>
                    {item.menu_name ?? item.menu?.name ?? ''}
                    {template?.show_variations !== false && (item.variation_name ?? item.variation?.option)
                      ? ` (${item.variation_name ?? item.variation?.option})` : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                    <span>{item.quantity} x {formatCurrency(item.price)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  {template?.show_notes !== false && item.notes && (
                    <div style={{ color: '#888', fontStyle: 'italic', fontSize: fontSize - 2 }}>
                      * {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Divider />

            {/* Totals */}
            <div style={{ fontSize: fontSize - 1 }}>
              {/* Diskon */}
              {discount > 0 && template?.show_discount !== false && (
                <>
                  <Row label="Subtotal" value={formatCurrency(subtotalBefore)} />
                  <Row
                    label={`Diskon${discountType === 'percent' ? '' : ''}`}
                    value={`-${formatCurrency(discount)}`}
                    color="#a06010"
                  />
                </>
              )}
              {/* Pajak */}
              {effectiveTax > 0 && (
                <>
                  <Row label="Subtotal" value={formatCurrency(order.total_amount)} color="#555" />
                  <Row label={`Pajak (${effectiveTax}%)`} value={formatCurrency(taxAmount)} color="#555" />
                </>
              )}
              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: fontSize + 1, marginTop: 4, paddingTop: 4, borderTop: '1px solid #333' }}>
                <span>TOTAL</span>
                <span>{formatCurrency(grand)}</span>
              </div>
              {/* Tunai & Kembalian */}
              {cashAmount != null && (
                <>
                  <Row label="Tunai" value={formatCurrency(cashAmount)} />
                  {order.payment_method === 'cash' && change != null && (
                    <Row label="Kembali" value={formatCurrency(Math.max(0, change))} />
                  )}
                </>
              )}
            </div>

            <Divider />

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: fontSize - 1, whiteSpace: 'pre-line', paddingBottom: 8 }}>
              {template?.footer ?? 'Terima kasih!'}
            </div>

          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: '10px',
            border: '1.5px solid #e8e4dc', background: 'white',
            color: '#8a8278', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            fontFamily: "'DM Sans', sans-serif",
          }}>Tutup</button>
          <button onClick={handlePrint} style={{
            flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #217093, #4eb8dd)',
            color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 14px rgba(33,112,147,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <PrintIcon /> Cetak Struk
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#bbb' }}>
          {template?.name ?? 'Template default'} · {paperWidth}
          {effectiveTax > 0 ? ` · Pajak ${effectiveTax}%` : ''}
        </div>
      </div>
    </Modal>
  );
};
