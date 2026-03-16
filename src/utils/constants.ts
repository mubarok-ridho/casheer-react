export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer Bank' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'Operational', label: 'Operasional' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Salary', label: 'Gaji Karyawan' },
  { value: 'Utility', label: 'Utilities' },
  { value: 'Rent', label: 'Sewa' },
  { value: 'Maintenance', label: 'Perawatan' },
  { value: 'Other', label: 'Lainnya' },
];

export const PAPER_WIDTHS = [
  { value: '58mm', label: '58 mm (Thermal Kecil)' },
  { value: '80mm', label: '80 mm (Thermal Besar)' },
];

export const ORDER_STATUS = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const PAYMENT_STATUS = {
  pending: 'Menunggu',
  paid: 'Lunas',
  failed: 'Gagal',
};