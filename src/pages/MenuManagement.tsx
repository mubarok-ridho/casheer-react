import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuApi } from '../api/menu';
import { Menu, Category } from '../types';
import { Modal } from '../components/common/Modal';
import { QRModal } from '../components/menu/QRModal.tsx';
import { MenuForm } from '../components/menu/MenuForm';
import { MenuCard } from '../components/menu/MenuCard';
import { CategoryList } from '../components/menu/CategoryList';
import toast from 'react-hot-toast';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const C = {
  primary: '#5B8C5A', primaryDark: '#3d5e3c', primaryLight: '#ebf4eb',
  text: '#2a2420', sub: '#8a8278', border: 'rgba(0,0,0,0.07)',
};

export const MenuManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showQR, setShowQR] = useState(false); // ✅ di dalam component

  useEffect(() => { loadData(); }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [menusData, categoriesData] = await Promise.all([
        menuApi.getMenus(selectedCategory || undefined, searchTerm),
        menuApi.getCategories(),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
    } catch {
      toast.error('Gagal memuat data menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenu = () => { setSelectedMenu(null); setIsModalOpen(true); };
  const handleEditMenu = (menu: Menu) => { setSelectedMenu(menu); setIsModalOpen(true); };

  const handleDeleteMenu = async (id: number) => {
    if (!window.confirm('Hapus menu ini?')) return;
    try {
      await menuApi.deleteMenu(id);
      setMenus(prev => prev.filter(m => m.id !== id));
      toast.success('Menu berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus menu');
    }
  };

  const handleSaveMenu = async (formData: FormData) => {
    try {
      if (selectedMenu) {
        if (!formData.has('is_available')) {
          formData.append('is_available', selectedMenu.is_available ? 'true' : 'false');
        }
        await menuApi.updateMenuForm(selectedMenu.id, formData);
        toast.success('Menu berhasil diupdate');
      } else {
        await menuApi.createMenu(formData);
        toast.success('Menu berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save menu error:', error);
      toast.error(selectedMenu ? 'Gagal mengupdate menu' : 'Gagal menambah menu');
    }
  };

  const handleToggleAvailability = async (menu: Menu) => {
    const newStatus = !menu.is_available;
    setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, is_available: newStatus } : m));
    try {
      await menuApi.setAvailability(menu.id, newStatus);
      toast.success(`Menu ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch {
      setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, is_available: menu.is_available } : m));
      toast.error('Gagal mengubah status menu');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: C.text, letterSpacing: '-0.02em' }}>Manajemen Menu</h1>
          <p style={{ margin: 0, fontSize: '13px', color: C.sub }}>Kelola semua menu di resto anda</p>
        </div>

        {/* ✅ Kedua tombol dalam satu flex row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setShowQR(true)} style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
            background: 'white', color: '#217093',
            border: '1.5px solid #217093', borderRadius: '11px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
          }}>
            📱 QR Menu
          </button>

          {isAdmin && (
            <button onClick={handleAddMenu} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px',
              background: `linear-gradient(135deg, ${C.primary}, #7aae78)`,
              color: 'white', border: 'none', borderRadius: '11px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 14px rgba(91,140,90,0.3)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <PlusIcon /> Tambah Menu
            </button>
          )}
        </div>
      </div>

      {/* Category Management */}
      {isAdmin && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${C.border}` }}>
          <CategoryList categories={categories} onCategoryChange={loadData} />
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${C.border}` }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? C.primary : '#b0a898', display: 'flex', alignItems: 'center', pointerEvents: 'none', transition: 'color 0.2s' }}>
            <SearchIcon />
          </span>
          <input
            type="text" placeholder="Cari menu..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
              border: `1.5px solid ${searchFocused ? C.primary : '#e8e4dc'}`, fontSize: '13px',
              background: '#faf9f6', outline: 'none', boxSizing: 'border-box',
              boxShadow: searchFocused ? '0 0 0 3px rgba(91,140,90,0.1)' : 'none',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", color: C.text,
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: C.sub,
              display: 'flex', alignItems: 'center', padding: '2px',
            }}><XIcon /></button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[{ id: null, name: 'Semua' }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button key={cat.id ?? 'all'} onClick={() => setSelectedCategory(cat.id as number | null)} style={{
                padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                background: active ? C.primary : '#f5f2ed',
                color: active ? 'white' : C.sub,
                boxShadow: active ? '0 4px 12px rgba(91,140,90,0.25)' : 'none',
                transform: active ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s ease', fontFamily: "'DM Sans', sans-serif",
              }}>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '48px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid #e8e4de`, borderTopColor: C.primary, animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : menus.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '16px', color: C.sub }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🍽️</div>
          <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px' }}>Belum ada menu</p>
          {isAdmin && (
            <button onClick={handleAddMenu} style={{
              padding: '9px 20px', background: C.primary, color: 'white', border: 'none',
              borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
            }}>Tambah Menu Pertama</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {menus.map(menu => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={isAdmin ? () => handleEditMenu(menu) : undefined}
              onDelete={isAdmin ? () => handleDeleteMenu(menu.id) : undefined}
              onToggleAvailability={isAdmin ? () => handleToggleAvailability(menu) : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={selectedMenu ? 'Edit Menu' : 'Tambah Menu Baru'} size="lg">
        <MenuForm
          menu={selectedMenu}
          categories={categories}
          onSave={handleSaveMenu}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* QR Modal */}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus { outline: none; }`}</style>
    </div>
  );
};
