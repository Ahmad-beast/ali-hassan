// Import PDF setup first to ensure jsPDF is globally available
import jsPDF from '../utils/pdf-setup';
// Then import autotable which extends jsPDF
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Transaction } from '../types';

export const exportToPDF = (transactions: Transaction[], dateRange?: { start: Date; end: Date }) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Finance Ledger Report', 14, 22);
  
  // Date range
  if (dateRange) {
    doc.setFontSize(12);
    doc.text(
      `Period: ${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`,
      14,
      32
    );
  }

  // Calculate totals
  const pkrTotal = transactions
    .filter(t => t.currency === 'PKR')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const kwdTotal = transactions
    .filter(t => t.currency === 'KWD')
    .reduce((sum, t) => sum + t.amount, 0);

  // Table data
  const tableData = transactions.map(transaction => [
    format(transaction.date, 'MMM dd, yyyy'),
    transaction.from,
    transaction.to,
    transaction.purpose || '-',
    `${transaction.amount.toLocaleString()} ${transaction.currency}`,
  ]);

  // Add table
  (doc as any).autoTable({
    head: [['Date', 'From', 'To', 'Purpose', 'Amount']],
    body: tableData,
    startY: dateRange ? 40 : 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total PKR: ${pkrTotal.toLocaleString()}`, 14, finalY);
  doc.text(`Total KWD: ${kwdTotal.toLocaleString()}`, 14, finalY + 8);

  // Save
  const fileName = `ledger-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

export const exportToExcel = (transactions: Transaction[], dateRange?: { start: Date; end: Date }) => {
  const worksheetData = transactions.map(transaction => ({
    Date: format(transaction.date, 'yyyy-MM-dd'),
    From: transaction.from,
    To: transaction.to,
    Purpose: transaction.purpose || '',
    Amount: transaction.amount,
    Currency: transaction.currency,
    'Created By': transaction.createdBy,
    'Created At': format(transaction.createdAt, 'yyyy-MM-dd HH:mm'),
  }));

  // Calculate totals
  const pkrTotal = transactions
    .filter(t => t.currency === 'PKR')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const kwdTotal = transactions
    .filter(t => t.currency === 'KWD')
    .reduce((sum, t) => sum + t.amount, 0);

  // Add summary rows
  worksheetData.push(
    {} as any, // Empty row
    { Date: 'TOTALS', From: '', To: '', Purpose: '', Amount: '', Currency: '', 'Created By': '', 'Created At': '' } as any,
    { Date: 'PKR Total', From: '', To: '', Purpose: '', Amount: pkrTotal, Currency: 'PKR', 'Created By': '', 'Created At': '' } as any,
    { Date: 'KWD Total', From: '', To: '', Purpose: '', Amount: kwdTotal, Currency: 'KWD', 'Created By': '', 'Created At': '' } as any
  );

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  const fileName = `ledger-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};