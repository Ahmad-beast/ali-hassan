import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { addTransaction, getReceivers } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { Receiver } from '../../types';
import { Save, ArrowLeft, Plus } from 'lucide-react';

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

const AddTransactionForm: React.FC = () => {
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [showCustomFrom, setShowCustomFrom] = useState(false);
  const [showCustomTo, setShowCustomTo] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<TransactionFormData>({
    defaultValues: {
      currency: 'PKR',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const fromValue = watch('from');
  const toValue = watch('to');

  useEffect(() => {
    loadReceivers();
  }, []);

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

  const onSubmit = async (data: TransactionFormData) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      const finalFrom = data.from === 'other' ? data.customFrom : data.from;
      const finalTo = data.to === 'other' ? data.customTo : data.to;

      await addTransaction({
        from: finalFrom,
        to: finalTo,
        purpose: data.purpose,
        amount: Number(data.amount),
        currency: data.currency,
        date: new Date(data.date),
        createdBy: userProfile.email,
      });

      reset();
      navigate('/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
    setLoading(false);
  };

  const senderOptions = ['Brother 1', 'Brother 2', 'Brother 3', 'Brother 4'];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Transaction</h1>
            <p className="text-sm text-gray-600">Add a new financial transaction</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From (Sender) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From (Sender) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('from', { required: 'Sender is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select sender</option>
                  {senderOptions.map((sender) => (
                    <option key={sender} value={sender}>
                      {sender}
                    </option>
                  ))}
                  <option value="other">Other</option>
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
                    placeholder="Enter sender name"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* To (Receiver) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (Receiver) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('to', { required: 'Receiver is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select receiver</option>
                  <option value="Ali Hussan">Ali Hussan</option>
                  {receivers.map((receiver) => (
                    receiver.name !== 'Ali Hussan' && (
                      <option key={receiver.id} value={receiver.name}>
                        {receiver.name} ({receiver.usageCount} times)
                      </option>
                    )
                  ))}
                  <option value="other">Other</option>
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
                    placeholder="Enter receiver name"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose / Notes
              </label>
              <textarea
                {...register('purpose')}
                rows={3}
                placeholder="Optional description or purpose of the transaction"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
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
                  Date <span className="text-red-500">*</span>
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
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionForm;