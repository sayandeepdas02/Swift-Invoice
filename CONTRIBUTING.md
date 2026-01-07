# Contributing to Swift Invoice

First off, thank you for considering contributing to Swift Invoice! 🎉

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, browser, etc.)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### 🔧 Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/AmazingFeature
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly
   - Ensure the backend server runs without errors
   - Ensure the frontend builds successfully
   - Test all affected features

4. **Commit your changes** with clear, descriptive messages
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request** with a clear title and description

## Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/swift-invoice.git
   cd swift-invoice
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Update with your local configuration

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Code Style Guidelines

### JavaScript/React
- Use **ES6+ syntax**
- Use **functional components** with hooks
- Follow **camelCase** for variables and functions
- Follow **PascalCase** for components
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep components **small and focused**

### CSS/Tailwind
- Use **Tailwind utility classes** when possible
- Follow the existing **design system** (colors, spacing, etc.)
- Ensure **responsive design** for all screen sizes
- Use **semantic class names** for custom CSS

### Backend
- Follow **RESTful API** conventions
- Use **async/await** for asynchronous operations
- Add **error handling** for all routes
- Validate **input data** before processing
- Add **comments** for complex business logic

## Commit Message Guidelines

Use clear and meaningful commit messages:

- `Add: New feature or functionality`
- `Fix: Bug fix`
- `Update: Changes to existing functionality`
- `Refactor: Code refactoring`
- `Docs: Documentation changes`
- `Style: Code style changes (formatting, etc.)`
- `Test: Adding or updating tests`

Example:
```
Add: Payment QR code upload feature

- Added file upload handler for QR codes
- Updated invoice model with qrCodeImage field
- Modified PDF generator to display uploaded QR
```

## Testing

Before submitting a PR, please test:

- ✅ Backend server starts without errors
- ✅ Frontend builds and runs successfully
- ✅ All existing features still work
- ✅ New features work as expected
- ✅ No console errors or warnings
- ✅ Responsive design on different screen sizes

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

---

Thank you for contributing to Swift Invoice! 🚀
