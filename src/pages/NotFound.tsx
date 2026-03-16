import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-9xl font-bold text-primary-600">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Halaman Tidak Ditemukan</h1>
          <p className="text-gray-600 mt-2">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="primary" fullWidth>
            Kembali ke Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};