import jsPDF from 'jspdf';

// Make jsPDF available globally for jspdf-autotable to extend it
if (typeof window !== 'undefined') {
  (window as any).jsPDF = jsPDF;
}

export default jsPDF;