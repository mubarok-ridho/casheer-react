import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reportApi } from '../../api/report';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const expenseSchema = z.object({
  category: z.string().min(1, 'Kategori harus dipilih'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter'),
  amount: z.number().min(1000, 'Minimal Rp 1.000'),
  date: z.string(),
  payment_method: z.string().min(1, 'Metode pembayaran harus dipilih'),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await reportApi.createExpense(data);
      toast.success('Pengeluaran berhasil ditambahkan');
      onSuccess();
    } catch (error) {
      toast.error('Gagal menambah pengeluaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori
        </label>
        <select
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Pilih Kategori</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <Input
        label="Deskripsi"
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Jumlah"
        type="number"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <Input
        label="Tanggal"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metode Pembayaran
        </label>
        <select
          {...register('payment_method')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="cash">Tunai</option>
          <option value="transfer">Transfer Bank</option>
          <option value="qris">QRIS</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan (opsional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Simpan
        </Button>
      </div>
    </form>
  );
};