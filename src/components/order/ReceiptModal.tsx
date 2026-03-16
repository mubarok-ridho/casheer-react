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
  // legacy props (tetap support untuk backward compat)
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
  const { printReceipt } = useReceipt();

  if (!order) return null;

  // Merge legacy props ke tenant object kalau tenant tidak dipass
  const resolvedTenant = tenant ?? (storeName || logoUrl
    ? { store_name: storeName, logo_url: logoUrl } as any
    : null);

  const change = cashAmount ? cashAmount - order.total_amount : 0;
  const paperWidth = template?.paper_width ?? '58mm';
  const maxWidth   = paperWidth === '58mm' ? '220px' : '300px';
  const fontSize   = template?.font_size ?? 12;
  const logoPos    = template?.logo_position ?? 'center';
  const logoAlign  = logoPos === 'left' ? 'left' : logoPos === 'right' ? 'right' : 'center';

  const handlePrint = () => {
    printReceipt(order, resolvedTenant, template ?? null, cashAmount);
  };

  const paymentLabels: Record<string, string> = {
    cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nota Transaksi" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Receipt preview */}
        <div style={{ background: '#f5f5f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'center', overflowY: 'auto', maxHeight: '60vh' }}>
          <div style={{
            background: 'white',
            width: maxWidth,
            fontFamily: "'Courier New', monospace",
            fontSize: `${fontSize}px`,
            color: '#111',
            padding: `${(template?.margin_top ?? 0) * 4}px 12px ${(template?.margin_bottom ?? 0) * 4}px`,
            boxShadow: '0 2px 12px rgba(0,0,0,.1)',
          }}>

            {/* Logo / Nama toko */}
            {(template?.show_logo !== false) && (
              <div style={{ textAlign: logoAlign, marginBottom: 4 }}>
                {resolvedTenant?.logo_url
                  ? <img src={resolvedTenant.logo_url} alt="logo" style={{ maxHeight: 48, display: 'inline-block' }}/>
                  : <div style={{ fontWeight: 700, fontSize: fontSize + 2 }}>{resolvedTenant?.store_name ?? 'Kasir'}</div>
                }
              </div>
            )}

            {/* Header */}
            {template?.header && (
              <div style={{ textAlign: 'center', fontSize: fontSize - 1, whiteSpace: 'pre-line', marginBottom: 4 }}>
                {template.header}
              </div>
            )}

            <div style={{ borderTop: '1px dashed #aaa', margin: '5px 0' }}/>

            {/* Info order */}
            <div style={{ fontSize: fontSize - 1, marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>No</span><span>{order.order_number.slice(-10)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tgl</span><span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Jam</span><span>{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
              {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pelanggan</span><span>{order.customer_name}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bayar</span><span>{paymentLabels[order.payment_method] ?? order.payment_method}</span></div>
            </div>

            <div style={{ borderTop: '1px dashed #aaa', margin: '5px 0' }}/>

            {/* Items */}
            <div style={{ marginBottom: 4 }}>
              {(order.items ?? []).map((item: any, i: number) => (
                <div key={i} style={{ marginBottom: 4, fontSize: fontSize - 1 }}>
                  <div>{item.menu_name ?? item.menu?.name ?? ''}
                    {(template?.show_variations !== false) && (item.variation_name ?? item.variation?.option)
                      ? ` (${item.variation_name ?? item.variation?.option})` : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                    <span>{item.quantity} x {formatCurrency(item.price)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  {(template?.show_notes !== false) && item.notes && (
                    <div style={{ color: '#888', fontStyle: 'italic', fontSize: fontSize - 2 }}>* {item.notes}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #aaa', margin: '5px 0' }}/>

            {/* Total */}
            <div style={{ fontSize: fontSize - 1 }}>
              {template?.show_tax && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}><span>Subtotal</span><span>{formatCurrency(order.total_amount)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}><span>Pajak (10%)</span><span>{formatCurrency(order.total_amount * 0.1)}</span></div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>TOTAL</span>
                <span>{formatCurrency(template?.show_tax ? order.total_amount * 1.1 : order.total_amount)}</span>
              </div>
              {cashAmount != null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tunai</span><span>{formatCurrency(cashAmount)}</span></div>
                  {order.payment_method === 'cash' && change >= 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kembali</span><span>{formatCurrency(change)}</span></div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px dashed #aaa', margin: '5px 0' }}/>
            <div style={{ textAlign: 'center', fontSize: fontSize - 1, whiteSpace: 'pre-line' }}>
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

        {/* Info template */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa' }}>
          {template?.name ?? 'Template default'} · {paperWidth}
        </div>
      </div>
    </Modal>
  );
};
