# Project Features & Status Report

## 🌟 Current Features

### Frontend (Dashboard & UI)
- **Invoice Builder**: Complete form for creating invoices.
  - **Dynamic Items**: Add/remove multiple items with quantity and rate.
  - **Auto-Calculations**: Real-time subtotal, tax, and total calculation.
  - **Customization**: Upload Logo and QR Code (Client-side preview).
  - **Sender/Client Details**: Fields for billing and shipping info.
  - **Dates**: Issue Date and Due Date selection.
  - **Currency Support**: Dropdown for USD, EUR, INR, GBP.
- **PDF Generation**: Integration with backend to generate and download PDF invoices.
- **Authentication**:
  - Sign In / Sign Up pages exist.
  - `ProtectedRoute` component to guard the Dashboard.
  - `AuthContext` for managing login state.
- **UI/UX**:
  - TailwindCSS styling with a "Zinc" color theme.
  - Framer Motion animations for Toast notifications.
  - Lucide Icons (Plus, Trash2, Download, etc.).

### Backend (API)
- **Auth Endpoints**: Register, Login, Logout, Get Current User (`/api/auth`).
- **Invoice Endpoints**: Create Invoice, Get All Invoices, Download PDF (`/api/invoices`).
- **Database**: MongoDB connection with Mongoose.

## ⚠️ Breaking / Incomplete / Issues

### Security & Logic
1.  **Missing Auth Middleware on Invoices**:
    - The `POST /api/invoices` and `GET /api/invoices` routes in `backend/routes/invoices.js` **do not have the `protect` middleware**.
    - **Impact**: Any unauthenticated user can create or view invoices if they know the API URL.
2.  **Hardcoded API URLs**:
    - `Dashboard.jsx` has hardcoded `http://localhost:5001` for API calls.
    - **Impact**: Will break in production or if port changes. Should use environment variables (e.g., `import.meta.env.VITE_API_URL`).
3.  **Image Handling (Scalability)**:
    - Images (Logo, QR) are converted to Base64 strings in the frontend and likely sent directly to the backend.
    - **Impact**: While functional for small images, this can bloat the database and hit payload limits. Cloudinary integration is mentioned in `.env.example` but not explicitly seen in the `Dashboard.jsx` upload logic (it just does `readAsDataURL`).
4.  **Unused UI Elements**:
    - `Save` icon is imported in `Dashboard.jsx` but **never used**. There is no "Save Draft" functionality, only "Download Invoice" (which saves and downloads).
5.  **User Data Integration**:
    - The Dashboard does not pre-fill the "Sender" information from the logged-in user's profile. You have to type it manually every time.

### Minor Issues
- **Currency Symbols**: The UI hardcodes `$` in some places (e.g., `totalAmount` display mentions `$`), although the currency dropdown changes the `invoice.currency` state. It might not dynamically update the symbol displayed next to amounts.
