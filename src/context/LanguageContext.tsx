import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.title': 'Finance Ledger',
    'nav.signOut': 'Sign Out',
    'nav.readOnly': 'Read-only mode',
    
    // Sidebar
    'sidebar.navigation': 'Navigation',
    'sidebar.allTransactions': 'All Transactions',
    'sidebar.allTransactions.desc': 'View transaction history',
    'sidebar.newTransaction': 'New Transaction',
    'sidebar.newTransaction.desc': 'Add new transaction',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.dashboard.desc': 'Account overview',
    'sidebar.activityLogs': 'Activity Logs',
    'sidebar.activityLogs.desc': 'System audit trail',
    
    // Transactions
    'transactions.title': 'Transaction History',
    'transactions.subtitle': 'Manage and track all financial transactions',
    'transactions.newTransaction': 'New Transaction',
    'transactions.filters': 'Filters',
    'transactions.search': 'Search transactions...',
    'transactions.dateFrom': 'Date From',
    'transactions.dateTo': 'Date To',
    'transactions.sender': 'Sender',
    'transactions.receiver': 'Receiver',
    'transactions.currency': 'Currency',
    'transactions.allSenders': 'All senders',
    'transactions.allReceivers': 'All receivers',
    'transactions.allCurrencies': 'All currencies',
    'transactions.clearFilters': 'Clear Filters',
    'transactions.totalPkr': 'Total PKR',
    'transactions.totalKwd': 'Total KWD',
    'transactions.noTransactions': 'No transactions found',
    'transactions.getStarted': 'Get started by adding your first transaction',
    'transactions.createFirst': 'Create First Transaction',
    'transactions.date': 'Date',
    'transactions.transaction': 'Transaction',
    'transactions.purpose': 'Purpose',
    'transactions.amount': 'Amount',
    'transactions.actions': 'Actions',
    'transactions.noPurpose': 'No purpose specified',
    
    // Add Transaction
    'addTransaction.title': 'Create New Transaction',
    'addTransaction.subtitle': 'Add a new financial transaction to the ledger',
    'addTransaction.back': 'Back',
    'addTransaction.details': 'Transaction Details',
    'addTransaction.from': 'From (Sender)',
    'addTransaction.to': 'To (Receiver)',
    'addTransaction.purpose': 'Purpose / Notes',
    'addTransaction.purposePlaceholder': 'Optional description or purpose of the transaction',
    'addTransaction.amount': 'Amount',
    'addTransaction.date': 'Date',
    'addTransaction.save': 'Save Transaction',
    'addTransaction.saving': 'Saving...',
    'addTransaction.selectSender': 'Select sender',
    'addTransaction.selectReceiver': 'Select receiver',
    'addTransaction.other': 'Other',
    'addTransaction.customSender': 'Enter sender name',
    'addTransaction.customReceiver': 'Enter receiver name',
    'addTransaction.required': 'required',
    
    // Edit Transaction
    'editTransaction.title': 'Edit Transaction',
    'editTransaction.subtitle': 'Modify the transaction details',
    'editTransaction.update': 'Update Transaction',
    'editTransaction.updating': 'Updating...',
    
    // Dashboard
    'dashboard.title': 'Financial Dashboard',
    'dashboard.subtitle': 'Overview of your accounts and currency settings',
    'dashboard.currencyRate': 'Currency Conversion Rate',
    'dashboard.kwdToPkr': 'KWD to PKR Rate',
    'dashboard.updateRate': 'Update Rate',
    'dashboard.updating': 'Updating...',
    'dashboard.currentRate': 'Current rate',
    'dashboard.lastUpdated': 'Last updated by',
    'dashboard.conversionBreakdown': 'Conversion Breakdown',
    'dashboard.originalPkr': 'Original PKR Amount:',
    'dashboard.originalKwd': 'Original KWD Amount:',
    'dashboard.conversionRate': 'Conversion Rate:',
    'dashboard.convertedKwd': 'Converted KWD to PKR:',
    'dashboard.totalInPkr': 'Total in PKR:',
    'dashboard.grandTotal': 'Grand Total',
    'dashboard.note': 'Important Note',
    'dashboard.noteText': 'Conversion rates only affect the display totals. Original transaction amounts remain unchanged in the database.',
    
    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInSubtitle': 'Sign in to your Finance Ledger account',
    'auth.createAccount': 'Create Account',
    'auth.signUpSubtitle': 'Join Finance Ledger today',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signUp': 'Sign up',
    'auth.signIn': 'Sign in',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.role': 'Role',
    'auth.viewer': 'Viewer (Read-only)',
    'auth.admin': 'Admin (Full access)',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.createAccountBtn': 'Create account',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.hide': 'Hide',
    'common.details': 'Details',
    'common.pdf': 'PDF',
    'common.excel': 'Excel',
  },
  ur: {
    // Navigation
    'nav.title': 'مالی کھاتہ',
    'nav.signOut': 'لاگ آؤٹ',
    'nav.readOnly': 'صرف پڑھنے کا موڈ',
    
    // Sidebar
    'sidebar.navigation': 'نیویگیشن',
    'sidebar.allTransactions': 'تمام لین دین',
    'sidebar.allTransactions.desc': 'لین دین کی تاریخ دیکھیں',
    'sidebar.newTransaction': 'نیا لین دین',
    'sidebar.newTransaction.desc': 'نیا لین دین شامل کریں',
    'sidebar.dashboard': 'ڈیش بورڈ',
    'sidebar.dashboard.desc': 'اکاؤنٹ کا جائزہ',
    'sidebar.activityLogs': 'سرگرمی کے لاگز',
    'sidebar.activityLogs.desc': 'سسٹم آڈٹ ٹریل',
    
    // Transactions
    'transactions.title': 'لین دین کی تاریخ',
    'transactions.subtitle': 'تمام مالی لین دین کا انتظام اور ٹریکنگ',
    'transactions.newTransaction': 'نیا لین دین',
    'transactions.filters': 'فلٹرز',
    'transactions.search': 'لین دین تلاش کریں...',
    'transactions.dateFrom': 'تاریخ سے',
    'transactions.dateTo': 'تاریخ تک',
    'transactions.sender': 'بھیجنے والا',
    'transactions.receiver': 'وصول کنندہ',
    'transactions.currency': 'کرنسی',
    'transactions.allSenders': 'تمام بھیجنے والے',
    'transactions.allReceivers': 'تمام وصول کنندگان',
    'transactions.allCurrencies': 'تمام کرنسیاں',
    'transactions.clearFilters': 'فلٹرز صاف کریں',
    'transactions.totalPkr': 'کل PKR',
    'transactions.totalKwd': 'کل KWD',
    'transactions.noTransactions': 'کوئی لین دین نہیں ملا',
    'transactions.getStarted': 'اپنا پہلا لین دین شامل کر کے شروعات کریں',
    'transactions.createFirst': 'پہلا لین دین بنائیں',
    'transactions.date': 'تاریخ',
    'transactions.transaction': 'لین دین',
    'transactions.purpose': 'مقصد',
    'transactions.amount': 'رقم',
    'transactions.actions': 'اعمال',
    'transactions.noPurpose': 'کوئی مقصد بیان نہیں کیا گیا',
    
    // Add Transaction
    'addTransaction.title': 'نیا لین دین بنائیں',
    'addTransaction.subtitle': 'کھاتے میں نیا مالی لین دین شامل کریں',
    'addTransaction.back': 'واپس',
    'addTransaction.details': 'لین دین کی تفصیلات',
    'addTransaction.from': 'سے (بھیجنے والا)',
    'addTransaction.to': 'کو (وصول کنندہ)',
    'addTransaction.purpose': 'مقصد / نوٹس',
    'addTransaction.purposePlaceholder': 'لین دین کا اختیاری تبصرہ یا مقصد',
    'addTransaction.amount': 'رقم',
    'addTransaction.date': 'تاریخ',
    'addTransaction.save': 'لین دین محفوظ کریں',
    'addTransaction.saving': 'محفوظ کر رہے ہیں...',
    'addTransaction.selectSender': 'بھیجنے والا منتخب کریں',
    'addTransaction.selectReceiver': 'وصول کنندہ منتخب کریں',
    'addTransaction.other': 'دیگر',
    'addTransaction.customSender': 'بھیجنے والے کا نام درج کریں',
    'addTransaction.customReceiver': 'وصول کنندے کا نام درج کریں',
    'addTransaction.required': 'ضروری',
    
    // Edit Transaction
    'editTransaction.title': 'لین دین میں ترمیم',
    'editTransaction.subtitle': 'لین دین کی تفصیلات میں تبدیلی کریں',
    'editTransaction.update': 'لین دین اپ ڈیٹ کریں',
    'editTransaction.updating': 'اپ ڈیٹ کر رہے ہیں...',
    
    // Dashboard
    'dashboard.title': 'مالی ڈیش بورڈ',
    'dashboard.subtitle': 'آپ کے اکاؤنٹس اور کرنسی کی ترتیبات کا جائزہ',
    'dashboard.currencyRate': 'کرنسی تبدیلی کی شرح',
    'dashboard.kwdToPkr': 'KWD سے PKR کی شرح',
    'dashboard.updateRate': 'شرح اپ ڈیٹ کریں',
    'dashboard.updating': 'اپ ڈیٹ کر رہے ہیں...',
    'dashboard.currentRate': 'موجودہ شرح',
    'dashboard.lastUpdated': 'آخری بار اپ ڈیٹ کیا گیا',
    'dashboard.conversionBreakdown': 'تبدیلی کی تفصیل',
    'dashboard.originalPkr': 'اصل PKR رقم:',
    'dashboard.originalKwd': 'اصل KWD رقم:',
    'dashboard.conversionRate': 'تبدیلی کی شرح:',
    'dashboard.convertedKwd': 'KWD سے PKR میں تبدیل:',
    'dashboard.totalInPkr': 'PKR میں کل:',
    'dashboard.grandTotal': 'کل رقم',
    'dashboard.note': 'اہم نوٹ',
    'dashboard.noteText': 'تبدیلی کی شرحیں صرف ڈسپلے ٹوٹلز کو متاثر کرتی ہیں۔ اصل لین دین کی رقم ڈیٹابیس میں تبدیل نہیں ہوتی۔',
    
    // Auth
    'auth.welcomeBack': 'خوش آمدید',
    'auth.signInSubtitle': 'اپنے مالی کھاتے میں لاگ ان کریں',
    'auth.createAccount': 'اکاؤنٹ بنائیں',
    'auth.signUpSubtitle': 'آج ہی مالی کھاتے میں شامل ہوں',
    'auth.dontHaveAccount': 'اکاؤنٹ نہیں ہے؟',
    'auth.alreadyHaveAccount': 'پہلے سے اکاؤنٹ ہے؟',
    'auth.signUp': 'سائن اپ',
    'auth.signIn': 'لاگ ان',
    'auth.email': 'ای میل ایڈریس',
    'auth.password': 'پاس ورڈ',
    'auth.fullName': 'پورا نام',
    'auth.role': 'کردار',
    'auth.viewer': 'ناظر (صرف پڑھنے کے لیے)',
    'auth.admin': 'ایڈمن (مکمل رسائی)',
    'auth.signingIn': 'لاگ ان ہو رہے ہیں...',
    'auth.creatingAccount': 'اکاؤنٹ بنا رہے ہیں...',
    'auth.createAccountBtn': 'اکاؤنٹ بنائیں',
    
    // Common
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ',
    'common.delete': 'حذف کریں',
    'common.edit': 'ترمیم',
    'common.view': 'دیکھیں',
    'common.hide': 'چھپائیں',
    'common.details': 'تفصیلات',
    'common.pdf': 'PDF',
    'common.excel': 'Excel',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ur';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'ur') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      <div className={language === 'ur' ? 'rtl' : 'ltr'} dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};