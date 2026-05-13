import { jsPDF } from 'jspdf';
import { formatPrice, formatDate, formatArea } from './format';

// Phase 3: Report Generation with jsPDF
export function generateValuationReport(property, valuation) {
  // Safety checks
  if (!property) {
    console.error('Cannot generate report: No property data');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Safe property values with fallbacks
  const propId = property.id || 'N/A';
  const propTitle = property.title || 'Property Details';
  const propLocality = property.location?.locality || 'N/A';
  const propCity = property.location?.city || 'N/A';
  const propType = property.propertyType || 'N/A';
  const propArea = property.area || 0;
  const propBedrooms = property.bedrooms || 0;
  const propBathrooms = property.bathrooms || 0;
  const propFloor = property.floor || 'N/A';
  const propTotalFloors = property.totalFloors || 0;
  const propStatus = property.status || 'N/A';
  const propFurnishing = property.furnishing || 'N/A';
  const propAge = property.age || 0;
  const propFacing = property.facing || 'N/A';
  const propAmenities = property.amenities || [];
  
  // Safe valuation values
  const estimatedValue = valuation?.estimatedValue || property.price || 0;
  const confidenceScore = valuation?.confidenceScore || 75;
  const marketTrend = valuation?.marketTrend || 'Stable';
  const comparables = valuation?.comparables || [];
  const recommendations = valuation?.recommendations || [];
  const priceAnalysis = valuation?.pricePerSqftAnalysis || { locality: 0, city: 0, difference: 0 };
  const generatedAt = valuation?.generatedAt || new Date().toISOString();
  
  // Header with branding
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Indian Real Estate', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Property Valuation Report', 20, 30);
  
  // Report metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(generatedAt)}`, pageWidth - 20, 20, { align: 'right' });
  doc.text(`Report ID: VR-${propId}`, pageWidth - 20, 28, { align: 'right' });
  
  // Property Details Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', 20, 55);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Property ID:', propId],
    ['Title:', propTitle.substring(0, 50)],
    ['Location:', `${propLocality}, ${propCity}`],
    ['Type:', propType],
    ['Area:', formatArea(propArea)],
    ['Bedrooms:', propBedrooms.toString()],
    ['Bathrooms:', propBathrooms.toString()],
    ['Floor:', `${propFloor}/${propTotalFloors}`],
    ['Status:', propStatus],
    ['Furnishing:', propFurnishing],
    ['Age:', `${propAge} years`],
    ['Facing:', propFacing]
  ];
  
  let yPos = 65;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });
  
  // Valuation Section - Highlighted
  yPos += 10;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 45, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Valuation Estimate', 20, yPos + 5);
  
  doc.setFontSize(28);
  doc.setTextColor(59, 130, 246);
  doc.text(formatPrice(estimatedValue), 20, yPos + 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Confidence Score: ${confidenceScore}%`, 20, yPos + 32);
  doc.text(`Market Trend: ${marketTrend}`, 20, yPos + 39);
  
  // Price Analysis Section
  yPos += 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Price Analysis', 20, yPos);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  yPos += 10;
  doc.text(`Locality Avg Price/sq.ft: ₹${(priceAnalysis.locality || 0).toLocaleString()}`, 20, yPos);
  yPos += 7;
  doc.text(`City Avg Price/sq.ft: ₹${(priceAnalysis.city || 0).toLocaleString()}`, 20, yPos);
  yPos += 7;
  const diffSign = (priceAnalysis.difference || 0) > 0 ? '+' : '';
  doc.text(`Difference from City Avg: ${diffSign}${priceAnalysis.difference || 0}%`, 20, yPos);
  
  // Comparable Properties
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparable Properties', 20, yPos);
  
  yPos += 10;
  
  if (comparables.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Property', 20, yPos);
    doc.text('Price', 100, yPos);
    doc.text('Area', 140, yPos);
    doc.text('Price/sq.ft', 170, yPos);
    
    doc.setFont('helvetica', 'normal');
    comparables.slice(0, 5).forEach((comp) => {
      yPos += 7;
      doc.text((comp.title || 'Property').substring(0, 35), 20, yPos);
      doc.text(formatPrice(comp.price || 0), 100, yPos);
      doc.text(`${comp.area || 0} sq.ft`, 140, yPos);
      doc.text(`₹${(comp.pricePerSqft || 0).toLocaleString()}`, 170, yPos);
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No comparable properties found in this locality', 20, yPos);
  }
  
  // Recommendations
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Recommendations', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (recommendations.length > 0) {
    recommendations.forEach((rec) => {
      // Wrap long text
      const maxWidth = pageWidth - 50;
      const lines = doc.splitTextToSize(`• ${rec}`, maxWidth);
      lines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 7;
      });
    });
  } else {
    doc.text('No specific recommendations at this time', 20, yPos);
  }
  
  // Amenities
  if (yPos < 250 && propAmenities.length > 0) {
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Amenities', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const amenityLines = [];
    for (let i = 0; i < propAmenities.length; i += 4) {
      amenityLines.push(propAmenities.slice(i, i + 4).join(' | '));
    }
    amenityLines.forEach(line => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += 6;
    });
  }
  
  // Footer
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('This AI-generated report is for reference purposes only. Consult professionals for legal advice.', pageWidth / 2, 287, { align: 'center' });
  doc.text('© 2024 Indian Real Estate. All rights reserved.', pageWidth / 2, 293, { align: 'center' });
  
  // Save the PDF
  doc.save(`Valuation_Report_${property.id}.pdf`);
}

export function generateComparisonReport(properties) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Comparison Report', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, pageWidth - 20, 15, { align: 'right' });
  
  // Comparison Table
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(240, 240, 240);
  
  const columns = ['Price', 'Area', 'Price/sq.ft', 'Bedrooms', 'Bathrooms', 'Location', 'Status', 'Furnishing'];
  const colWidth = (pageWidth - 50) / (columns.length + 1);
  
  // Header row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.rect(15, 40, pageWidth - 30, 10, 'F');
  doc.text('Property', 20, 47);
  columns.forEach((col, idx) => {
    doc.text(col, 35 + (idx * colWidth), 47);
  });
  
  // Property rows
  doc.setFont('helvetica', 'normal');
  properties.forEach((property, pIdx) => {
    const y = 60 + (pIdx * 40);
    
    doc.setFillColor(pIdx % 2 === 0 ? 250 : 245, 250, 255);
    doc.rect(15, y - 5, pageWidth - 30, 35, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Property ${pIdx + 1}`, 20, y + 5);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(property.title.substring(0, 40), 20, y + 12);
    
    const values = [
      formatPrice(property.price),
      formatArea(property.area),
      `₹${property.pricePerSqft.toLocaleString()}`,
      property.bedrooms.toString(),
      property.bathrooms.toString(),
      `${property.location.locality}, ${property.location.city}`,
      property.status,
      property.furnishing
    ];
    
    values.forEach((val, idx) => {
      doc.text(val.substring(0, 20), 35 + (idx * colWidth), y + 8);
    });
  });
  
  // Footer
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 190, pageWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('© 2024 Indian Real Estate - Property Comparison Report', pageWidth / 2, 196, { align: 'center' });
  
  doc.save('Property_Comparison_Report.pdf');
}
