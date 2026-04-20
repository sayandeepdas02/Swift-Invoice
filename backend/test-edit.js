import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI);
import Invoice from './models/Invoice.js';

async function test() {
    const inv = await Invoice.findOne({});
    if(!inv) return console.log("No invoice");
    console.log("Found:", inv._id);
    
    // Simulate update
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`http://localhost:5001/api/invoices/${inv._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer user_token_here_if_needed_but_we_need_auth` }
    });
    console.log(res.status);
}
test();
