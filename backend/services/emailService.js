import { Resend } from 'resend';

// Generic email sender for reminders, notifications, etc.
export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is missing from environment variables');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const data = await resend.emails.send({
            from: 'Swift Invoice <invoices@resend.dev>',
            to: [to],
            subject,
            html,
        });
        return data;
    } catch (error) {
        console.error('Email failure:', error);
        throw new Error('Failed to send email.', { cause: 500 });
    }
};

export const sendInvoiceEmail = async ({ to, subject, message, publicLink, pdfBuffer, invoiceNumber }) => {
    // We instantiate lazily so if env var is missing it doesn't crash the entire app on load
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is missing from environment variables');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.5;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #111;">Invoice #${invoiceNumber}</h2>
        </div>
        
        <p>Hello,</p>
        <p>${message || 'Please find attached your invoice.'}</p>
        
        <div style="margin: 32px 0; text-align: center;">
            <a href="${publicLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                View & Pay Invoice Online
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            A PDF copy has also been attached for your records. If you have any questions, feel free to reply to this email.
        </p>
    </div>
    `;

    try {
        const data = await resend.emails.send({
            from: 'Swift Invoice <invoices@resend.dev>', // Change to verified domain later
            to: [to],
            subject: subject,
            html: emailHtml,
            attachments: [
                {
                    filename: `invoice-${invoiceNumber}.pdf`,
                    content: pdfBuffer,
                }
            ]
        });
        
        return data;
    } catch (error) {
        console.error('Email failure:', error);
        throw new Error('Failed to send email. Ensure API keys are valid.', { cause: 500 });
    }
};
