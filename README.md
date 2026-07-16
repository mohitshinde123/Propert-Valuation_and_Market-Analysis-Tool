# 🏠 Indian RealEstate - Property Valuation & Market Analysis Platform

A comprehensive full-stack real estate platform with AI-powered property valuations, market analysis, and property management features. Built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-green)
![Tailwind](https://img.shields.io/badge/Tailwind-4-purple)
![Node](https://img.shields.io/badge/Node.js-18-yellow)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Demo Credentials](#-demo-credentials)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Property Listings** | Browse 500+ properties with advanced filters |
| **AI Valuation** | Get instant property value estimates |
| **Property Comparison** | Compare up to 3 properties side-by-side |
| **PDF Reports** | Download valuation & comparison reports |
| **EMI Calculator** | Calculate loan EMI instantly |
| **Market Analysis** | Interactive charts and market trends |
| **Saved Properties** | Save favorite properties for later |
| **Inquiry System** | Contact sellers directly |

### 👤 Buyer Features

- 🔍 Browse properties with filters (city, price, type, bedrooms)
- ❤️ Save favorite properties
- 📊 View AI-powered property valuations
- 📑 Download valuation reports (PDF)
- 🔄 Compare multiple properties
- 📩 Send inquiries to sellers
- 📅 Schedule property visits
- 💰 Calculate EMI for properties

### 🏢 Seller Features

- ➕ Post new properties with images
- 📋 Manage property listings
- 👥 View and respond to inquiries
- 📈 Track property views and saves
- 🔔 Real-time notifications
- 📊 Performance analytics

### 👨‍💼 Admin Features

- 👥 User management (Block/Unblock/Role change)
- ✅ Approve/Reject property listings
- 📊 Platform analytics dashboard
- ⚙️ System configuration
- 📋 Content moderation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI Framework |
| Vite | 7.3 | Build Tool |
| Tailwind CSS | 4.1 | Styling |
| Framer Motion | 12.3 | Animations |
| React Router | 7.1 | Routing |
| Recharts | 3.8 | Charts |
| jsPDF | 4.2 | PDF Generation |
| Lucide React | 1.14 | Icons |
| React Hot Toast | 2.6 | Notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.21 | API Framework |
| MongoDB | Atlas | Database |
| Mongoose | 8.6 | ODM |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password Hashing |
| Multer | 1.4 | File Upload |
| Nodemailer | 6.9 | Emails |
| OpenAI | 4.52 | AI Features |
| ImageKit | 5.2 | Image Storage |

---

## 📁 Project Structure

```
indian-realestate/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   ├── db.js              # MongoDB connection
│   │   └── imagekit.js        # ImageKit configuration
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── propertyController.js
│   │   ├── leadController.js
│   │   ├── aiController.js
│   │   └── uploadController.js
│   │
│   ├── 📂 middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── roleMiddleware.js  # Role-based access
│   │   └── errorMiddleware.js # Error handling
│   │
│   ├── 📂 models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   └── Lead.js
│   │
│   ├── 📂 routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── leads.js
│   │   ├── ai.js
│   │   └── upload.js
│   │
│   ├── 📂 scripts/
│   │   └── seed.js            # Database seeder
│   │
│   ├── 📂 utils/
│   │   ├── openai.js          # AI integration
│   │   ├── pdfGenerator.js    # PDF reports
│   │   ├── email.js           # Email service
│   │   └── helpers.js         # Utility functions
│   │
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
├── 📂 src/
│   ├── 📂 api/
│   │   └── index.js           # API client
│   │
│   ├── 📂 components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── PropertyCard.jsx
│   │   ├── SearchFilters.jsx
│   │   └── EMICalculator.jsx
│   │
│   ├── 📂 context/
│   │   ├── AuthContext.jsx    # Auth state
│   │   └── PropertyContext.jsx # Property state
│   │
│   ├── 📂 data/
│   │   └── properties.js      # Mock data (500+ properties)
│   │
│   ├── 📂 pages/
│   │   ├── Home.jsx
│   │   ├── Properties.jsx
│   │   ├── PropertyDetails.jsx
│   │   ├── Valuation.jsx
│   │   ├── Compare.jsx
│   │   ├── MarketAnalysis.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── BuyerDashboard.jsx
│   │   ├── SellerDashboard.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── 📂 utils/
│   │   ├── format.js
│   │   └── pdfGenerator.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [Atlas](https://www.mongodb.com/atlas))
- **Git** ([Download](https://git-scm.com/))

### Option 1: Quick Start (Demo Mode)

```bash
# Clone the repository
git clone https://github.com/your-username/indian-realestate.git
cd indian-realestate

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Open [(https://radiant-sorbet-ae18a0.netlify.app/)]

### Option 2: Full Stack Setup

```bash
# 1. Clone and install frontend
git clone https://github.com/your-username/indian-realestate.git
cd indian-realestate
npm install

# 2. Setup backend
cd backend
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Seed database (optional)
npm run seed

# 5. Start backend server
npm run dev

# 6. In another terminal, start frontend
cd ..
npm run dev
```

### Environment Variables

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/indian_real_estate
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/indian_real_estate

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

# CORS
CLIENT_URL=http://localhost:5173

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OpenAI (Optional)
OPENAI_API_KEY=sk-your-openai-key

# ImageKit (Optional)
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/
```

---

## 🔐 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@indianrealestate.com | admin123 | Full access |
| **Seller** | rajesh@example.com | seller123 | Post properties |
| **Seller** | priya@example.com | seller123 | Post properties |
| **Buyer** | arun@example.com | buyer123 | Browse & save |
| **Buyer** | sneha@example.com | buyer123 | Browse & save |

### Quick Login

On the login page, click the demo buttons:
- 🔵 **Buyer** - Login as Arun Mehta
- 🟢 **Seller** - Login as Rajesh Kumar
- 🟣 **Admin** - Login as Admin User

---

## 👥 User Roles

### 🛒 Buyer
- Browse and search properties
- Save favorite properties
- View property details and valuations
- Send inquiries to sellers
- Schedule property visits
- Download valuation reports
- Compare properties

### 🏢 Seller
- All Buyer features
- Post new property listings
- Upload property images
- Manage own listings
- Respond to buyer inquiries
- View analytics for listings

### 👨‍💼 Admin
- All Seller features
- Access Admin Command Center
- Manage all users (Block/Unblock/Role)
- Approve/Reject property listings
- View platform-wide analytics
- Configure system settings

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
GET    /api/auth/me              # Get current user
PUT    /api/auth/profile         # Update profile
PUT    /api/auth/save-property/:id # Save/unsave property
GET    /api/auth/users           # Get all users (Admin)
PUT    /api/auth/users/:id/block # Block/unblock user (Admin)
PUT    /api/auth/users/:id/role  # Update user role (Admin)
```

### Properties

```
GET    /api/properties           # Get all properties (paginated)
GET    /api/properties/featured  # Get featured properties
GET    /api/properties/:id       # Get single property
POST   /api/properties           # Create property (Seller)
PUT    /api/properties/:id       # Update property
DELETE /api/properties/:id       # Delete property
GET    /api/properties/seller/my-properties # Get seller's properties
GET    /api/properties/admin/pending # Get pending properties (Admin)
PUT    /api/properties/:id/approve # Approve property (Admin)
PUT    /api/properties/:id/reject  # Reject property (Admin)
```

### Leads (Inquiries)

```
POST   /api/leads                # Create inquiry (Buyer)
GET    /api/leads/buyer          # Get buyer's inquiries
GET    /api/leads/seller         # Get seller's inquiries
PUT    /api/leads/:id/status     # Update lead status (Seller)
PUT    /api/leads/:id/schedule-visit # Schedule visit (Seller)
GET    /api/leads/admin          # Get all leads (Admin)
```

### AI Features

```
POST   /api/ai/valuation         # Get property valuation
GET    /api/ai/market-analysis   # Get market analysis
POST   /api/ai/compare           # Compare properties
POST   /api/ai/recommendations   # Get recommendations
POST   /api/ai/price-prediction  # Get price predictions
```

### Upload

```
POST   /api/upload/single        # Upload single image
POST   /api/upload/multiple      # Upload multiple images
DELETE /api/upload/:fileId       # Delete image
GET    /api/upload/auth          # Get upload credentials
```

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: Enum ['Buyer', 'Seller', 'Admin'],
  savedProperties: [ObjectId],
  viewedProperties: [ObjectId],
  isBlocked: Boolean,
  createdAt: Date
}
```

### Property Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  pricePerSqft: Number,
  area: Number,
  bedrooms: Number,
  bathrooms: Number,
  propertyType: Enum,
  status: Enum,
  furnishing: Enum,
  facing: Enum,
  location: {
    address: String,
    locality: String,
    city: String,
    state: String,
    pinCode: String,
    latitude: Number,
    longitude: Number
  },
  amenities: [String],
  images: [String],
  seller: ObjectId (ref: User),
  isVerified: Boolean,
  isApproved: Boolean,
  views: Number,
  saves: Number,
  createdAt: Date
}
```

### Lead Model
```javascript
{
  property: ObjectId (ref: Property),
  buyer: ObjectId (ref: User),
  buyerName: String,
  buyerPhone: String,
  seller: ObjectId (ref: User),
  message: String,
  status: Enum ['New', 'Contacted', 'Visit Scheduled', ...],
  visitDate: Date,
  createdAt: Date
}
```

---

## 🎨 Key Features Walkthrough

### 1. Property Search & Filters
- Search by city, locality, or property name
- Filter by price range, bedrooms, property type
- Sort by newest, price (low/high), area
- Pagination (20 properties per page)

### 2. AI Valuation Engine
- Calculates estimated market value
- Compares with similar properties
- Provides confidence score (0-100%)
- Shows market trend (Rising/Stable/Declining)
- Lists adjustment factors

### 3. Property Comparison
- Select up to 3 properties
- Side-by-side comparison table
- Value, Location, Condition scores
- Pros and cons analysis
- Download comparison report

### 4. PDF Reports
- Professional branded reports
- Property details section
- AI valuation section
- Price analysis
- Comparable properties
- Recommendations
- Amenities list

### 5. EMI Calculator
- Interactive sliders
- Loan amount, Interest rate, Tenure
- Monthly EMI calculation
- Total payment breakdown
- Payment distribution chart

---

## 🔧 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
```

---

## 🐛 Troubleshooting

### Common Issues

**1. White Screen / Page Not Loading**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**2. MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongod --version

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

**3. Port Already in Use**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port
PORT=5001 npm run dev
```

**4. Module Not Found**
```bash
# Reinstall dependencies
npm install

# For backend
cd backend && npm install
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Test all features before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourusername)

---

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) - Property images
- [Lucide](https://lucide.dev) - Icons
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Recharts](https://recharts.org) - Charts

---

## 📞 Support

For support, email support@indianrealestate.com or join our Discord channel.

---

<div align="center">
  <p>Made with ❤️ in India</p>
  <p>© 2024 Indian RealEstate. All rights reserved.</p>
</div>
