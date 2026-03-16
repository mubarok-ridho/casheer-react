import React, { useState } from 'react';
import { Category } from '../../types';
import { menuApi } from '../../api/menu';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CategoryListProps {
  categories: Category[];
  onCategoryChange: () => void;
}

interface CategoryForm {
  name: string;
  description: string;
  sort_order: number;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onCategoryChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ name: "", description: "", sort_order: 0 });

  const openAdd = () => {
    setSelectedCategory(null);
    setForm({ name: "", description: "", sort_order: categories.length });
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setForm({ name: category.name, description: category.description || "", sort_order: category.sort_order });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus kategori ini?")) return;
    try {
      await menuApi.deleteCategory(id);
      toast.success("Kategori dihapus");
      onCategoryChange();
    } catch {
      toast.error("Gagal menghapus kategori");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nama kategori harus diisi"); return; }
    setIsLoading(true);
    try {
      if (selectedCategory) {
        await menuApi.updateCategory(selectedCategory.id, form);
        toast.success("Kategori diupdate");
      } else {
        await menuApi.createCategory(form);
        toast.success("Kategori ditambahkan");
      }
      setIsModalOpen(false);
      onCategoryChange();
    } catch {
      toast.error(selectedCategory ? "Gagal update kategori" : "Gagal tambah kategori");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Kelola Kategori</h3>
        <Button onClick={openAdd} variant="secondary" size="sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Belum ada kategori</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1 text-gray-400 hover:text-blue-600"><PencilIcon className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? "Edit Kategori" : "Tambah Kategori"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Contoh: Minuman, Makanan Utama" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Opsional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
