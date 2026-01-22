import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSettings, updateCurrencyRate, subscribeToSettings } from '../../services/settingsService';
import { subscribeToTransactions } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { Settings, Transaction } from '../../types';
import { DollarSign, Save, Calculator } from 'lucide-react';

interface CurrencyFormData {
  kwdToPkrRate: number;
}

const MyAccounts: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CurrencyFormData>();

  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings((data) => {
      setSettings(data);
      if (data) {
        setValue('kwdToPkrRate', data.kwdToPkrRate);
      } else {
        setValue('kwdToPkrRate', 85.0);
      }
    });

    const unsubscribeTransactions = subscribeToTransactions((data) => {
      setTransactions(data);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTransactions();
    };
  }, [setValue]);

  const onSubmit = async (data: CurrencyFormData) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      await updateCurrencyRate(data.kwdToPkrRate, userProfile.email);
    } catch (error) {
      console.error('Error updating currency rate:', error);
    }
    setLoading(false);
  };

  const pkrTotal = transactions
    .filter((t) => t.currency === 'PKR')
    .reduce((sum, t) => sum + t.amount, 0);

  const kwdTotal = transactions
    .filter((t) => t.currency === 'KWD')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentRate = settings?.kwdToPkrRate || 85.0;
  const convertedKwdToPkr = kwdTotal * currentRate;
  const grandTotal = pkrTotal + convertedKwdToPkr;

  return (
    <div className="p-3 sm:p-4 bg-gray-50 min-h-screen mobile-container safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600">Overview of your accounts and currency settings</p>
        </div>

        {/* Currency Conversion Settings */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
            Currency Conversion Rate
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KWD to PKR Rate
                </label>
                <input
                  {...register('kwdToPkrRate', { 
                    required: 'Rate is required',
                    min: { value: 0.01, message: 'Rate must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  placeholder="85.00"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-touch-target"
                />
                {errors.kwdToPkrRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.kwdToPkrRate.message}</p>
                )}
              </div>
              
              <div className="flex items-end mt-4 lg:mt-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full lg:w-auto flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mobile-touch-target"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Rate'}
                </button>
              </div>
            </div>
          </form>

          {settings && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Current rate: <span className="font-bold">1 KWD = {currentRate} PKR</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Last updated by {settings.updatedBy} on{' '}
                {new Date(settings.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* PKR Total */}
          <div className="bg-blue-500 p-3 sm:p-4 rounded-lg text-white">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              <div>
                <p className="text-xs sm:text-sm opacity-90">PKR Total</p>
                <p className="text-lg sm:text-xl font-bold">{pkrTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* KWD Total */}
          <div className="bg-green-500 p-3 sm:p-4 rounded-lg text-white">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              <div>
                <p className="text-xs sm:text-sm opacity-90">KWD Total</p>
                <p className="text-lg sm:text-xl font-bold">{kwdTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Converted KWD to PKR */}
          <div className="bg-purple-500 p-3 sm:p-4 rounded-lg text-white">
            <div className="flex items-center">
              <Calculator className="w-6 h-6 mr-2" />
              <div>
                <p className="text-xs sm:text-sm opacity-90">KWD → PKR</p>
                <p className="text-lg sm:text-xl font-bold">{convertedKwdToPkr.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-orange-500 p-3 sm:p-4 rounded-lg text-white">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              <div>
                <p className="text-xs sm:text-sm opacity-90">Grand Total</p>
                <p className="text-lg sm:text-xl font-bold">{grandTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Details */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conversion Breakdown
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Original PKR Amount:</span>
              <span className="font-semibold text-blue-600">{pkrTotal.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Original KWD Amount:</span>
              <span className="font-semibold text-green-600">{kwdTotal.toLocaleString()} KWD</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Conversion Rate:</span>
              <span className="font-semibold text-purple-600">1 KWD = {currentRate} PKR</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Converted KWD to PKR:</span>
              <span className="font-semibold text-purple-600">{convertedKwdToPkr.toLocaleString()} PKR</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-gray-900 font-medium">Total in PKR:</span>
                <span className="text-lg sm:text-xl font-bold text-orange-600">{grandTotal.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Conversion rates only affect the display totals. Original transaction amounts remain unchanged in the database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyAccounts;