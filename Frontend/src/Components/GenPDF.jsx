import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFinancialReportPDF = (financialYear = '2024-25', schoolName = 'Weclocks Technology') => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with proper margins
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set default font
      doc.setFont('helvetica');
      doc.setFontSize(12);

      // Add main header (centered horizontally, 20mm from top)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ITDP - Nandurbar', 105, 20, { align: 'center' });
      
      // Add financial year (5mm below header)
      doc.setFontSize(14);
      doc.text(financialYear, 105, 27, { align: 'center' });

      // Add school name (5mm below year)
      doc.setFontSize(12);
      doc.text(schoolName, 105, 34, { align: 'center' });

      // Add Marathi title (5mm below school name)
      doc.setFontSize(11);
      doc.text('वर्षभरात खालील बाबींवर झालेला खर्च', 105, 41, { align: 'center' });

      // Define expense categories in Marathi (exactly as in the sample PDF)
      const categories = [
        'शैक्षणिक बाबी',
        'पाणी स्वच्छता इ. बाबी',
        'सुरकक्षिता',
        'किचन अन्न व पोषण',
        'आरोग्य तपासण्या',
        'आजारपण व अपघात',
        'क्रीडा व कला',
        'शाळेचे शुशोभीकरण',
        'अन्य खर्च'
      ];

      // Create the table starting at 50mm from top
      autoTable(doc, {
        startY: 50,
        head: [['वर्ग', 'रक्कम (₹)']],
        body: categories.map(category => [category, '0']),
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 140, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });

      // Add page number at bottom 
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`${i} / ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }

      // Generate the PDF blob
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);

    } catch (error) {
      console.error('PDF generation failed:', error);
      reject(new Error('Failed to generate PDF: ' + error.message));
    }
  });
};