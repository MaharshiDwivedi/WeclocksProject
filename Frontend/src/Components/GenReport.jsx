import React from 'react';
import jsPDF from 'jspdf'; // Import jsPDF
import logo from '../Assets/logo.jpeg'; // Adjust the path based on your actual logo file name

// Define generatePDF outside the component
export const generatePDF = () => {
  const doc = new jsPDF();
  
  // Add logo to the PDF
  // First, create an image element to load the logo
  const img = new Image();
  img.src = logo;
  
  // Once the image is loaded, add it to the PDF
  img.onload = function() {
    // Add the image to the PDF (x-position, y-position, width, height)
    doc.addImage(img, 'PNG', 10, 10, 40, 40); // Adjust dimensions as needed
    
    // Add text below the logo
    doc.text('COMING VERY SOOOOOON !!!', 10, 60);
    
    // Open in a new tab
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