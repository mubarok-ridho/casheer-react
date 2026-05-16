import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { settingsApi } from '../../api/ingredient';
import Lottie from 'lottie-react';
import lottieTree from '../../assets/Loadingpohon.json';
import toast from 'react-hot-toast';

const C = {
  primary: '#5B8C5A', primaryLight: '#ebf4eb', primaryDark: '#3d5e3c',
  text: '#1e1a14', sub: '#8a8278', border: '#e8e4dc',
  orange: '#e8622a', red: '#E8604A', redLight: '#fdecea',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text,
  background: '#faf9f6', outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{
    display: 'block', fontSize: '11px', fontWeight: '700', color: C.sub,
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em',
  }}>{children}</label>
);

export const StoreSettings: React.FC = () => {
  const { tenant } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [taxLoading, setTaxLoading] = useState(false);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const [formData, setFormData] = useState({
    store_name: '', store_phone: '', store_email: '',
    store_address: '', receipt_width: '58mm',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        store_name: tenant.store_name || '',
        store_phone: tenant.store_phone || '',
        store_email: tenant.store_email || '',
        store_address: (tenant as any).store_address || '',
        receipt_width: tenant.receipt_width || '58mm',
      });
      setLogoPreview(tenant.logo_url || '');
    }
    settingsApi.get().then(s => setTaxRate(s.tax_rate ?? 0)).catch(() => {});
  }, [tenant]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran — max 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file max 2MB. Kompres gambar terlebih dahulu.');
      return;
    }
    // Validasi format
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan (JPG, PNG, WebP)');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setLogoUploading(true);
    try {
      await authApi.uploadLogo(logoFile);
      toast.success('Logo berhasil diperbarui!');
      setLogoFile(null); // reset — sudah tersimpan
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Gagal upload logo';
      toast.error(msg);
      // Revert preview ke logo lama
      setLogoPreview(tenant?.logo_url || '');
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCancelLogo = () => {
    setLogoFile(null);
    setLogoPreview(tenant?.logo_url || '');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.updateStoreSetup(formData);
      toast.success('Pengaturan toko disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTax = async () => {
    setTaxLoading(true);
    try {
      const current = await settingsApi.get();
      await settingsApi.update({ ...current, tax_rate: taxRate });
      toast.success('Tax rate disimpan');
    } catch {
      toast.error('Gagal menyimpan tax rate');
    } finally {
      setTaxLoading(false);
    }
  };

  const hasLogoChange = !!logoFile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Logo Card ── */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.text }}>Logo Toko</h3>
            <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>Ditampilkan di nota dan halaman public menu</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {/* Logo preview + click to change */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => !logoUploading && fileRef.current?.click()}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              style={{
                width: '96px', height: '96px', borderRadius: '16px', overflow: 'hidden', cursor: logoUploading ? 'not-allowed' : 'pointer',
                border: `2px solid ${hasLogoChange ? C.orange : C.border}`,
                background: '#f5f2ed', position: 'relative',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: logoHovered && !logoUploading ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <svg width="24" height="24" fill="none" stroke={C.sub} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ fontSize: '9px', color: C.sub, fontWeight: '600' }}>No Logo</span>
                </div>
              )}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                opacity: logoHovered && !logoUploading ? 1 : 0, transition: 'opacity 0.2s', color: 'white',
              }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                <span style={{ fontSize: '9px', fontWeight: '700' }}>Ganti</span>
              </div>
              {/* Loading overlay */}
              {logoUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lottie animationData={lottieTree} loop autoplay style={{ width: 48, height: 48 }} />
                </div>
              )}
              {/* Pending badge */}
              {hasLogoChange && !logoUploading && (
                <div style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', background: C.orange, border: '2px solid white' }} />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoSelect} style={{ display: 'none' }} />
          </div>

          {/* Info + actions */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            {!hasLogoChange ? (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.text, fontWeight: '600' }}>
                  {logoPreview ? 'Logo terpasang' : 'Belum ada logo'}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.sub, lineHeight: 1.5 }}>
                  Format: JPG, PNG, WebP · Max 2MB<br/>
                  Klik gambar untuk mengganti logo
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', border: `1.5px solid ${C.border}`, borderRadius: '10px',
                    background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                    color: C.sub, fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; (e.currentTarget as HTMLButtonElement).style.color = C.primary; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.sub; }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  {logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                </button>
              </>
            ) : (
              <>
                <div style={{ background: '#fff8e8', border: '1px solid rgba(232,162,58,0.3)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: '#8a6010' }}>Logo baru dipilih</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#a07020' }}>
                    {logoFile?.name} · {((logoFile?.size ?? 0) / 1024).toFixed(0)} KB
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#a07020' }}>Klik "Simpan Logo" untuk menerapkan perubahan</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCancelLogo}
                    style={{
                      padding: '8px 14px', border: `1.5px solid ${C.border}`, borderRadius: '10px',
                      background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                      color: C.sub, fontFamily: 'inherit',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLogoUpload}
                    disabled={logoUploading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', border: 'none', borderRadius: '10px',
                      background: C.primary, cursor: logoUploading ? 'not-allowed' : 'pointer',
                      fontSize: '12px', fontWeight: '700', color: 'white', fontFamily: 'inherit',
                      opacity: logoUploading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(91,140,90,0.3)',
                    }}
                  >
                    {logoUploading ? (
                      <><Lottie animationData={lottieTree} loop autoplay style={{ width: 16, height: 16 }} /> Mengupload...</>
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Simpan Logo
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Info Toko Card ── */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.text }}>Informasi Toko</h3>
            <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>Nama, kontak, dan alamat toko Anda</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <FieldLabel>Nama Toko *</FieldLabel>
              <input style={inputStyle} value={formData.store_name} required
                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = C.primary; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(91,140,90,0.1)'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = C.border; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel>No. Telepon</FieldLabel>
                <input style={inputStyle} value={formData.store_phone}
                  onChange={e => setFormData({ ...formData, store_phone: e.target.value })}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = C.primary; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(91,140,90,0.1)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = C.border; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input style={inputStyle} type="email" value={formData.store_email}
                  onChange={e => setFormData({ ...formData, store_email: e.target.value })}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = C.primary; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(91,140,90,0.1)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = C.border; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Alamat</FieldLabel>
              <textarea value={formData.store_address} rows={2}
                onChange={e => setFormData({ ...formData, store_address: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' as const }}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = C.primary; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(91,140,90,0.1)'; }}
                onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = C.border; (e.target as HTMLTextAreaElement).style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <FieldLabel>Lebar Kertas Nota</FieldLabel>
              <select value={formData.receipt_width}
                onChange={e => setFormData({ ...formData, receipt_width: e.target.value })}
                style={{ ...inputStyle }}>
                <option value="58mm">58 mm (Thermal Kecil)</option>
                <option value="80mm">80 mm (Thermal Besar)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button type="submit" disabled={isLoading} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '11px 24px', border: 'none', borderRadius: '11px', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                color: 'white', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
                opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(91,140,90,0.28)',
                transition: 'all 0.2s',
              }}>
                {isLoading ? (
                  <><Lottie animationData={lottieTree} loop autoplay style={{ width: 16, height: 16 }} /> Menyimpan...</>
                ) : (
                  <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Simpan Perubahan</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Pajak Card ── */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fff8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8a23a' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.text }}>Pajak (PPN)</h3>
            <p style={{ margin: 0, fontSize: '12px', color: C.sub }}>Ditampilkan di nota jika template mengaktifkan pajak. Set 0 untuk nonaktif.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="number" value={taxRate} min={0} max={100} step={0.5}
              onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, width: '100px', paddingRight: '28px', textAlign: 'center' }}
            />
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: '700', color: C.sub }}>%</span>
          </div>
          <button onClick={handleSaveTax} disabled={taxLoading} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: taxLoading ? 'not-allowed' : 'pointer',
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            color: 'white', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
            opacity: taxLoading ? 0.7 : 1, boxShadow: '0 3px 10px rgba(91,140,90,0.25)',
          }}>
            {taxLoading
              ? <><Lottie animationData={lottieTree} loop autoplay style={{ width: 16, height: 16 }} /> Menyimpan...</>
              : <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Simpan</>
            }
          </button>
          {taxRate > 0 && (
            <div style={{ background: C.primaryLight, borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: C.primaryDark, fontWeight: '600' }}>
              Contoh: Rp 100.000 → +Rp {(100000 * taxRate / 100).toLocaleString('id-ID')} pajak
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
