import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';

export const generateInvoicePDF = async (invoiceData) => {

  const currencySymbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$'
  };
  const symbol = currencySymbols[invoiceData.currency] || invoiceData.currency;
  const sanitize = (text) => sanitizeHtml(text || '', { allowedTags: [], allowedAttributes: {} });

  // HTML Template for the Invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', sans-serif; color: #1a1a1a; margin: 0; padding: 40px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
        .logo { max-width: 150px; }
        .invoice-details { text-align: right; }
        .invoice-details h1 { font-size: 32px; margin: 0; font-weight: 800; color: #000; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
        .section-title { font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 0.1em; margin-bottom: 8px; }
        .detail-item { font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .totals { margin-left: auto; width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.grand-total { border-top: 2px solid #000; margin-top: 10px; font-weight: 800; font-size: 18px; }
        .footer { margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
        .qr-code { width: 100px; height: 100px; }
        .notes { font-size: 12px; color: #666; max-width: 400px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          ${invoiceData.sender.logo ? `<img src="${invoiceData.sender.logo}" class="logo" alt="Company Logo">` : ''}
          ${invoiceData.sender.companyName ? `<h2 style="margin:0; font-weight:900; margin-top: 10px;">${sanitize(invoiceData.sender.companyName)}</h2>` : `<h2 style="margin:0; font-weight:900;">SWIFT INVOICE</h2>`}
        </div>
        <div class="invoice-details">
          <h1>INVOICE</h1>
          <p class="detail-item">#${sanitize(invoiceData.invoiceNumber)}</p>
          <p class="detail-item">Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}</p>
          <p class="detail-item">Due: ${invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <div class="details-grid">
        <div>
          <div class="section-title">Billed To</div>
          <div class="detail-item"><strong>${sanitize(invoiceData.client.name)}</strong></div>
          <div class="detail-item">${sanitize(invoiceData.client.email)}</div>
          <div class="detail-item">${sanitize(invoiceData.client.address)}</div>
        </div>
        <div style="text-align: right;">
          <div class="section-title">Pay To</div>
          <div class="detail-item"><strong>${sanitize(invoiceData.sender.name)}</strong></div>
          <div class="detail-item">${sanitize(invoiceData.sender.email)}</div>
          <div class="detail-item">${sanitize(invoiceData.sender.address)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map(item => `
            <tr>
              <td>${sanitize(item.description)}</td>
              <td style="text-align: center;">${sanitize(String(item.quantity))}</td>
              <td style="text-align: right;">${symbol}${Number(item.rate).toFixed(2)}</td>
              <td style="text-align: right;">${symbol}${Number(item.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${symbol}${Number(invoiceData.subtotal).toFixed(2)}</span>
        </div>
        ${invoiceData.taxPercentage > 0 ? `
          <div class="total-row">
            <span>${invoiceData.taxName || 'Tax'} (${invoiceData.taxPercentage}%)</span>
            <span>${symbol}${Number(invoiceData.taxAmount).toFixed(2)}</span>
          </div>
        ` : ''}
        ${invoiceData.discount > 0 ? `
          <div class="total-row">
            <span>Discount</span>
            <span>-${symbol}${Number(invoiceData.discount).toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>Grand Total</span>
          <span>${symbol}${Number(invoiceData.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <div class="notes">
          <div class="section-title">Notes / Terms</div>
          <p>${sanitize(invoiceData.notes) || 'Thank you for your business!'}</p>
          ${invoiceData.paymentQr ? `<p style="margin-top: 10px;"><strong>UPI ID:</strong> ${sanitize(invoiceData.paymentQr)}</p>` : ''}
        </div>
        ${invoiceData.qrCodeImage ? `
          <div style="text-align: center;">
            <div class="section-title">Scan to Pay</div>
            <img src="${invoiceData.qrCodeImage}" class="qr-code" alt="Payment QR Code">
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  const options = {
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  };

  let browser;
  try {
    console.log('[PDF] Starting Puppeteer launch sequence...');
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });
    console.log('[PDF] Browser launched successfully.');

    const page = await browser.newPage();
    console.log('[PDF] New page created. Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    console.log('[PDF] HTML content set. Generating PDF...');
    
    const pdfBuffer = await page.pdf(options);
    console.log(`[PDF] PDF Generated successfully! Buffer size: ${pdfBuffer.length} bytes`);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Generated PDF buffer is empty.");
    }
    
    return pdfBuffer;
  } catch (error) {
    console.error('[PDF ERROR] Fatal error during PDF generation:');
    console.error(error.stack);
    if (error.message.includes('browser was not found')) {
      console.error('\\n*** CHROMIUM EXECUTABLE NOT FOUND ***');
      console.error('Ensure PUPPETEER_EXECUTABLE_PATH is set correctly in your environment variables.');
      console.error('For Railway: Set PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium and ensure a Chromium buildpack or apt-get install is used.\\n');
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
};
