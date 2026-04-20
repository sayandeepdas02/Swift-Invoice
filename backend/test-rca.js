import fs from 'fs';
import { generateInvoicePDF } from './utils/pdfGenerator.js';

// Let's create a fake 2MB Base64 string for logo and QR to simulate max allowed by frontend
const fakeBase64 = "data:image/png;base64," + Buffer.alloc(2 * 1024 * 1024).toString('base64');

const mockInvoice = {
  invoiceNumber: "RCA-123",
  issueDate: "2026-04-20",
  dueDate: "2026-05-20",
  sender: { companyName: "Test Co", name: "John", email: "j@j.com", address: "123 St", logo: fakeBase64 },
  client: { name: "Client", email: "c@c.com", address: "456 Ave" },
  items: [{ description: "Item 1", quantity: 1, rate: 100, amount: 100 }],
  subtotal: 100,
  totalAmount: 100,
  taxPercentage: 0,
  discount: 0,
  currency: "USD",
  qrCodeImage: fakeBase64
};

async function run() {
  console.log("Running isolation test with logo and QR...");
  const bufWithImages = await generateInvoicePDF(mockInvoice);
  fs.writeFileSync('rca-with-images.pdf', bufWithImages);
  console.log("PDF generated With Images, size (KB):", bufWithImages.length / 1024);

  console.log("\\nRunning isolation test WITHOUT logo and QR...");
  mockInvoice.sender.logo = "";
  mockInvoice.qrCodeImage = "";
  const bufWithoutImages = await generateInvoicePDF(mockInvoice);
  fs.writeFileSync('rca-without-images.pdf', bufWithoutImages);
  console.log("PDF generated Without Images, size (KB):", bufWithoutImages.length / 1024);
}

run().catch(console.error);
