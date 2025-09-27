# TaxWise - AI Tax Assistant

An AI-powered personal finance platform designed specifically for Indian users to simplify tax filing and credit score management.

## 🚀 Features

### Smart Financial Data Ingestion
- Upload bank statements, credit card statements, or CSV files
- Automatic transaction categorization and normalization
- Pattern recognition for recurring transactions (EMIs, SIPs, rent, insurance)

### AI-Powered Tax Optimization Engine
- Categorizes income and expenses automatically
- Computes taxable income with Indian tax rules
- Applies deductions under relevant sections (80C, 80D, 80G, 24(b), etc.)
- Simulates Old vs New tax regimes
- Provides legal tax-saving recommendations

### CIBIL Score Advisor
- Analyzes credit behavior from financial statements
- Identifies factors impacting credit score
- Provides actionable recommendations to improve creditworthiness
- "What-if" scenario simulations

### Interactive Dashboard & Reports
- Visual spending breakdown and analysis
- Projected tax liability calculations
- CIBIL health monitoring
- Downloadable summaries and personalized insights

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** for authentication
- **Multer** for file uploads
- **Moment.js** for date handling
- **Lodash** for utility functions

### Frontend
- **React** with TypeScript
- **Material-UI** for components
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taxwise-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Edit server/.env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Backend Configuration
Create `server/.env` with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taxwise
JWT_SECRET=your-super-secret-jwt-key-here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration
Create `client/.env` with the following variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
taxwise-ai/
├── server/                 # Backend API
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   └── uploads/           # File upload directory
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── contexts/     # React contexts
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
└── README.md
```

## 🚀 Usage

### 1. User Registration/Login
- Create an account or login to access the platform
- Complete your profile with financial information

### 2. Upload Financial Data
- Navigate to the Upload page
- Upload bank statements, credit card statements, or CSV files
- The system will automatically process and categorize transactions

### 3. Tax Calculation
- Use the Tax Calculator to compute your tax liability
- Compare Old vs New tax regimes
- Get optimization suggestions for tax savings

### 4. CIBIL Analysis
- View your credit score analysis
- Get personalized recommendations
- Simulate different scenarios

### 5. Dashboard & Reports
- Monitor your financial health
- Generate comprehensive reports
- Download reports in various formats

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Input sanitization

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### File Upload
- `POST /api/upload/bank-statement` - Upload bank statement

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions/categorize` - Categorize transactions
- `GET /api/transactions/analysis` - Get spending analysis

### Tax Services
- `POST /api/tax/calculate` - Calculate tax
- `POST /api/tax/optimize` - Get tax optimization
- `POST /api/tax/compare-regimes` - Compare tax regimes
- `GET /api/tax/deductions` - Get available deductions

### CIBIL Services
- `POST /api/cibil/analyze` - Analyze CIBIL score
- `POST /api/cibil/recommendations` - Get recommendations
- `POST /api/cibil/simulate` - Simulate scenarios
- `POST /api/cibil/health-report` - Generate health report

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/insights` - Get financial insights
- `GET /api/dashboard/spending-breakdown` - Get spending breakdown
- `GET /api/dashboard/tax-projection` - Get tax projection
- `GET /api/dashboard/cibil-health` - Get CIBIL health
- `POST /api/dashboard/generate-report` - Generate report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@taxwise.com or create an issue in the repository.

## 🔮 Future Enhancements

- Integration with actual bank APIs
- Advanced AI/ML models for better categorization
- Mobile app development
- Integration with CIBIL API
- Advanced reporting features
- Multi-language support
- Real-time notifications

---

**TaxWise** - Empowering smarter financial decision-making with AI 🚀
