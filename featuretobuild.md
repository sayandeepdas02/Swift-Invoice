# Swift Invoice — Feature Roadmap

## ✅ Already Built

* **JWT & Google Authentication Module**: Secure registration, login, and Google OAuth flow. (`backend/controllers/authController.js`, `backend/services/authService.js`, `frontend/src/features/auth/*`)
* **Core Invoice Data Model**: Robust MongoDB schema for Invoices supporting multiple lifecycle states and financial metrics. (`backend/models/Invoice.js`)
* **Kanban & Table Dashboards**: Drag-and-drop state management and table-view filtering. (`frontend/src/pages/InvoiceHistory.jsx`, `frontend/src/components/KanbanBoard.jsx`)
* **Live Preview & PDF Generation**: Real-time rendering architecture and backend Puppeteer PDF export pipeline. (`frontend/src/components/LivePreview.jsx`, `backend/utils/pdfGenerator.js`)

---

## ⚠️ Partially Built

* **Form Validation**: `InvoiceBuilder.jsx` checks for blank fields and `invoiceService.js` sanitizes totals, but lacks comprehensive structural validation for emails and inputs.
* **Client History (Frontend Only)**: `ClientsList.jsx` fakes client management by aggregating historical invoices and merging with `localStorage`. It lacks a backend model.
* **Real Dashboard Metrics**: `DashboardHome.jsx` computes accurate financial data, but does so by pulling **all** invoices to the client instead of using a MongoDB aggregation pipeline.
* **Invoice Numbering System**: `InvoiceBuilder.jsx` assigns pseudo-random invoice IDs (`INV-${Math.floor(10000 + Math.random() * 90000)}`) instead of utilizing an auto-incrementing backend sequence.
* **Mobile Optimization**: Split tabs exists in `Dashboard.jsx`, but lacks deep mobile UX refinement for complex table navigation and public views.

---

## ❌ Not Built Yet

* Email Sending System (Nodemailer/SendGrid)
* Public Invoice Page (`/invoice/:publicId`)
* Payment Integration Webhooks and Checkout (Stripe/Razorpay)
* Proper Send Flow (Save -> Generate Link -> Email Dispatch)
* Settings Page (Form integration to a User preferences model)
* Client Model (Backend schema definition and API)
* Payment Reminders (Cron automation)
* Share Options (Copy Link, WhatsApp redirection)
* Smart Autofill & Saved Line Items (Fast checkout logic)

---

## 🔴 Tier 1 — Build First (Execution Plan)

### 1. Client Model (Backend)
* **What to build**: Dedicated `Client` MongoDB schema.
* **Where to implement**: 
  * `backend/models/Client.js`
  * `backend/routes/clients.js`
  * `backend/controllers/clientController.js`
  * `frontend/src/features/clients/ClientsList.jsx`
* **APIs required**: `GET /api/clients`, `POST /api/clients`, `PUT /api/clients/:id`
* **Data model changes**: Add `clientId` reference to `Invoice.js` schema.
* **Step-by-step**: 
  1. Create the `Client.js` mongoose model tracking `userId`, `name`, `email`, `address`, and `totalRevenue`.
  2. Implement backend CRUD controllers.
  3. Refactor frontend `ClientsList.jsx` to ditch `localStorage` and map strictly to the new API endpoints.

### 2. Public Invoice Page
* **What to build**: An unauthenticated, read-only route for clients to view their invoice and click to pay.
* **Where to implement**:
  * Frontend: `frontend/src/pages/PublicInvoice.jsx`, update `App.jsx`.
  * Backend: `backend/routes/invoices.js`, `backend/controllers/invoiceController.js`.
* **APIs required**: `GET /api/invoices/public/:id` (does not enforce `authMiddleware`).
* **Data model changes**: None directly, but should query via `_id` securely.
* **Step-by-step**:
  1. Add unauthenticated controller `getPublicInvoiceById` returning limited non-sensitive info (exclude user settings).
  2. Map route `/api/invoices/public/:id` without `protect`.
  3. Create frontend `PublicInvoice.jsx` utilizing `LivePreview.jsx` template natively.

### 3. Payment Integration (Stripe)
* **What to build**: Secure checkout session generation and webhook listener.
* **Where to implement**:
  * Backend: `backend/routes/payments.js`, `backend/controllers/paymentController.js`.
  * Frontend: Inject to `PublicInvoice.jsx`.
* **APIs required**: `POST /api/payments/create-checkout-session`, `POST /api/payments/webhook`.
* **Data model changes**: Add `stripeSessionId` and `paymentProvider` to `Invoice.js` schema.
* **Step-by-step**:
  1. Install `stripe` SDK backend.
  2. Create endpoint mapping an invoice `totalAmount` to Stripe line items.
  3. Create a Stripe webhook receiver (ensure express raw body parser) to catch `checkout.session.completed` and automatically call `updateInvoiceStatus(invoiceId, 'paid')`.

### 4. Email Sending System
* **What to build**: Abstracted mailer service.
* **Where to implement**: `backend/services/emailService.js`.
* **APIs required**: Helper functions rather than direct APIs. Included in "Send Flow".
* **Data model changes**: None.
* **Step-by-step**:
  1. Integrate `nodemailer` or SendGrid SDK.
  2. Create HTML email template representing the invoice notification.
  3. Wire in `pdfGenerator.js` to optionally return a buffer and attach it directly to the email payload payload.

