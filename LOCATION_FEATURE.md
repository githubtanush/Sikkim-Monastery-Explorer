# Add Location (Business Listing) Feature

## Overview
This feature allows authenticated users to list their businesses (hotels, restaurants, shops, tourist attractions, etc.) on the Sikkim Monastery Explorer map with a monthly subscription model.

## Features Implemented

### Backend (Node.js/Express/MongoDB)

#### New Models:
- **UserLocation** (`src/models/userLocation.js`)
  - Stores user-submitted location details with image
  - Tracks subscription status, views, and ratings
  - Geospatial indexing for map queries

- **LocationSubscription** (`src/models/locationSubscription.js`)
  - Manages subscription status and autopay settings
  - Tracks payment attempts and renewal dates
  - Supports multiple plan types (monthly, quarterly, annual)

#### New Routes (`src/routes/location.js`):
- `POST /location/create` - Create new location listing
- `GET /location/my-locations` - Get user's listings
- `GET /location/all-active` - Get all active locations for map
- `GET /location/:id` - Get location details with view tracking
- `PATCH /location/:id` - Update location details
- `DELETE /location/:id` - Delete location
- `GET /location/:id/subscription` - Get subscription details
- `POST /location/:id/renew-subscription` - Renew expired subscription
- `POST /location/:id/cancel-subscription` - Cancel subscription
- `GET /location/search/:query` - Search locations
- `POST /location/find-nearby` - Find locations within radius

### Frontend (React/Vite)

#### New Pages:
- **MyLocations** (`src/pages/MyLocations.jsx`)
  - Dashboard to manage user's business listings
  - View subscription status and renewal dates
  - Renew, cancel, or delete listings
  - Add new locations with inline form

- **LocationDetail** (`src/pages/LocationDetail.jsx`)
  - View full location details
  - Display owner information
  - Show statistics (views, rating, reviews)
  - Contact information and hours

#### New Components:
- **AddLocationForm** (`src/components/AddLocationForm.jsx`)
  - Form to add new business location
  - Image upload with preview
  - Map location selector (placeholder for full map integration)
  - Subscription terms modal
  - Form validation

#### API Integration:
- `src/api.js` - New locationAPI object with all endpoints

#### UI Updates:
- **Layout.jsx** - Added "List Place" tab in navbar
- **MapPage.jsx** - Integrated user locations on map with different styling
- **App.jsx** - Added new routes for MyLocations and LocationDetail

## Data Structure

### UserLocation Schema:
```
{
  name: String,
  type: Enum (Hotel, Restaurant, Shop, etc.),
  description: String (20-500 chars),
  phone: String (required),
  website: String (optional),
  hours: String,
  location: {
    type: Point (GeoJSON),
    coordinates: [longitude, latitude],
    address: String
  },
  imageUrl: String,
  userId: ObjectId (ref: User),
  subscriptionStatus: Enum (active, expired, suspended, pending),
  subscriptionId: ObjectId (ref: LocationSubscription),
  isApproved: Boolean (admin approval),
  expiresAt: Date,
  views: Number,
  rating: Number (0-5),
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### LocationSubscription Schema:
```
{
  userId: ObjectId,
  locationId: ObjectId,
  planType: Enum (monthly, quarterly, annual),
  monthlyAmount: Number (default: 99),
  autopayEnabled: Boolean,
  autopayDate: Number (1-31, day of month),
  nextRenewalDate: Date,
  lastPaymentDate: Date,
  lastPaymentStatus: Enum (pending, success, failed),
  failedAttempts: Number,
  isActive: Boolean,
  suspendReason: Enum (payment_failed, user_cancelled, admin_suspended),
  termsAccepted: Boolean,
  termsAcceptedAt: Date,
  paymentMethodId: String (placeholder for payment gateway)
}
```

## User Flow

### Creating a Listing:
1. Click "List Place" in navbar
2. Fill location form (name, type, description, contact, address)
3. Click on map to set coordinates (currently a placeholder)
4. Upload business photo
5. Review and accept subscription terms
6. Submit for admin approval

### Managing Listings:
1. Go to "My Business Listings" from navbar
2. View all personal listings with subscription status
3. Options to:
   - View full details
   - Renew subscription (if expired)
   - Cancel subscription
   - Delete listing

### Viewing on Map:
- Monastery markers: Amber/gold color
- Business markers: Green/emerald color
- Both show image popup with details on click

## Subscription Terms

- **Monthly Cost**: ₹99/month (configurable)
- **Autopay**: Monthly automatic renewal
- **Payment Attempts**: 3 attempts before suspension
- **Approval**: Admin must approve before listing goes live
- **Expiration**: Location removed from map after suspension

## Future Enhancements

1. **Payment Gateway Integration**: Integrate Stripe/Razorpay for real payments
2. **Admin Dashboard**: Approve/reject listings, manage subscriptions
3. **Interactive Map**: Click to set coordinates instead of form input
4. **Reviews & Ratings**: Allow users to review and rate listings
5. **Advanced Search**: Filter by type, distance, rating
6. **Image Gallery**: Multiple images per listing
7. **Analytics**: View tracking, visitor stats
8. **Email Notifications**: Payment reminders, approval notices
9. **Subscription Plans**: Different tiers (featured, basic, premium)
10. **Cron Jobs**: Automated payment processing and subscription expiration

## Installation & Usage

### Backend Setup:
1. Models are created and registered in MongoDB
2. Routes are imported in `app.js`
3. All dependencies already in `package.json`

### Frontend Setup:
1. API functions available in `src/api.js`
2. Routes registered in `App.jsx`
3. Navbar updated with new navigation link

### Testing:
1. Start backend: `npm run dev` (in monastries_backend)
2. Start frontend: `npm run dev` (in monastries_frontend)
3. Navigate to "List Place" tab when logged in
4. Create a test listing
5. View on map and in dashboard

## Notes

- Subscription terms are currently placeholder - update for your business model
- Payment processing not implemented - add payment gateway integration
- Admin approval flow needs admin dashboard to be fully functional
- Map location selector uses simple prompt - implement interactive map picker
- All timestamps use ISO 8601 format
- Geospatial queries require MongoDB geospatial index (created automatically)
