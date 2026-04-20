import fs from 'fs';
import { generateInvoicePDF } from './utils/pdfGenerator.js';

const mockInvoice = {
  invoiceNumber: "123",
  issueDate: "2026-04-20",
  dueDate: "2026-05-20",
  sender: { companyName: "Test Co", name: "John", email: "j@j.com", address: "123 St" },
  client: { name: "Client", email: "c@c.com", address: "456 Ave" },
  items: [{ description: "Item 1", quantity: 1, rate: 100, amount: 100 }],
  subtotal: 100,
  totalAmount: 100,
  taxPercentage: 0,
  discount: 0,
  currency: "USD"
};

async function run() {
  const buf = await generateInvoicePDF(mockInvoice);
  fs.writeFileSync('output.pdf', buf);
  console.log("PDF generated, size:", buf.length);
}

run().catch(console.error);
