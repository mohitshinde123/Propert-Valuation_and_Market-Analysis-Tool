# Indian Real Estate - Backend API

Backend API server for the Indian Real Estate Property Valuation and Market Analysis Tool.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer with Brevo SMTP
- **Image Storage:** ImageKit
- **File Upload:** Multer

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── models/               # Mongoose models
│   ├── User.js          # User model
│   ├── Property.js      # Property model
│   ├── Booking.js       # Booking model
│   └── Report.js        # Report model
├── routes/               # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── propertyRoutes.js # Property CRUD
│   ├── bookingRoutes.js # Booking management
│   ├── reportRoutes.js  # Report generation
│   ├── userRoutes.js    # User management
│   ├── marketRoutes.js  # Market data
│   └── uploadRoutes.js  # File uploads
├── middleware/           # Middleware
│   ├── authMiddleware.js # JWT authentication
│   └── errorMiddleware.js # Error handling
├── utils/               # Utilities
│   └── email.js         # Email service
└── seeders/             # Database seeders
    └── seedData.js      # Sample data
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- (Optional) Brevo account for emails
- (Optional) ImageKit account for image uploads

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/auth/me | Get current user | Yes |
| POST | /api/auth/forgot-password | Request password reset | No |
| PUT | /api/auth/reset-password/:token | Reset password | No |
| PUT | /api/auth/update-password | Update password | Yes |
| POST | /api/auth/logout | Logout | Yes |

### Properties
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/properties | Get all properties | No |
| GET | /api/properties/:id | Get single property | No |
| POST | /api/properties | Create property | Seller |
| PUT | /api/properties/:id | Update property | Owner |
| DELETE | /api/properties/:id | Delete property | Owner |
| PUT | /api/properties/:id/favorite | Toggle favorite | Yes |
| GET | /api/properties/:id/valuation | Get valuation | No |
| GET | /api/properties/user/listings | Get user's listings | Seller |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/bookings | Create booking | Yes |
| GET | /api/bookings/my-visits | Get user's bookings | Yes |
| GET | /api/bookings/received | Get seller's bookings | Seller |
| PUT | /api/bookings/:id/status | Update status | Seller |
| PUT | /api/bookings/:id/cancel | Cancel booking | Yes |
| PUT | /api/bookings/:id/feedback | Add feedback | Yes |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/reports/valuation | Generate valuation report | Yes |
| POST | /api/reports/market | Generate market report | Yes |
| POST | /api/reports/compare | Generate comparison report | Yes |
| POST | /api/reports/investment | Generate investment report | Yes |
| GET | /api/reports | Get user's reports | Yes |
| GET | /api/reports/:id | Get single report | Yes |
| DELETE | /api/reports/:id | Delete report | Yes |
| POST | /api/reports/:id/share | Share report via email | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/users/profile | Get profile | Yes |
| PUT | /api/users/profile | Update profile | Yes |
| GET | /api/users/favorites | Get favorites | Yes |
| POST | /api/users/favorites/:id | Add to favorites | Yes |
| DELETE | /api/users/favorites/:id | Remove from favorites | Yes |
| DELETE | /api/users/account | Delete account | Yes |

### Market Data
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/market/overview | Market overview | No |
| GET | /api/market/cities | City-wise data | No |
| GET | /api/market/trends | Price trends | No |
| GET | /api/market/stats | Statistics | No |

### Uploads
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/upload/image | Upload single image | Yes |
| POST | /api/upload/images | Upload multiple images | Yes |
| POST | /api/upload/document | Upload document | Yes |
| DELETE | /api/upload/:publicId | Delete file | Yes |

## Sample Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@indianrealestate.com | admin123 |
| Seller | raj@seller.com | seller123 |
| Seller | sharma@seller.com | seller123 |
| Buyer | buyer@demo.com | buyer123 |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT secret key | Yes |
| JWT_EXPIRE | JWT expiration | No (default: 7d) |
| SMTP_HOST | SMTP server | No |
| SMTP_PORT | SMTP port | No |
| SMTP_USER | SMTP username | No |
| SMTP_PASS | SMTP password | No |
| IMAGEKIT_PUBLIC_KEY | ImageKit public key | No |
| IMAGEKIT_PRIVATE_KEY | ImageKit private key | No |
| IMAGEKIT_URL_ENDPOINT | ImageKit URL endpoint | No |
| CLIENT_URL | Frontend URL | No |

## License

MIT
