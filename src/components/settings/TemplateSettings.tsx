import React, { useState } from 'react';
import { ReceiptTemplate } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PencilIcon, TrashIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import toast from 'react-hot-toast';

interface TemplateSettingsProps {
  templates: ReceiptTemplate[];
  onRefresh: () => void;
  isLoading: boolean;
  storeName?: string;
  logoUrl?: string;
}

const DEFAULT_FORM = {
  name: "",
  description: "",
  header: "",
  footer: "",
  show_logo: true,
  show_tax: false,
  show_discount: false,
  show_variations: true,
  show_notes: true,
  paper_width: "58mm",
  font_size: 12,
  logo_position: "center",
  margin_top: 0,
  margin_bottom: 0,
};

const SAMPLE_ORDER = {
  order_number: "ORD-20260304-ABC12345",
  customer_name: "Budi Santoso",
  created_at: new Date().toISOString(),
  payment_method: "cash",
  total_amount: 45000,
  items: [
    { menu_name: "Kopi Susu", variation_name: "Besar", quantity: 2, price: 15000, subtotal: 30000, notes: "Less sugar" },
    { menu_name: "Roti Bakar", variation_name: "", quantity: 1, price: 15000, subtotal: 15000, notes: "" },
  ],
};

const formatCurrency = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

interface PreviewProps {
  form: typeof DEFAULT_FORM;
  storeName?: string;
  logoUrl?: string;
}

