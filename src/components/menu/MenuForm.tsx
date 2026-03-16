import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Menu, Category } from '../../types';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const C = {
  primary: '#5B8C5A', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: '#e8e4dc', red: '#E8604A',
};

const menuSchema = z.object({
  category_id: z.number().min(1, 'Kategori harus dipilih'),
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  description: z.string().optional(),
  base_price: z.number().min(1000, 'Harga minimal Rp 1.000'),
  prep_time: z.number().optional(),
  variations: z.array(z.object({
    name: z.string(),
    option: z.string(),
    price: z.number(),
  })).optional(),
});
type MenuFormValues = z.infer<typeof menuSchema>;

interface MenuFormProps {
  menu?: Menu | null;
  categories: Category[];
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({ menu, categories, onSave, onCancel }) => {
  // Track new files to upload
  const [newImages, setNewImages] = useState<File[]>([]);
  // Track existing image URLs (from menu) — shown as preview, kept unless removed
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    menu?.images?.map(img => img.image_url) || []
  );
  // New image previews (base64)
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu ? {
      category_id: Number(menu.category_id), // pastikan number
      name: menu.name,
      description: menu.description || '',
      base_price: menu.base_price,
      prep_time: menu.prep_time || 0,
      variations: menu.variations?.map(v => ({ name: v.name, option: v.option, price: v.price })) || [],
    } : { variations: [], prep_time: 0 },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variations' });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImageUrls.length + newImages.length + files.length;
    if (totalImages > 5) { toast.error('Maksimal 5 gambar'); return; }

    setNewImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MenuFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // ── Field dasar ─────────────────────────────────────────────────────
      formData.append('category_id', String(data.category_id)); // string di FormData, backend parse uint
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('base_price', String(data.base_price));
      formData.append('prep_time', String(data.prep_time || 0));
      // is_available: saat edit pertahankan nilai lama; saat create default true
      formData.append('is_available', menu ? String(menu.is_available) : 'true');

      // ── Variations ──────────────────────────────────────────────────────
      formData.append('variations', JSON.stringify(data.variations || []));

      // ── Gambar baru ─────────────────────────────────────────────────────
      newImages.forEach(img => formData.append('images', img));

