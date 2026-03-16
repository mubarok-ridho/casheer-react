interface PrintOptions {
  printerMAC: string;
  orderId: number;
  templateId?: number;
  copies?: number;
}

export const printReceipt = async (options: PrintOptions): Promise<boolean> => {
  try {
    // Ini akan dipanggil via API ke report service
    const response = await fetch(`${import.meta.env.VITE_REPORT_SERVICE_URL}/api/v1/print/receipt/${options.orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        printer_mac: options.printerMAC,
        template_id: options.templateId,
        copies: options.copies || 1,
      }),
    });

    if (!response.ok) {
      throw new Error('Print failed');
    }

    return true;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
};

export const testPrinter = async (printerMAC: string, paperWidth: string = '58mm'): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_REPORT_SERVICE_URL}/api/v1/print/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        printer_mac: printerMAC,
        paper_width: paperWidth,
      }),
    });

    if (!response.ok) {
      throw new Error('Test print failed');
    }

    return true;
  } catch (error) {
    console.error('Test print error:', error);
    return false;
  }
};