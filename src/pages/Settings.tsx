import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../api/report';
import { Card } from '../components/common/Card';
import { StoreSettings } from '../components/settings/StoreSettings';
import { PrinterSettings } from '../components/settings/PrinterSettings';
import { TemplateSettings } from '../components/settings/TemplateSettings';
import { ReceiptTemplate } from '../types';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { isAdmin, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'store' | 'printer' | 'templates'>('store');
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [activeTab]);

  const loadTemplates = async () => {
    try {
      const data = await reportApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Gagal memuat template');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Konfigurasi toko dan preferensi Anda</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'store'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informasi Toko
          </button>
          <button
            onClick={() => setActiveTab('printer')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'printer'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Printer Bluetooth
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Template Nota
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'store' && <StoreSettings />}
        {activeTab === 'printer' && <PrinterSettings />}
        {activeTab === 'templates' && (
          <TemplateSettings
            storeName={tenant?.store_name}
            logoUrl={tenant?.logo_url} 
            templates={templates} 
            onRefresh={loadTemplates}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};