### 5. Proper Send Flow 
* **What to build**: Transitioning from fake "Send" to operational trigger.
* **Where to implement**: `backend/controllers/invoiceController.js`, `frontend/src/features/invoices/InvoiceBuilder.jsx`.
* **APIs required**: `POST /api/invoices/:id/send`
* **Data model changes**: Update `sentAt` timestamp natively.
* **Step-by-step**:
  1. Controller endpoint receives invoice ID + custom message string.
  2. Controller dynamically calls PDF generator -> buffers PDF.
  3. Controller generates the `/invoice/public/:id` absolute URL.
  4. Dispatches email via `emailService.js` (including public link & attachment).
  5. Updates `invoice.status = 'sent'`.

### 6. Settings Page
* **What to build**: Configuration mutation panel.
* **Where to implement**: `frontend/src/pages/Settings.jsx`, `backend/controllers/authController.js`.
* **APIs required**: `PUT /api/auth/profile`
* **Data model changes**: None (already exists as `businessDetails` in `User.js`).
* **Step-by-step**:
  1. Implement forms mapped to `user.businessDetails` payload.
  2. Implement endpoint capturing these fields and mutating the `User` document.

### 7. Form Validation
* **What to build**: Reliable schema-based submission protection.
* **Where to implement**: `frontend/src/features/invoices/InvoiceBuilder.jsx`, backend `invoiceService.js`.
* **APIs required**: None.
* **Data model changes**: None.
* **Step-by-step**:
  1. Add strict `express-validator` to backend routes.
  2. Ensure Zod or manual strict checks inside `InvoiceBuilder.jsx` for correct email formats, mandatory line description.

---

## 🟠 Tier 2 — Build Next

* **Dashboard Metrics Refactor**: Build `GET /api/invoices/analytics` backend endpoint to use MongoDB Aggregate ensuring scalable math rather than heavy front-loading.
* **Invoice Numbering Protocol**: Implement a `Counter` MongoDB model to auto-increment prefixes ensuring strictly sequentially `INV-0001` formats over random math.
* **Payment Reminders**: Integrate `node-cron` or `BullMQ` to scan for invoices where `dueDate < Date.now()` and dispatch reminder emails. 
* **Share Options**: Extend `LivePreview.jsx` 'Copy Link' button using modern `navigator.clipboard.writeText()` injecting the `/public/:id` domain route.

---

## 🟡 Tier 3 — Later

* **Smart Autofill**: Introduce auto-complete features inside `InvoiceBuilder.jsx` pulling saved items and client details intelligently.
* **Saved Line Items / Services**: Implement a Services schema letting users build repeatable libraries mapped to UI dropdowns.
* **Mobile Specific Polish**: Dedicated UI blocks shifting complex grids to easily scrollable card abstractions on $< 640px$ screens.

---

## ⚠️ Critical Fixes (BLOCKERS)

### Fix XSS vulnerability in PDF Generator
* **Issue**: Unsanitized parameters inject HTML logic in string literals.
* **File location**: `backend/utils/pdfGenerator.js`
* **How to fix**: Install `sanitize-html` and wrap strings like `${invoiceData.client.name}` to strip tags prior to Puppeteer evaluating them to prevent headless-execution escapes.

### Move base64 Image Storage to Cloud
* **Issue**: Storing multi-MB Base64 string blobs heavily bloats DB payload latency natively slowing down `Invoice` document queries.
* **File location**: Backend `models/User.js` / Frontend Logo upload pipelines.
* **How to fix**: Setup a middleware utilizing `multer` + Cloudinary API locally. Upload file, retrieve secure URL, store URL exclusively in MongoDB.

### Add Rate Limiting to Auth APIs
* **Issue**: Login routing is subject to brute-force vectors effortlessly.
* **File location**: `backend/index.js` or `backend/routes/auth.js`
* **How to fix**: Implement `express-rate-limit` explicitly securing `POST /login` restricting identical IP bounds (e.g., 5 attempts / 15m).

### Fix Misleading "Send" Button
* **Issue**: Dashboard's Send merely increments DB state without triggering outgoing pipes. 
* **File location**: `frontend/src/features/invoices/InvoiceBuilder.jsx`
* **How to fix**: Needs resolution via the completion of Tier 1's **Proper Send Flow** (intercept save logic -> pass to dedicated delivery endpoint). 

---

## 🚀 Suggested 2-Week Sprint Plan

### Week 1: Core Functionality & Blockers
* **Day 1**: Resolve Critical Fixes (XSS PDF patch, Auth Rate Limiting).
* **Day 2**: Fix Image blobs via Cloudinary or equivalent upload pipelines.
* **Day 3**: Build Client MongoDB schema & migrate `/clients` frontend logic. 
* **Day 4**: Implement the Public Invoice Page endpoint and frontend consumer.
* **Day 5**: Abstract SendGrid/Nodemailer and connect Backend PDF buffer.

### Week 2: Payments & Optimization
* **Day 6**: Wire up **Proper Send Flow** tying dispatch with state update seamlessly.
* **Day 7**: Install and wire up Stripe Sessions + `webhook.js` architecture.
* **Day 8**: Finish Dashboard Analytics Aggregate pipeline mapping on MongoDB.
* **Day 9**: Deploy Settings page + Implement resilient Form Validation parameters.
* **Day 10**: QA Sweep, Sequential invoice generation incrementation patching.
