import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { reportApi } from '../../api/report';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { testPrinter } from '../../utils/printer';
import toast from 'react-hot-toast';

export const PrinterSettings: React.FC = () => {
  const { tenant } = useAuth();
  const [printerMAC, setPrinterMAC] = useState(tenant?.printer_mac || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.updateStoreSetup({
        printer_mac: printerMAC,
      });
      toast.success('Pengaturan printer disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!printerMAC) {
      toast.error('Masukkan MAC address printer terlebih dahulu');
      return;
    }

    setIsTesting(true);
    try {
      const success = await testPrinter(printerMAC, tenant?.receipt_width || '58mm');
      if (success) {
        toast.success('Test print berhasil dikirim');
      } else {
        toast.error('Test print gagal');
      }
    } catch (error) {
      toast.error('Gagal mengirim test print');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Pengaturan Printer Bluetooth</h2>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Cara Menemukan MAC Address Printer:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Pastikan printer dalam keadaan menyala dan Bluetooth aktif</li>
            <li>Pada printer thermal, biasanya ada stiker dengan label "MAC" atau "BT MAC"</li>
            <li>Format MAC address: XX:XX:XX:XX:XX:XX (contoh: 12:34:56:78:90:AB)</li>
            <li>Atau scan perangkat Bluetooth dari komputer/HP untuk melihat address printer</li>
          </ol>
        </div>

        <Input
          label="MAC Address Printer"
          value={printerMAC}
          onChange={(e) => setPrinterMAC(e.target.value)}
          placeholder="Contoh: 12:34:56:78:90:AB"
          pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
          title="Format MAC Address: XX:XX:XX:XX:XX:XX"
        />

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Informasi Printer</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Lebar Kertas:</span> {tenant?.receipt_width || '58mm'}<br />
            <span className="font-medium">Protocol:</span> ESC/POS Bluetooth<br />
            <span className="font-medium">Supported:</span> Epson TM series, Xprinter, dan printer thermal Bluetooth lainnya
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleTest}
            isLoading={isTesting}
            className="flex-1"
          >
            Test Print
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="flex-1"
          >
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </Card>
  );
};