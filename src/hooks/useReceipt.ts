import { useState, useEffect } from 'react';
import { ReceiptTemplate, Order, Tenant } from '../types';
import { reportApi } from '../api/report';
import { settingsApi } from '../api/ingredient';

export const useReceipt = () => {
  const [defaultTemplate, setDefaultTemplate] = useState<ReceiptTemplate | null>(null);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    reportApi.getTemplates()
      .then((res: any) => {
        const list: ReceiptTemplate[] = Array.isArray(res) ? res : res.data ?? [];
        setDefaultTemplate(list.find(t => t.is_default) ?? list[0] ?? null);
      })
      .catch(() => {});

    settingsApi.get()
      .then(s => setTaxRate(s.tax_rate ?? 0))
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
    const fontSize   = t?.font_size ?? 12;
    const marginTop  = (t?.margin_top ?? 0) * 4;
    const marginBot  = (t?.margin_bottom ?? 0) * 4;
    const logoPos    = t?.logo_position ?? 'center';
    const logoAlign  = logoPos === 'left' ? 'left' : logoPos === 'right' ? 'right' : 'center';

    const fmt = (n: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const discount     = (order as any).discount_amount ?? 0;
    const discountType = (order as any).discount_type ?? '';
    const subtotalBeforeDiscount = discount > 0 ? order.total_amount + discount : order.total_amount;
    const effectiveTaxRate = t?.show_tax ? (taxRate > 0 ? taxRate : 0) : 0;
    const taxAmount    = order.total_amount * (effectiveTaxRate / 100);
    const grand        = order.total_amount + taxAmount;
    const change       = cashAmount != null ? cashAmount - grand : null;

    const itemsHtml = (order.items ?? []).map(item => `
      <div style="margin-bottom:5px">
        <div style="font-weight:normal">${item.menu_name ?? (item as any).menu?.name ?? ''}${
          t?.show_variations !== false && (item.variation_name ?? (item as any).variation?.option)
            ? ` (${item.variation_name ?? (item as any).variation?.option})`
            : ''
        }</div>
        <div style="display:flex;justify-content:space-between;color:#555;font-size:${fontSize - 1}px">
          <span>${item.quantity} x ${fmt(item.price)}</span>
          <span>${fmt(item.subtotal)}</span>
        </div>
        ${t?.show_notes !== false && item.notes
          ? `<div style="color:#888;font-style:italic;font-size:${fontSize - 2}px">* ${item.notes}</div>`
          : ''}
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
    padding: ${marginTop}px 10px ${marginBot + 20}px;
    color: #111;
  }
  .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .bold { font-weight: bold; }
  .center { text-align: center; }
  .divider { border: none; border-top: 1px dashed #888; margin: 6px 0; }
  img.logo { max-height: 52px; max-width: 90%; }
  @media print {
    html, body { width: ${widthPx}; }
    body { margin: 0; padding: ${marginTop}px 10px ${marginBot + 20}px; }
    @page { size: ${paperWidth} auto; margin: 0; }
  }
</style>
</head>
<body>

${t?.show_logo !== false ? `
<div style="text-align:${logoAlign};margin-bottom:6px">
  ${tenant?.logo_url
    ? `<img class="logo" src="${tenant.logo_url}" alt="logo">`
    : `<div class="bold" style="font-size:${fontSize + 3}px">${tenant?.store_name ?? 'Kasir'}</div>`
  }
</div>` : `<div class="bold center" style="font-size:${fontSize + 3}px;margin-bottom:6px">${tenant?.store_name ?? 'Kasir'}</div>`}

${t?.header ? `<div class="center" style="font-size:${fontSize - 1}px;white-space:pre-line;margin-bottom:6px">${t.header}</div>` : ''}

<hr class="divider">

<div style="font-size:${fontSize - 1}px;margin-bottom:4px">
  <div class="row"><span>No</span><span>${order.order_number.slice(-10)}</span></div>
  <div class="row"><span>Tgl</span><span>${new Date(order.created_at).toLocaleDateString('id-ID')}</span></div>
  <div class="row"><span>Jam</span><span>${new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
  ${order.customer_name && order.customer_name !== 'Walk-in Customer'
    ? `<div class="row"><span>Pelanggan</span><span>${order.customer_name}</span></div>` : ''}
  <div class="row"><span>Bayar</span><span>${order.payment_method.toUpperCase()}</span></div>
</div>

<hr class="divider">

<div style="margin-bottom:4px">${itemsHtml}</div>

<hr class="divider">

<div style="font-size:${fontSize - 1}px">
  ${discount > 0 && t?.show_discount !== false ? `
  <div class="row"><span>Subtotal</span><span>${fmt(subtotalBeforeDiscount)}</span></div>
  <div class="row" style="color:#a06010"><span>Diskon${discountType === 'percent' ? '' : ''}</span><span>-${fmt(discount)}</span></div>
  ` : ''}
  ${effectiveTaxRate > 0 ? `
  <div class="row" style="color:#555"><span>Subtotal</span><span>${fmt(order.total_amount)}</span></div>
  <div class="row" style="color:#555"><span>Pajak (${effectiveTaxRate}%)</span><span>${fmt(taxAmount)}</span></div>
  ` : ''}
  <div class="row bold" style="font-size:${fontSize + 1}px;margin-top:3px;padding-top:3px;border-top:1px solid #333">
    <span>TOTAL</span><span>${fmt(grand)}</span>
  </div>
  ${cashAmount != null ? `
  <div class="row"><span>Tunai</span><span>${fmt(cashAmount)}</span></div>
  <div class="row"><span>Kembali</span><span>${fmt(Math.max(0, change ?? 0))}</span></div>
  ` : ''}
</div>

<hr class="divider">

<div class="center" style="font-size:${fontSize - 1}px;white-space:pre-line;padding-bottom:16px">${t?.footer ?? 'Terima kasih!'}</div>

</body>
</html>`;

    const win = window.open('', '_blank', `width=380,height=650,toolbar=0,menubar=0,location=0,scrollbars=1`);
    if (!win) {
      alert('Popup diblokir. Izinkan popup di browser untuk mencetak.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      setTimeout(() => {
        win.print();
        setTimeout(() => win.close(), 1000);
      }, 300);
    };
  };

  return { defaultTemplate, taxRate, printReceipt };
};
