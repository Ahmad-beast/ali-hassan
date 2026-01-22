import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { addTransaction, updateTransaction, getReceivers, getTransactionById } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Receiver } from '../../types';
import { Save, ArrowLeft, Plus, Edit } from 'lucide-react';

interface TransactionFormData {
  from: string;
  customFrom: string;
  to: string;
  customTo: string;
  purpose: string;
  amount: number;
  currency: 'PKR' | 'KWD';
  date: string;
}

const TransactionForm: React.FC = () => {
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [showCustomFrom, setShowCustomFrom] = useState(false);
  const [showCustomTo, setShowCustomTo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<TransactionFormData>({
    defaultValues: {
      currency: 'PKR',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const fromValue = watch('from');
  const toValue = watch('to');

  useEffect(() => {
    loadReceivers();
    if (isEditing) {
      loadTransaction();
    }
  }, [isEditing, id]);

  useEffect(() => {
    setShowCustomFrom(fromValue === 'other');
  }, [fromValue]);

  useEffect(() => {
    setShowCustomTo(toValue === 'other');
  }, [toValue]);

  const loadReceivers = async () => {
    try {
      const receiverList = await getReceivers();
      setReceivers(receiverList);
    } catch (error) {
      console.error('Error loading receivers:', error);
    }
  };

  const loadTransaction = async () => {
    if (!id) return;
    
    try {
      setLoadingTransaction(true);
      const transaction = await getTransactionById(id);
      
      if (transaction) {
        const senderOptions = ['Muhammad Raiz', 'Qaisar Shahzad', 'Muhammad Rizwan', 'Muhammad Nawaz'];
        const receiverOptions = ['Ali Hussan', 'Muhammad Raiz', 'Qaisar Shahzad', 'Muhammad Rizwan', 'Muhammad Nawaz'];
        
        // Check if sender is in predefined options
        const isCustomFrom = !senderOptions.includes(transaction.from);
        const isCustomTo = !receiverOptions.includes(transaction.to);
        
        setValue('from', isCustomFrom ? 'other' : transaction.from);
        setValue('to', isCustomTo ? 'other' : transaction.to);
        setValue('purpose', transaction.purpose || '');
        setValue('amount', transaction.amount);
        setValue('currency', transaction.currency);
        setValue('date', transaction.date.toISOString().split('T')[0]);
        
        if (isCustomFrom) {
          setValue('customFrom', transaction.from);
        }
        if (isCustomTo) {
          setValue('customTo', transaction.to);
        }
      } else {
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      navigate('/transactions');
    }
    setLoadingTransaction(false);
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      const finalFrom = data.from === 'other' ? data.customFrom : data.from;
      const finalTo = data.to === 'other' ? data.customTo : data.to;

      const transactionData = {
        from: finalFrom,
        to: finalTo,
        purpose: data.purpose,
        amount: Number(data.amount),
        currency: data.currency,
        date: new Date(data.date),
      };

      if (isEditing && id) {
        await updateTransaction(id, transactionData, userProfile.email);
      } else {
        await addTransaction({
          ...transactionData,
          createdBy: userProfile.email,
        });
      }

      navigate('/transactions');
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
    setLoading(false);
  };

  const senderOptions = ['Muhammad Raiz', 'Qaisar Shahzad', 'Muhammad Rizwan', 'Muhammad Nawaz'];

  if (loadingTransaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditing ? t('editTransaction.title') : t('addTransaction.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditing ? t('editTransaction.subtitle') : t('addTransaction.subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('addTransaction.back')}
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From (Sender) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addTransaction.from')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('from', { required: 'Sender is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('addTransaction.selectSender')}</option>
                  {senderOptions.map((sender) => (
                    <option key={sender} value={sender}>
                      {sender}
                    </option>
                  ))}
                  <option value="other">{t('addTransaction.other')}</option>
                </select>
                {errors.from && (
                  <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>
                )}
                
                {showCustomFrom && (
                  <input
                    {...register('customFrom', { 
                      required: showCustomFrom ? 'Custom sender name is required' : false 
                    })}
                    type="text"
                    placeholder={t('addTransaction.customSender')}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* To (Receiver) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addTransaction.to')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('to', { required: 'Receiver is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('addTransaction.selectReceiver')}</option>
                  <option value="Ali Hussan">Ali Hussan</option>
                  <option value="Muhammad Raiz">Muhammad Raiz</option>
                  <option value="Qaisar Shahzad">Qaisar Shahzad</option>
                  <option value="Muhammad Rizwan">Muhammad Rizwan</option>
                  <option value="Muhammad Nawaz">Muhammad Nawaz</option>
                  {receivers.map((receiver) => (
                    receiver.name !== 'Ali Hussan' && (
                      <option key={receiver.id} value={receiver.name}>
                        {receiver.name} ({receiver.usageCount} times)
                      </option>
                    )
                  ))}
                  <option value="other">{t('addTransaction.other')}</option>
                </select>
                {errors.to && (
                  <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
                )}
                
                {showCustomTo && (
                  <input
                    {...register('customTo', { 
                      required: showCustomTo ? 'Custom receiver name is required' : false 
                    })}
                    type="text"
                    placeholder={t('addTransaction.customReceiver')}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('addTransaction.purpose')}
              </label>
              <textarea
                {...register('purpose')}
                rows={3}
                placeholder={t('addTransaction.purposePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addTransaction.amount')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PKR">PKR</option>
                  <option value="KWD">KWD</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addTransaction.date')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isEditing ? <Edit className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {loading 
                  ? (isEditing ? t('editTransaction.updating') : t('addTransaction.saving'))
                  : (isEditing ? t('editTransaction.update') : t('addTransaction.save'))
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;