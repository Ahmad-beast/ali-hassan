import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { subscribeToTransactions, deleteTransaction } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { Trash2, Download, Filter, Search, Plus, ArrowRight, Calendar, CreditCard as Edit } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../services/exportService';
import { Link } from 'react-router-dom';

const TransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    sender: '',
    receiver: '',
    currency: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    const unsubscribe = subscribeToTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.from.toLowerCase().includes(searchTerm) ||
          t.to.toLowerCase().includes(searchTerm) ||
          t.purpose?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= new Date(filters.dateTo)
      );
    }

    if (filters.sender) {
      filtered = filtered.filter((t) => t.from === filters.sender);
    }

    if (filters.receiver) {
      filtered = filtered.filter((t) => t.to === filters.receiver);
    }

    if (filters.currency) {
      filtered = filtered.filter((t) => t.currency === filters.currency);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!userProfile || !isAdmin) return;
    
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id, userProfile.email);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleExportPDF = () => {
    const dateRange = filters.dateFrom && filters.dateTo 
      ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
      : undefined;
    exportToPDF(filteredTransactions, dateRange);
  };

  const handleExportExcel = () => {
    const dateRange = filters.dateFrom && filters.dateTo 
      ? { start: new Date(filters.dateFrom), end: new Date(filters.dateTo) }
      : undefined;
    exportToExcel(filteredTransactions, dateRange);
  };

  const pkrTotal = filteredTransactions
    .filter((t) => t.currency === 'PKR')
    .reduce((sum, t) => sum + t.amount, 0);

  const kwdTotal = filteredTransactions
    .filter((t) => t.currency === 'KWD')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate brother totals
  const brothers = ['Muhammad Raiz', 'Qaisar Shahzad', 'Muhammad Rizwan', 'Muhammad Nawaz'];
  
  const calculateBrotherTotals = (brotherName: string) => {
    const received = {
      PKR: filteredTransactions
        .filter((t) => t.to === brotherName && t.currency === 'PKR')
        .reduce((sum, t) => sum + t.amount, 0),
      KWD: filteredTransactions
        .filter((t) => t.to === brotherName && t.currency === 'KWD')
        .reduce((sum, t) => sum + t.amount, 0),
    };
    
    const sent = {
      PKR: filteredTransactions
        .filter((t) => t.from === brotherName && t.currency === 'PKR')
        .reduce((sum, t) => sum + t.amount, 0),
      KWD: filteredTransactions
        .filter((t) => t.from === brotherName && t.currency === 'KWD')
        .reduce((sum, t) => sum + t.amount, 0),
    };
    
    return { received, sent };
  };

  const uniqueSenders = [...new Set(transactions.map((t) => t.from))];
  const uniqueReceivers = [...new Set(transactions.map((t) => t.to))];

  if (loading) {
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
    <div className="p-4 bg-gray-50 min-h-screen safe-area-bottom">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-xl font-bold text-gray-900">{t('transactions.title')}</h1>
          <p className="text-sm text-gray-600">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex flex-col gap-3">
          {isAdmin && (
            <Link
              to="/add-transaction"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('transactions.newTransaction')}
            </Link>
          )}
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 border rounded-lg text-sm font-medium flex-1 justify-center ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('transactions.filters')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300"
                title="Export PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportExcel}
                className="px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300"
                title="Export Excel"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-500 p-4 rounded-lg text-white">
          <h3 className="text-sm opacity-90">{t('transactions.totalPkr')}</h3>
          <p className="text-xl font-bold">{pkrTotal.toLocaleString()}</p>
        </div>
        <div className="bg-green-500 p-4 rounded-lg text-white">
          <h3 className="text-sm opacity-90">{t('transactions.totalKwd')}</h3>
          <p className="text-xl font-bold">{kwdTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg mb-6 border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.search')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('transactions.search')}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.dateFrom')}
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.dateTo')}
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.sender')}
              </label>
              <select
                value={filters.sender}
                onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('transactions.allSenders')}</option>
                {uniqueSenders.map((sender) => (
                  <option key={sender} value={sender}>
                    {sender}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.receiver')}
              </label>
              <select
                value={filters.receiver}
                onChange={(e) => setFilters({ ...filters, receiver: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('transactions.allReceivers')}</option>
                {uniqueReceivers.map((receiver) => (
                  <option key={receiver} value={receiver}>
                    {receiver}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('transactions.currency')}
              </label>
              <select
                value={filters.currency}
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('transactions.allCurrencies')}</option>
                <option value="PKR">PKR</option>
                <option value="KWD">KWD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({
                search: '',
                dateFrom: '',
                dateTo: '',
                sender: '',
                receiver: '',
                currency: '',
              })}
              className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {t('transactions.clearFilters')}
            </button>
          </div>
        </div>
      )}

      {/* Brother Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {brothers.map((brother) => {
          const totals = calculateBrotherTotals(brother);
          return (
            <div key={brother} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-bold text-sm">
                    {brother.split(' ')[0].charAt(0)}{brother.split(' ')[1] ? brother.split(' ')[1].charAt(0) : ''}
                  </span>
                </div>
                {brother}
              </h3>
              
              <div className="space-y-3">
                {/* Received */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-green-600 mr-2 rotate-180" />
                    <span className="text-sm font-medium text-green-700">Received</span>
                  </div>
                  <div className="text-right">
                    {totals.received.PKR > 0 && (
                      <div className="text-sm font-semibold text-green-800">
                        {totals.received.PKR.toLocaleString()} PKR
                      </div>
                    )}
                    {totals.received.KWD > 0 && (
                      <div className="text-sm font-semibold text-green-800">
                        {totals.received.KWD.toLocaleString()} KWD
                      </div>
                    )}
                    {totals.received.PKR === 0 && totals.received.KWD === 0 && (
                      <div className="text-sm text-gray-500">0</div>
                    )}
                  </div>
                </div>
                
                {/* Sent */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowRight className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-700">Sent</span>
                  </div>
                  <div className="text-right">
                    {totals.sent.PKR > 0 && (
                      <div className="text-sm font-semibold text-red-800">
                        {totals.sent.PKR.toLocaleString()} PKR
                      </div>
                    )}
                    {totals.sent.KWD > 0 && (
                      <div className="text-sm font-semibold text-red-800">
                        {totals.sent.KWD.toLocaleString()} KWD
                      </div>
                    )}
                    {totals.sent.PKR === 0 && totals.sent.KWD === 0 && (
                      <div className="text-sm text-gray-500">0</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('transactions.noTransactions')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('transactions.getStarted')}</p>
            {isAdmin && (
              <Link
                to="/add-transaction"
                className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('transactions.createFirst')}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('transactions.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('transactions.transaction')}
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('transactions.purpose')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('transactions.amount')}
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('transactions.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(transaction.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900 truncate max-w-20">{transaction.from}</span>
                        <ArrowRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 truncate max-w-20">{transaction.to}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate">
                        {transaction.purpose || <span className="text-gray-400 italic">{t('transactions.noPurpose')}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        transaction.currency === 'PKR' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.amount.toLocaleString()} {transaction.currency}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/edit-transaction/${transaction.id}`}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => transaction.id && handleDelete(transaction.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;