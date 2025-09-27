# TaxWise - AI Finance Platform

A modern, AI-powered personal finance platform built for the Indian market, featuring tax optimization, CIBIL monitoring, and comprehensive financial management tools.

## 🚀 Features

- **Dashboard Overview**: Real-time financial insights and KPI tracking
- **Tax Optimization**: AI-powered tax planning and regime comparison
- **CIBIL Advisor**: Credit score monitoring and improvement recommendations
- **Data Ingestion**: Smart document processing and financial data import
- **Auto Filing**: Streamlined tax filing with AI assistance
- **Financial Coach (Caramel)**: AI chatbot for personalized financial advice
- **Alerts & Notifications**: Proactive financial alerts and reminders
- **Finance News**: Curated financial news and market updates

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Animation**: Motion (Framer Motion)
- **Backend**: Supabase Edge Functions (Hono.js)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Environment Variables
Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Backend (Supabase Edge Functions)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy server
```

## 📁 Project Structure

```
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── [pages]/         # Page-specific components
├── services/            # API services and backend integration
├── supabase/           # Supabase edge functions
├── styles/             # Global CSS and Tailwind config
├── utils/              # Utility functions and helpers
└── [config files]     # Build and deployment configuration
```

## 🎨 Design System

The platform uses a custom design system with:
- **Primary**: Blue (#0E6FFF)
- **Success**: Green (#2ECC71) 
- **Danger**: Red (#E74C3C)
- **Warning**: Amber (#F1C40F)
- **Dark/Light**: Theme toggle support
- **Currency**: Indian Rupees (₹) with proper formatting

## 🔐 Security Features

- Supabase authentication with session management
- Protected API routes with proper authorization
- Secure file upload with validation
- Environment variable protection
- CORS configuration for production

## 📱 Responsive Design

Fully responsive design optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Demo Mode

The platform includes a demo mode with:
- Mock data for exploration
- Offline functionality
- Simulated backend responses
- Full feature showcase

## 📊 Analytics & Monitoring

- Real-time performance monitoring
- User activity tracking
- Error logging and reporting
- Financial data analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation wiki

---

**Made with ❤️ for the Indian financial ecosystem**