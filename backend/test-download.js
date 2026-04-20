import fs from 'fs';
import { generateInvoicePDF } from './utils/pdfGenerator.js';

// create a dummy image (e.g. 1000x1000 pixels raw)
// Actually we can just create a random PNG or rely on random buffer
// Let's create a huge HTML to see if it generates a huge PDF
const hugeString = "a".repeat(1024 * 1024 * 5); // 5MB of text
const mockInvoice = {
  invoiceNumber: "123",
  issueDate: "2026-04-20",
  dueDate: "2026-05-20",
  sender: { companyName: "Test Co", name: "John", email: "j@j.com", address: "123 St", logo: "" },
  client: { name: "Client", email: "c@c.com", address: "456 Ave" },
  items: [{ description: hugeString, quantity: 1, rate: 100, amount: 100 }],
  subtotal: 100,
  totalAmount: 100,
  taxPercentage: 0,
  discount: 0,
  currency: "USD",
  qrCodeImage: ""
};

async function testHtmlSize() {
    console.log("Generating with huge text...");
    const buf = await generateInvoicePDF(mockInvoice);
    console.log("Buffer size:", buf.length);
    fs.writeFileSync('huge.pdf', buf);
    console.log("Done");
}

testHtmlSize().catch(console.error);
