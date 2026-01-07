# ⚡ Swift Invoice

> **Create professional invoices in seconds** — A modern, full-stack MERN invoice generator with custom branding, PDF export, and payment QR codes.

![Swift Invoice Banner](https://img.shields.io/badge/MERN-Stack-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-orange)

---

## 🌟 Features

### ✨ **Core Functionality**
- 📄 **Professional Invoice Builder** — Create beautiful invoices with an intuitive form interface
- 🎨 **Custom Branding** — Upload your company logo and set your business name
- 💳 **Payment Integration** — Upload payment QR codes (GPay/PhonePe/Paytm) and display UPI IDs
- 📥 **PDF Export** — Download invoices as professionally formatted PDFs
- 🧮 **Auto-Calculations** — Automatic subtotal, tax, discount, and total calculations
- 📱 **Fully Responsive** — Works seamlessly on desktop, tablet, and mobile

### 🎯 **Advanced Features**
- 🔢 **Dynamic Line Items** — Add unlimited items with quantity, rate, and amount
- 💰 **Multi-Currency Support** — Invoice in USD, EUR, INR, and more
- 📊 **Tax Management** — Customizable tax names and percentages
- 📝 **Notes & Terms** — Add payment terms, bank details, or custom notes
- 🎨 **Modern UI/UX** — Clean, minimal design with smooth animations
- ⚡ **Real-time Updates** — Instant calculation updates as you type

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swift-invoice.git
   cd swift-invoice
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/swift-invoice
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swift-invoice
   
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Start the Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the Application**
   
   Navigate to `http://localhost:5173` in your browser

---

## 📁 Project Structure

```
swift-invoice/
├── backend/                 # Node.js + Express API
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions (PDF generation)
│   ├── index.js            # Server entry point
│   └── package.json
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/          # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 18** — Modern UI library
- ⚡ **Vite** — Lightning-fast build tool
- 🎨 **Tailwind CSS** — Utility-first CSS framework
- 🎭 **Framer Motion** — Smooth animations
- 🎯 **Lucide React** — Beautiful icons
- 📡 **Axios** — HTTP client

### **Backend**
- 🟢 **Node.js** — JavaScript runtime
- 🚂 **Express.js** — Web framework
- 🍃 **MongoDB** — NoSQL database
- 🔐 **JWT** — Authentication
- 📄 **html-pdf-node** — PDF generation
- 📷 **Multer** — File uploads
- ☁️ **Cloudinary** (optional) — Image hosting

---

## 🎨 Design Philosophy

Swift Invoice follows a **modern SaaS design** approach:

- **Color Palette**: Lime Green (#c4f82a) + Deep Black (#000000) + Clean White
- **Typography**: Inter font family for professional readability
- **UI Principles**: Minimal, spacious, high contrast, smooth animations
- **Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation

---

## 📝 API Endpoints

### **Invoices**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/invoices` | Create a new invoice |
| `GET` | `/api/invoices` | Get all invoices |
| `GET` | `/api/invoices/:id` | Get invoice by ID |
| `GET` | `/api/invoices/:id/download` | Download invoice as PDF |
| `PUT` | `/api/invoices/:id` | Update invoice |
| `DELETE` | `/api/invoices/:id` | Delete invoice |

### **Authentication** (Optional - for future implementation)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |

---

## 🔧 Configuration

### **Customization Options**

**Invoice Settings:**
- Company logo upload
- Custom company name
- Payment QR code upload
- UPI ID display
- Tax name and percentage
- Currency selection
- Custom notes and terms

**Supported Currencies:**
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- INR (Indian Rupee)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)

---

## 🚢 Deployment

### **Frontend (Vercel/Netlify)**

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` folder to Vercel or Netlify

### **Backend (Heroku/Railway/Render)**

1. Set environment variables on your hosting platform
2. Deploy the `backend` directory
3. Update frontend API URL in production

### **Database (MongoDB Atlas)**

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your `.env` file

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- Design inspiration from modern SaaS applications
- Icons by [Lucide Icons](https://lucide.dev)
- Fonts by [Google Fonts](https://fonts.google.com)

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: your.email@example.com

---

<div align="center">
  
  **⚡ Made with ❤️ using the MERN Stack**
  
  If you found this project helpful, please give it a ⭐!
  
</div>
