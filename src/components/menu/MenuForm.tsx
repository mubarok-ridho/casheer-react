import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Lottie from 'lottie-react';
import lottieTree from '../../assets/Loadingpohon.json';
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
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const C = {
  primary: '#5B8C5A', primaryLight: '#ebf4eb', primaryDark: '#3d5e3c',
  text: '#2a2420', sub: '#8a8278', border: '#e8e4dc', red: '#E8604A',
};

// ── Schema — base_price nullable ───────────────────────────────────────────────
const menuSchema = z.object({
  category_id: z.number().min(1, 'Kategori harus dipilih'),
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  description: z.string().optional(),
  // nullable: kosong → 0
  base_price: z.number().nullable().optional(),
  prep_time: z.number().nullable().optional(),
  variations: z.array(z.object({
    name: z.string(),
    option: z.string(),
    // nullable: kosong → 0
    price: z.number().nullable().optional(),
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
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    menu?.images?.map(img => img.image_url) || []
  );
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu ? {
      category_id: Number(menu.category_id),
      name: menu.name,
      description: menu.description || '',
      // tampilkan harga yang sudah ada; kalau edit, isi nilainya
      base_price: menu.base_price || undefined,
      prep_time: menu.prep_time || undefined,
      variations: menu.variations?.map(v => ({
        name: v.name,
        option: v.option,
        price: v.price || undefined,
      })) || [],
    } : {
      // saat tambah baru: kosongkan semua angka
      variations: [],
      base_price: undefined,
      prep_time: undefined,
    },
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

  const removeExistingImage = (index: number) =>
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MenuFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category_id', String(data.category_id));
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      // nullable → kirim 0 ke backend kalau kosong
      formData.append('base_price', String(data.base_price ?? 0));
      formData.append('prep_time', String(data.prep_time ?? 0));
      formData.append('is_available', menu ? String(menu.is_available) : 'true');
      formData.append('variations', JSON.stringify(
        (data.variations || []).map(v => ({ ...v, price: v.price ?? 0 }))
      ));
      newImages.forEach(img => formData.append('images', img));
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImageCount = existingImageUrls.length + newImages.length;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text,
    background: '#faf9f6', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const focusIn  = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = C.primary;
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,140,90,0.1)';
  };
  const focusOut = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = 'none';
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, color: C.sub,
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px',
  };
  const errorStyle: React.CSSProperties = { margin: '4px 0 0', fontSize: '11px', color: C.red };

  return (
    <>
      {/* ── Fullscreen saving overlay ── */}
      {isSubmitting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(244,240,232,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px',
            padding: '36px 48px', textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
            border: '1px solid rgba(91,140,90,0.12)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            animation: 'mfCardIn 0.28s cubic-bezier(0.34,1.1,0.64,1)',
          }}>
            <Lottie animationData={lottieTree} loop autoplay style={{ width: 160, height: 160 }} />
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: 700,
              color: C.text, marginTop: '4px',
            }}>
              {menu ? 'Menyimpan perubahan...' : 'Menambahkan menu...'}
            </p>
            <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: C.primary, opacity: 0,
                  animation: `mfBlink 1.4s ease-in-out ${i * 0.2}s infinite`,
                  display: 'block',
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mfCardIn { from{opacity:0;transform:scale(0.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes mfBlink  { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .mf-input:focus { border-color: ${C.primary} !important; box-shadow: 0 0 0 3px rgba(91,140,90,0.1) !important; }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)} style={{
        display: 'flex', flexDirection: 'column', gap: '20px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>

        {/* ── Kategori ── */}
        <div>
          <label style={labelStyle}>Kategori *</label>
          <select
            {...register('category_id', { valueAsNumber: true })}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusIn} onBlur={focusOut}
          >
            <option value={0}>-- Pilih Kategori --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <p style={errorStyle}>{errors.category_id.message}</p>}
        </div>

        {/* ── Nama ── */}
        <div>
          <label style={labelStyle}>Nama Menu *</label>
          <input
            {...register('name')}
            placeholder="Contoh: Kopi Susu"
            style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        {/* ── Deskripsi ── */}
        <div>
          <label style={labelStyle}>Deskripsi</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Deskripsi singkat menu..."
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={focusIn} onBlur={focusOut}
          />
        </div>

        {/* ── Harga + Prep time ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              Harga Dasar
              <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, marginLeft: 4, color: '#b0a898' }}>
                (opsional)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '12px', fontWeight: 700, color: '#b0a898', pointerEvents: 'none',
              }}>Rp</span>
              <input
                {...register('base_price', { setValueAs: v => v === '' || v === null ? null : Number(v) })}
                type="number"
                placeholder="0"
                min="0"
                style={{ ...inputStyle, paddingLeft: '34px' }}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            {errors.base_price && <p style={errorStyle}>{errors.base_price.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>
              Waktu Saji
              <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, marginLeft: 4, color: '#b0a898' }}>
                (menit)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('prep_time', { setValueAs: v => v === '' || v === null ? null : Number(v) })}
                type="number"
                placeholder="5"
                min="0"
                style={{ ...inputStyle, paddingRight: '40px' }}
                onFocus={focusIn} onBlur={focusOut}
              />
              <span style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '11px', color: '#b0a898', pointerEvents: 'none',
              }}>mnt</span>
            </div>
          </div>
        </div>

        {/* ── Gambar ── */}
        <div>
          <label style={labelStyle}>
            Gambar Menu{' '}
            <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#b0a898' }}>
              ({totalImageCount}/5)
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '10px' }}>
            {existingImageUrls.map((url, i) => (
              <div key={`e-${i}`} style={{ position: 'relative' }}>
                <img src={url} style={{ width: '100%', height: '82px', objectFit: 'cover', borderRadius: '10px', border: `1.5px solid ${C.border}` }} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '9px', background: 'rgba(91,140,90,0.88)', color: 'white', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>lama</div>
                <button type="button" onClick={() => removeExistingImage(i)} style={{
                  position: 'absolute', top: '-7px', left: '-7px', width: '22px', height: '22px',
                  borderRadius: '50%', background: C.red, color: 'white', border: '2px solid white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}><XIcon /></button>
              </div>
            ))}
            {newImagePreviews.map((src, i) => (
              <div key={`n-${i}`} style={{ position: 'relative' }}>
                <img src={src} style={{ width: '100%', height: '82px', objectFit: 'cover', borderRadius: '10px', border: `2px solid ${C.primary}` }} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '9px', background: 'rgba(232,162,58,0.92)', color: 'white', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>baru</div>
                <button type="button" onClick={() => removeNewImage(i)} style={{
                  position: 'absolute', top: '-7px', left: '-7px', width: '22px', height: '22px',
                  borderRadius: '50%', background: C.red, color: 'white', border: '2px solid white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}><XIcon /></button>
              </div>
            ))}
            {totalImageCount < 5 && (
              <label style={{
                height: '82px', border: `2px dashed ${C.border}`, borderRadius: '10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.sub, gap: '5px', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = C.primary; (e.currentTarget as HTMLLabelElement).style.background = C.primaryLight; }}
                onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = C.border; (e.currentTarget as HTMLLabelElement).style.background = 'transparent'; }}
              >
                <ImageIcon />
                <span style={{ fontSize: '10px', fontWeight: 700 }}>Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          {menu && existingImageUrls.length === 0 && newImages.length === 0 && (
            <p style={{ margin: '7px 0 0', fontSize: '11px', color: '#E8A23A', display: 'flex', alignItems: 'center', gap: '5px' }}>
              ⚠ Semua gambar lama dihapus — upload gambar baru atau biarkan kosong
            </p>
          )}
        </div>

        {/* ── Variasi ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Variasi Menu</label>
            <button
              type="button"
              onClick={() => append({ name: '', option: '', price: undefined })}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                background: C.primaryLight, color: C.primary, border: `1px solid rgba(91,140,90,0.2)`,
                borderRadius: '9px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#d8edd8'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight}
            >
              <PlusIcon /> Tambah Variasi
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fields.map((field, index) => (
              <div key={field.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 110px 34px',
                gap: '8px', alignItems: 'center',
                background: '#faf9f6', borderRadius: '10px', padding: '10px',
                border: `1px solid ${C.border}`,
              }}>
                <input
                  {...register(`variations.${index}.name`)}
                  placeholder="Nama grup (mis: Ukuran)"
                  style={{ ...inputStyle, fontSize: '12px' }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <input
                  {...register(`variations.${index}.option`)}
                  placeholder="Pilihan (mis: Large)"
                  style={{ ...inputStyle, fontSize: '12px' }}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '11px', color: '#b0a898', pointerEvents: 'none', fontWeight: 600,
                  }}>+Rp</span>
                  <input
                    {...register(`variations.${index}.price`, { setValueAs: v => v === '' || v === null ? null : Number(v) })}
                    type="number"
                    placeholder="0"
                    min="0"
                    style={{ ...inputStyle, fontSize: '12px', paddingLeft: '34px' }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '9px', border: 'none',
                    background: '#fdecea', color: C.red, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fddad4'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#fdecea'}
                ><XIcon /></button>
              </div>
            ))}
            {fields.length === 0 && (
              <div style={{
                fontSize: '12px', color: C.sub, textAlign: 'center',
                padding: '14px', background: '#faf9f6', borderRadius: '10px',
                border: `1.5px dashed ${C.border}`,
              }}>
                Belum ada variasi — klik "Tambah Variasi" untuk menambah
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          paddingTop: '16px', borderTop: `1.5px solid ${C.border}`,
          marginTop: '4px',
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '11px 22px', borderRadius: '11px',
              border: `1.5px solid ${C.border}`,
              background: 'white', color: C.sub, cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f2ed'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'white'}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '11px 28px', borderRadius: '11px', border: 'none',
              background: isSubmitting ? '#a0b89f' : 'linear-gradient(135deg, #4a7949, #5B8C5A)',
              color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: 700,
              boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(91,140,90,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '7px',
            }}
          >
            {isSubmitting ? (
              <>
                <Lottie animationData={lottieTree} loop autoplay style={{ width: 20, height: 20 }} />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckIcon />
                {menu ? 'Update Menu' : 'Simpan Menu'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};