const ReceiptPreview: React.FC<PreviewProps> = ({ form, storeName, logoUrl }) => {
  const width = form.paper_width === "58mm" ? "200px" : "280px";
  const logoAlign = form.logo_position === "left" ? "text-left" : form.logo_position === "right" ? "text-right" : "text-center";

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex justify-center overflow-y-auto max-h-[600px]">
      <div
        className="bg-white shadow-md p-3 font-mono text-gray-800"
        style={{ width, fontSize: `${form.font_size}px`, paddingTop: `${form.margin_top * 4}px`, paddingBottom: `${form.margin_bottom * 4}px` }}
      >
        {/* Logo / Store Name */}
        {form.show_logo && (
          <div className={`mb-1 ${logoAlign}`}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ maxHeight: "48px", display: "inline-block" }} />
            ) : (
              <div className="font-bold" style={{ fontSize: `${form.font_size + 2}px` }}>{storeName || "Nama Toko"}</div>
            )}
          </div>
        )}

        {/* Header */}
        {form.header && (
          <div className="text-center whitespace-pre-line mb-1" style={{ fontSize: `${form.font_size - 1}px` }}>
            {form.header}
          </div>
        )}

        <div className="border-t border-dashed border-gray-400 my-1" />

        {/* Order Info */}
        <div className="space-y-0.5 mb-1" style={{ fontSize: `${form.font_size - 1}px` }}>
          <div className="flex justify-between"><span>No</span><span>{SAMPLE_ORDER.order_number.slice(-8)}</span></div>
          <div className="flex justify-between"><span>Tgl</span><span>{new Date(SAMPLE_ORDER.created_at).toLocaleDateString("id-ID")}</span></div>
          <div className="flex justify-between"><span>Jam</span><span>{new Date(SAMPLE_ORDER.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div className="flex justify-between"><span>Pelanggan</span><span>{SAMPLE_ORDER.customer_name}</span></div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-1" />

        {/* Items */}
        <div className="space-y-1 mb-1">
          {SAMPLE_ORDER.items.map((item, i) => (
            <div key={i} style={{ fontSize: `${form.font_size - 1}px` }}>
              <div>{item.menu_name}{form.show_variations && item.variation_name ? ` (${item.variation_name})` : ""}</div>
              <div className="flex justify-between text-gray-500">
                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
              {form.show_notes && item.notes && (
                <div className="text-gray-400 italic">* {item.notes}</div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-1" />

        {/* Total */}
        <div style={{ fontSize: `${form.font_size - 1}px` }} className="space-y-0.5">
          {form.show_tax && (
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(SAMPLE_ORDER.total_amount)}</span></div>
          )}
          {form.show_tax && (
            <div className="flex justify-between text-gray-500"><span>Pajak (10%)</span><span>{formatCurrency(SAMPLE_ORDER.total_amount * 0.1)}</span></div>
          )}
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(form.show_tax ? SAMPLE_ORDER.total_amount * 1.1 : SAMPLE_ORDER.total_amount)}</span>
          </div>
          <div className="flex justify-between"><span>Tunai</span><span>{formatCurrency(50000)}</span></div>
          <div className="flex justify-between"><span>Kembali</span><span>{formatCurrency(form.show_tax ? 50000 - SAMPLE_ORDER.total_amount * 1.1 : 5000)}</span></div>
        </div>

        {/* Footer */}
        {form.footer && (
          <>
            <div className="border-t border-dashed border-gray-400 my-1" />
            <div className="text-center whitespace-pre-line" style={{ fontSize: `${form.font_size - 1}px` }}>{form.footer}</div>
          </>
        )}
        {!form.footer && (
          <>
            <div className="border-t border-dashed border-gray-400 my-1" />
            <div className="text-center" style={{ fontSize: `${form.font_size - 1}px` }}>Terima kasih!</div>
          </>
        )}
      </div>
    </div>
  );
};

export const TemplateSettings: React.FC<TemplateSettingsProps> = ({ templates, onRefresh, isLoading, storeName, logoUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplate | null>(null);
  const [formData, setFormData] = useState<typeof DEFAULT_FORM>({ ...DEFAULT_FORM });
  const [previewMode, setPreviewMode] = useState(false);

  const set = (key: string, value: any) => setFormData(f => ({ ...f, [key]: value }));

  const handleEdit = (template: ReceiptTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      header: template.header,
      footer: template.footer,
      show_logo: template.show_logo,
      show_tax: template.show_tax,
      show_discount: template.show_discount,
      show_variations: template.show_variations ?? true,
      show_notes: template.show_notes ?? true,
      paper_width: template.paper_width,
      font_size: template.font_size,
      logo_position: template.logo_position ?? "center",
      margin_top: template.margin_top ?? 0,
      margin_bottom: template.margin_bottom ?? 0,
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setFormData({ ...DEFAULT_FORM });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus template ini?")) return;
    try {
      await reportApi.deleteTemplate(id);
      toast.success("Template dihapus");
      onRefresh();
    } catch { toast.error("Gagal menghapus template"); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await reportApi.setDefaultTemplate(id);
      toast.success("Template default diubah");
      onRefresh();
    } catch { toast.error("Gagal mengubah template default"); }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error("Nama template harus diisi"); return; }
    try {
      if (selectedTemplate) {
        await reportApi.updateTemplate(selectedTemplate.id, formData);
        toast.success("Template diupdate");
      } else {
        await reportApi.createTemplate(formData);
        toast.success("Template ditambahkan");
      }
      setIsEditing(false);
      onRefresh();
    } catch { toast.error("Gagal menyimpan template"); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{selectedTemplate ? "Edit Template" : "Tambah Template Baru"}</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPreviewMode(p => !p)}>
              <EyeIcon className="h-4 w-4 mr-1" />
              {previewMode ? "Sembunyikan Preview" : "Tampilkan Preview"}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit}>Simpan</Button>
          </div>
        </div>

        <div className={`grid gap-6 ${previewMode ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Form */}
          <div className="space-y-4">
            {/* Basic */}
            <Card>
              <h3 className="font-medium text-gray-700 mb-3">Informasi Template</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Template *</label>
                  <input type="text" value={formData.name} onChange={e => set("name", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <input type="text" value={formData.description} onChange={e => set("description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </Card>

            {/* Layout */}
            <Card>
              <h3 className="font-medium text-gray-700 mb-3">Layout & Ukuran</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lebar Kertas</label>
                  <select value={formData.paper_width} onChange={e => set("paper_width", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="58mm">58 mm</option>
                    <option value="80mm">80 mm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Font</label>
                  <input type="number" value={formData.font_size} onChange={e => set("font_size", parseInt(e.target.value))} min={8} max={16} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margin Atas</label>
                  <input type="number" value={formData.margin_top} onChange={e => set("margin_top", parseInt(e.target.value))} min={0} max={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margin Bawah</label>
                  <input type="number" value={formData.margin_bottom} onChange={e => set("margin_bottom", parseInt(e.target.value))} min={0} max={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </Card>

            {/* Logo */}
            <Card>
              <h3 className="font-medium text-gray-700 mb-3">Logo & Nama Toko</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.show_logo} onChange={e => set("show_logo", e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-gray-700">Tampilkan Nama Toko / Logo</span>
                </label>
                {formData.show_logo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posisi Logo</label>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map(pos => (
                        <button key={pos} onClick={() => set("logo_position", pos)}
                          className={`flex-1 py-2 border rounded-lg text-sm capitalize ${formData.logo_position === pos ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-200 hover:border-gray-300"}`}>
                          {pos === "left" ? "Kiri" : pos === "center" ? "Tengah" : "Kanan"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Content */}
            <Card>
              <h3 className="font-medium text-gray-700 mb-3">Konten Nota</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                  <textarea value={formData.header} onChange={e => set("header", e.target.value)} rows={2} placeholder="Contoh: Jl. Merdeka No. 1&#10;Telp: 08123456789" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
                  <textarea value={formData.footer} onChange={e => set("footer", e.target.value)} rows={2} placeholder="Contoh: Terima kasih telah berkunjung!&#10;Instagram: @namatoko" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </Card>

            {/* Display Options */}
            <Card>
              <h3 className="font-medium text-gray-700 mb-3">Opsi Tampilan</h3>
              <div className="space-y-2">
                {[
                  { key: "show_variations", label: "Tampilkan variasi menu" },
                  { key: "show_notes", label: "Tampilkan catatan item" },
                  { key: "show_tax", label: "Tampilkan pajak" },
                  { key: "show_discount", label: "Tampilkan diskon" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={(formData as any)[key]} onChange={e => set(key, e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Live Preview */}
          {previewMode && (
            <div className="sticky top-0">
              <h3 className="font-medium text-gray-700 mb-3">Preview Nota</h3>
              <ReceiptPreview form={formData} storeName={storeName} logoUrl={logoUrl} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Template Nota</h2>
        <Button onClick={handleNew} variant="primary">Tambah Template</Button>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">Belum ada template nota</p>
          <Button onClick={handleNew} variant="primary">Buat Template Pertama</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              {template.is_default && (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />Default
                </div>
              )}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {template.description && <p className="text-sm text-gray-600">{template.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.paper_width}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Font {template.font_size}px</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Logo {template.logo_position ?? "center"}</span>
                </div>
                {template.header && <p className="text-xs text-gray-500 truncate">Header: {template.header}</p>}
                <div className="flex gap-2 mt-4">
                  {!template.is_default && (
                    <Button onClick={() => handleSetDefault(template.id)} variant="secondary" size="sm">Set Default</Button>
                  )}
                  <Button onClick={() => handleEdit(template)} variant="secondary" size="sm">
                    <PencilIcon className="h-4 w-4 mr-1" />Edit
                  </Button>
                  {!template.is_default && (
                    <Button onClick={() => handleDelete(template.id)} variant="danger" size="sm">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
