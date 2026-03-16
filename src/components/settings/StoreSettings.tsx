import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';

export const StoreSettings: React.FC = () => {
  const { tenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    receipt_width: '58mm',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        store_name: tenant.store_name || '',
        store_phone: tenant.store_phone || '',
        store_email: tenant.store_email || '',
        store_address: tenant.store_address || '',
        receipt_width: tenant.receipt_width || '58mm',
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.updateStoreSetup(formData);
      toast.success('Pengaturan toko berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await authApi.uploadLogo(file);
      toast.success('Logo berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload logo');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Informasi Toko</h2>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo Toko
          </label>
          <div className="flex items-center space-x-4">
            {tenant?.logo_url && (
              <img
                src={tenant.logo_url}
                alt="Logo"
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>

        <Input
          label="Nama Toko"
          value={formData.store_name}
          onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
          required
        />

        <Input
          label="No. Telepon"
          value={formData.store_phone}
          onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          value={formData.store_email}
          onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat
          </label>
          <textarea
            value={formData.store_address}
            onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lebar Kertas Nota
          </label>
          <select
            value={formData.receipt_width}
            onChange={(e) => setFormData({ ...formData, receipt_width: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="58mm">58 mm (Thermal Kecil)</option>
            <option value="80mm">80 mm (Thermal Besar)</option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Card>
  );
};