      // ── Debug log ───────────────────────────────────────────────────────
      console.log('=== MenuForm submit ===');
      console.log('category_id:', data.category_id, typeof data.category_id);
      console.log('is_available:', menu?.is_available);
      for (const [k, v] of formData.entries()) {
        console.log(`  ${k}:`, v);
      }

      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImageCount = existingImageUrls.length + newImages.length;
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '9px',
    border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text,
    background: '#faf9f6', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
  };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700' as const, color: C.sub, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '6px' };
  const errorStyle = { margin: '4px 0 0', fontSize: '11px', color: C.red };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Kategori */}
      <div>
        <label style={labelStyle}>Kategori *</label>
        <select
          {...register('category_id', { valueAsNumber: true })}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.currentTarget.style.borderColor = C.primary}
          onBlur={e => e.currentTarget.style.borderColor = C.border}
        >
          <option value={0}>-- Pilih Kategori --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && <p style={errorStyle}>{errors.category_id.message}</p>}
      </div>

      {/* Nama */}
      <div>
        <label style={labelStyle}>Nama Menu *</label>
        <input {...register('name')} placeholder="Contoh: Kopi Susu" style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = C.primary}
          onBlur={e => e.currentTarget.style.borderColor = C.border} />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
      </div>

      {/* Deskripsi */}
      <div>
        <label style={labelStyle}>Deskripsi</label>
        <textarea {...register('description')} rows={2} placeholder="Deskripsi singkat menu..."
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.currentTarget.style.borderColor = C.primary}
          onBlur={e => e.currentTarget.style.borderColor = C.border} />
      </div>

      {/* Harga + Prep time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Harga Dasar *</label>
          <input {...register('base_price', { valueAsNumber: true })} type="number" placeholder="15000" style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = C.primary}
            onBlur={e => e.currentTarget.style.borderColor = C.border} />
          {errors.base_price && <p style={errorStyle}>{errors.base_price.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Waktu Saji (menit)</label>
          <input {...register('prep_time', { valueAsNumber: true })} type="number" placeholder="5" style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = C.primary}
            onBlur={e => e.currentTarget.style.borderColor = C.border} />
        </div>
      </div>

      {/* Gambar */}
      <div>
        <label style={labelStyle}>Gambar Menu <span style={{ color: C.sub, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({totalImageCount}/5)</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
          {/* Gambar lama */}
          {existingImageUrls.map((url, i) => (
            <div key={`existing-${i}`} style={{ position: 'relative' }}>
              <img src={url} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1.5px solid ${C.border}` }} />
              <div style={{ position: 'absolute', top: '3px', right: '3px', fontSize: '9px', background: 'rgba(91,140,90,0.85)', color: 'white', borderRadius: '4px', padding: '1px 4px' }}>lama</div>
              <button type="button" onClick={() => removeExistingImage(i)} style={{
                position: 'absolute', top: '-6px', left: '-6px', width: '20px', height: '20px',
                borderRadius: '50%', background: C.red, color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><XIcon /></button>
            </div>
          ))}

          {/* Gambar baru */}
          {newImagePreviews.map((src, i) => (
            <div key={`new-${i}`} style={{ position: 'relative' }}>
              <img src={src} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1.5px solid ${C.primary}` }} />
              <div style={{ position: 'absolute', top: '3px', right: '3px', fontSize: '9px', background: 'rgba(232,162,58,0.9)', color: 'white', borderRadius: '4px', padding: '1px 4px' }}>baru</div>
              <button type="button" onClick={() => removeNewImage(i)} style={{
                position: 'absolute', top: '-6px', left: '-6px', width: '20px', height: '20px',
                borderRadius: '50%', background: C.red, color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><XIcon /></button>
            </div>
          ))}

          {/* Upload button */}
          {totalImageCount < 5 && (
            <label style={{
              height: '80px', border: `2px dashed ${C.border}`, borderRadius: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub, gap: '4px', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.primary)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <ImageIcon />
              <span style={{ fontSize: '10px', fontWeight: 600 }}>Upload</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>
        {menu && existingImageUrls.length === 0 && newImages.length === 0 && (
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#E8A23A' }}>⚠ Semua gambar lama dihapus — upload gambar baru atau biarkan kosong</p>
        )}
      </div>

      {/* Variasi */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Variasi Menu</label>
          <button type="button" onClick={() => append({ name: '', option: '', price: 0 })} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            background: C.primaryLight, color: C.primary, border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
          }}>
            <PlusIcon /> Tambah Variasi
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fields.map((field, index) => (
            <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 32px', gap: '8px', alignItems: 'center' }}>
              <input {...register(`variations.${index}.name`)} placeholder="Nama (contoh: Ukuran)" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                onBlur={e => e.currentTarget.style.borderColor = C.border} />
              <input {...register(`variations.${index}.option`)} placeholder="Pilihan (contoh: Large)" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                onBlur={e => e.currentTarget.style.borderColor = C.border} />
              <input {...register(`variations.${index}.price`, { valueAsNumber: true })} type="number" placeholder="+Harga" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                onBlur={e => e.currentTarget.style.borderColor = C.border} />
              <button type="button" onClick={() => remove(index)} style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: '#fdecea', color: C.red, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><XIcon /></button>
            </div>
          ))}
          {fields.length === 0 && (
            <p style={{ fontSize: '12px', color: C.sub, textAlign: 'center', padding: '12px', background: '#faf9f6', borderRadius: '8px' }}>
              Tidak ada variasi — klik "Tambah Variasi" untuk menambah
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: `1.5px solid ${C.border}` }}>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 20px', borderRadius: '10px', border: `1.5px solid ${C.border}`,
          background: 'white', color: C.sub, cursor: 'pointer', fontSize: '13px', fontWeight: '700',
          fontFamily: "'DM Sans', sans-serif",
        }}>Batal</button>
        <button type="submit" disabled={isSubmitting} style={{
          padding: '10px 24px', borderRadius: '10px', border: 'none',
          background: isSubmitting ? '#a0b89f' : `linear-gradient(135deg, ${C.primary}, #7aae78)`,
          color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer',
          fontSize: '13px', fontWeight: '700', boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(91,140,90,0.3)',
          fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
        }}>
          {isSubmitting ? 'Menyimpan...' : menu ? 'Update Menu' : 'Simpan Menu'}
        </button>
      </div>
    </form>
  );
};