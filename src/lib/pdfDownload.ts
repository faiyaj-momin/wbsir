import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFOptions {
  filename?: string;
  margin?: number;
  scale?: number;
}

export async function downloadPDF(
  elementId: string,
  options: PDFOptions = {}
): Promise<void> {
  const { filename = 'appeal.pdf', margin = 10, scale = 2 } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;

    // Calculate scaled dimensions to fit within page margins
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    // Calculate scale factor to fit content on page
    const widthScale = availableWidth / imgWidth;
    const heightScale = availableHeight / imgHeight;
    const scaleFactor = Math.min(widthScale, heightScale);

    const scaledWidth = imgWidth * scaleFactor;
    const scaledHeight = imgHeight * scaleFactor;

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Calculate how many pages needed
    const totalPages = Math.ceil(scaledHeight / availableHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // Add image to PDF
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin - (page * availableHeight),
        scaledWidth,
        scaledHeight,
        undefined,
        'FAST'
      );
    }

    // Trigger download
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Alternative simpler implementation for single-page documents
export async function downloadPDFSimple(
  elementId: string,
  filename: string = 'appeal.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(
      availableWidth / imgWidth,
      availableHeight / imgHeight
    );

    const imgX = margin;
    const imgY = margin;
    const imgW = imgWidth * ratio;
    const imgH = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgW, imgH);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
