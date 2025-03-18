import React from 'react';
import jsPDF from 'jspdf'; 
import logo from '../Assets/logo.jpeg'; 

export const generatePDF = () => {
  const doc = new jsPDF();
  
 
  const img = new Image();
  img.src = logo;
  
  // Once the image is loaded, add it to the PDF
  img.onload = function() {
   
    doc.addImage(img, 'PNG', 10, 10, 40, 40); 
    
   
    doc.text('COMING SOOOOON !!!', 10, 60);
    
  
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };
};

function GenReport() {
  return (
    <>HI</>
  );
}

export default GenReport;