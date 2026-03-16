import { useState, useEffect } from 'react';
import { ReceiptTemplate, Order, Tenant } from '../types';
import { reportApi } from '../api/report';

export const useReceipt = () => {
  const [defaultTemplate, setDefaultTemplate] = useState<ReceiptTemplate | null>(null);

  useEffect(() => {
    reportApi.getTemplates()
      .then((res: any) => {
        const list: ReceiptTemplate[] = Array.isArray(res) ? res : res.data ?? [];
        setDefaultTemplate(list.find(t => t.is_default) ?? list[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const printReceipt = (
    order: Order,
    tenant: Tenant | null | undefined,
    template: ReceiptTemplate | null | undefined,
    cashAmount?: number,
  ) => {
    const t          = template ?? defaultTemplate;
    const paperWidth = t?.paper_width ?? '58mm';
    const widthPx    = paperWidth === '58mm' ? '210px' : '290px';
    const fontSize   = t?.font_size   ?? 12;
    const marginTop  = (t?.margin_top    ?? 0) * 4;
    const marginBot  = (t?.margin_bottom ?? 0) * 4;
    const logoPos    = t?.logo_position ?? 'center';

    const fmt = (n: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const tax      = t?.show_tax ? order.total_amount * 0.1 : 0;
    const grand    = order.total_amount + tax;
    const change   = cashAmount != null ? cashAmount - grand : null;

    const itemsHtml = (order.items ?? []).map(item => `
      <div style="margin-bottom:5px">
        <div>${item.menu_name ?? (item as any).menu?.name ?? ''}${
          t?.show_variations && (item.variation_name ?? (item as any).variation?.option)
            ? ` (${item.variation_name ?? (item as any).variation?.option})`
            : ''
        }</div>
        <div style="display:flex;justify-content:space-between;color:#555">
          <span>${item.quantity} x ${fmt(item.price)}</span>
          <span>${fmt(item.subtotal)}</span>
        </div>
        ${t?.show_notes && item.notes ? `<div style="color:#888;font-style:italic;font-size:${fontSize - 2}px">* ${item.notes}</div>` : ''}
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Struk #${order.order_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', monospace;
    font-size: ${fontSize}px;
    width: ${widthPx};
    margin: 0 auto;
    padding: ${marginTop}px 8px ${marginBot}px;
    color: #111;
  }
  .row   { display: flex; justify-content: space-between; }
  .bold  { font-weight: bold; }
  .small { font-size: ${fontSize - 1}px; }
  .muted { color: #555; }
  .divider { border-top: 1px dashed #666; margin: 5px 0; }
  .center { text-align: center; }
  .${logoPos} { text-align: ${logoPos}; }
  img.logo { max-height: 48px; max-width: 100%; }
  @media print {
    body { margin: 0; }
    @page { size: ${paperWidth} auto; margin: 0mm; }
  }
</style>
</head>
<body>

${t?.show_logo ? `
<div class="${logoPos}" style="margin-bottom:5px">
  ${tenant?.logo_url
    ? `<img class="logo" src="${tenant.logo_url}" alt="logo">`
    : `<div class="bold" style="font-size:${fontSize + 2}px">${tenant?.store_name ?? 'Kasir'}</div>`
  }
</div>` : `<div class="bold center" style="margin-bottom:5px;font-size:${fontSize + 2}px">${tenant?.store_name ?? 'Kasir'}</div>`}

${t?.header ? `<div class="center small" style="white-space:pre-line;margin-bottom:5px">${t.header}</div>` : ''}

<div class="divider"></div>

<div class="small" style="margin-bottom:5px">
  <div class="row"><span>No</span><span>${order.order_number.slice(-10)}</span></div>
  <div class="row"><span>Tgl</span><span>${new Date(order.created_at).toLocaleDateString('id-ID')}</span></div>
  <div class="row"><span>Jam</span><span>${new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
  ${order.customer_name && order.customer_name !== 'Walk-in Customer'
    ? `<div class="row"><span>Pelanggan</span><span>${order.customer_name}</span></div>` : ''}
  <div class="row"><span>Bayar</span><span>${order.payment_method.toUpperCase()}</span></div>
</div>

<div class="divider"></div>

<div class="small" style="margin-bottom:5px">${itemsHtml}</div>

<div class="divider"></div>

<div class="small">
  ${t?.show_tax ? `
  <div class="row muted"><span>Subtotal</span><span>${fmt(order.total_amount)}</span></div>
  <div class="row muted"><span>Pajak (10%)</span><span>${fmt(tax)}</span></div>
  ` : ''}
  <div class="row bold"><span>TOTAL</span><span>${fmt(grand)}</span></div>
  ${cashAmount != null ? `
  <div class="row"><span>Tunai</span><span>${fmt(cashAmount)}</span></div>
  <div class="row"><span>Kembali</span><span>${fmt(Math.max(0, change ?? 0))}</span></div>
  ` : ''}
</div>

<div class="divider"></div>

<div class="center small" style="white-space:pre-line">${t?.footer ?? 'Terima kasih!'}</div>

</body>
</html>`;

    const win = window.open('', '_blank', `width=350,height=600,toolbar=0,menubar=0,location=0`);
    if (!win) {
      alert('Popup diblokir. Izinkan popup di browser untuk mencetak.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 800);
    };
  };

  return { defaultTemplate, printReceipt };
};
