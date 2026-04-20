import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';

export const generateInvoicePDF = async (invoiceData) => {

  const currencySymbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$'
  };
  const symbol = currencySymbols[invoiceData.currency] || invoiceData.currency;
  const sanitize = (text) => sanitizeHtml(text || '', { allowedTags: [], allowedAttributes: {} });

  const resolveImage = async (url) => {
    if (!url || typeof url !== 'string' || url === 'undefined' || url === 'null') return '';
    if (url.startsWith('data:image')) {
        const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            return `data:${matches[1]};base64,${matches[2]}`;
        }
        return '';
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) return '';
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) return '';
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (e) {
        return '';
    }
  };

  const resolvedLogo = await resolveImage(invoiceData.sender?.logo);
  const resolvedQr = await resolveImage(invoiceData.qrCodeImage);

  console.log(`[DEBUG] Logo size: ${invoiceData.sender?.logo?.length || 'no logo'}`);
  console.log(`[DEBUG] QR size: ${invoiceData.qrCodeImage?.length || 'no qr'}`);

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
          ${resolvedLogo ? `<img src="${resolvedLogo}" class="logo" alt="Company Logo">` : ''}
          ${invoiceData.sender?.companyName ? `<h2 style="margin:0; font-weight:900; margin-top: 10px;">${sanitize(invoiceData.sender.companyName)}</h2>` : `<h2 style="margin:0; font-weight:900;">SWIFT INVOICE</h2>`}
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
          <div class="detail-item"><strong>${sanitize(invoiceData.client?.name)}</strong></div>
          <div class="detail-item">${sanitize(invoiceData.client?.email)}</div>
          <div class="detail-item">${sanitize(invoiceData.client?.address)}</div>
        </div>
        <div style="text-align: right;">
          <div class="section-title">Pay To</div>
          <div class="detail-item"><strong>${sanitize(invoiceData.sender?.name)}</strong></div>
          <div class="detail-item">${sanitize(invoiceData.sender?.email)}</div>
          <div class="detail-item">${sanitize(invoiceData.sender?.address)}</div>
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
          ${(invoiceData.items || []).map(item => `
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
        ${resolvedQr ? `
          <div style="text-align: center;">
            <div class="section-title">Scan to Pay</div>
            <img src="${resolvedQr}" class="qr-code" alt="Payment QR Code">
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  console.log(`[DEBUG] HTML size (KB): ${(Buffer.byteLength(htmlContent, 'utf8') / 1024).toFixed(2)} KB`);

  const options = {
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  };

  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
    });

    page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Ensure images are fully loaded
    await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return;
            return new Promise((resolve) => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve);
            });
        }));
    });

    const pdfBufferRaw = await page.pdf(options);
    const pdfBuffer = Buffer.from(pdfBufferRaw);
    
    console.log(`[DEBUG] Final PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Generated PDF buffer is empty.");
    }
    
    return pdfBuffer;
  } catch (error) {
    if (error.message.includes('browser was not found')) {
      console.error('\\n*** CHROMIUM EXECUTABLE NOT FOUND ***');
    }
    throw error;
  } finally {
    if (page && !page.isClosed()) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
};
