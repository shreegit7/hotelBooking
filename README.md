# Hotel Booking App - Full-Stack Project

A full-stack hotel listing platform built with React (Vite) frontend and Django REST Framework backend, connected to MySQL database.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript
- **Styling**: Plain CSS (no frameworks)
- **Routing**: React Router DOM v6

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Language**: Python 3.10+
- **Database**: MySQL
- **API Style**: RESTful JSON API
- **CORS**: django-cors-headers

## Project Structure

```
.
|-- hotel_backend/          # Django backend
|   |-- hotel_backend/      # Project settings
|   |-- hotels/             # Hotels app
|   |   |-- models.py       # Hotel/Booking/Rating/HotelImage models
|   |   |-- serializers.py  # DRF serializers
|   |   |-- views.py        # API viewsets + auth endpoints
|   |   |-- urls.py         # API URLs
|   |   |-- admin.py        # Admin configuration
|   |   |-- migrations/
|   |-- manage.py
|   |-- requirements.txt
|-- public/
|   |-- hotel.png
|-- src/                    # React frontend
|   |-- components/         # Reusable components
|   |-- pages/              # Page components
|   |-- services/           # API service
|   |-- styles.css          # Global styles
|   |-- main.jsx            # Entry point
|-- package.json
|-- vite.config.js
|-- README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
3. **MySQL Server** - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
4. **pip** (Python package manager)
5. **npm** or **yarn** (comes with Node.js)

## Setup Instructions

### Step 1: MySQL Database Setup

1. **Start MySQL Server** (if not already running)

2. **Create the Database**:
   ```sql
   CREATE DATABASE hotel_db;
   ```

3. **Note your MySQL credentials**:
   - Username (default: `root`)
   - Password (your MySQL root password)
   - Host (default: `localhost`)
   - Port (default: `3306`)

### Step 2: Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd hotel_backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

   **Note**: If `mysqlclient` installation fails on Windows, you may need to:
   - Install MySQL Connector/C from [MySQL Downloads](https://dev.mysql.com/downloads/connector/c/)
   - Or use `pip install mysqlclient` with pre-built wheels
   - Alternative: Use `pymysql` by installing `pip install pymysql` and adding this to `settings.py`:
     ```python
     import pymysql
     pymysql.install_as_MySQLdb()
     ```

4. **Update database settings** in `hotel_backend/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'hotel_db',
           'USER': 'root',  # Change if needed
           'PASSWORD': 'your_password',  # Change to your MySQL password
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

5. **Run migrations** (creates Hotel, HotelImage, Rating, and Booking tables):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

   **Note**: After running migrations, you'll have these core tables:
   - `Hotel` - Hotel listings
   - `HotelImage` - Multiple images per hotel (URL-based)
   - `Rating` - User ratings/reviews
   - `Booking` - Hotel bookings/reservations

6. **Create a superuser** (for Django admin):
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create an admin user.

7. **Load sample data** (optional - see Step 3 for manual entry):
   ```bash
   python manage.py loaddata sample_hotels.json
   ```

8. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at `http://localhost:8000`

### Step 3: Add Sample Hotels

You have two options to add sample hotels:

#### Option A: Using Django Admin (Recommended)

1. Open your browser and go to `http://localhost:8000/admin`
2. Log in with the superuser credentials you created
3. Click on "Hotels" under the "HOTELS" section
4. Click "Add Hotel" and fill in the details:
   - Name, Location, Price, Rating
   - Image URL (you can use placeholder images like `https://via.placeholder.com/800x400`)
   - Description
   - Amenities (as JSON array, e.g., `["WiFi", "Pool", "Gym", "Spa"]`)
5. (Optional) Add multiple images under "Hotel Images" for a gallery
6. Add at least 8 hotels with different prices, ratings, and locations

#### Option B: Using Django Shell

```bash
python manage.py shell
```

Then run:
```python
from hotels.models import Hotel

hotels_data = [
    {
        "name": "Grand Plaza Hotel",
        "location": "New York, USA",
        "price": 250.00,
        "rating": 4.5,
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "description": "Luxurious hotel in the heart of Manhattan with stunning city views.",
        "amenities": ["WiFi", "Pool", "Gym", "Spa", "Restaurant"]
    },
    # Add more hotels...
]

for hotel_data in hotels_data:
    Hotel.objects.create(**hotel_data)
```

### Step 4: Frontend Setup

1. **Open a new terminal** (keep the backend server running)

2. **Navigate to the project root** (where `package.json` is located)

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

**Note:** The frontend uses `API_BASE_URL` in `src/services/api.js`. Update it if your backend URL changes.

## Running the Application

1. **Start the backend** (Terminal 1):
   ```bash
   cd hotel_backend
   python manage.py runserver
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## API Endpoints

### List All Hotels
```
GET http://localhost:8000/api/hotels/
```

**Query Parameters for Sorting**:
- `?ordering=price` - Sort by price (low to high)
- `?ordering=-price` - Sort by price (high to low)
- `?ordering=-rating` - Sort by rating (high to low)
- `?ordering=name` - Sort by name (A-Z)
- `?search=keyword` - Search by name or location (optional)

**Example**:
```
GET http://localhost:8000/api/hotels/?ordering=-rating
```

### Get Single Hotel
```
GET http://localhost:8000/api/hotels/{id}/
```

**Example**:
```
GET http://localhost:8000/api/hotels/1/
```

**Response includes**:
- Hotel details
- `ratings_count` - Number of user ratings
- `average_user_rating` - Average rating from user reviews (if available)
- `images` - Array of hotel images (if added)

### Get Hotel Ratings
```
GET http://localhost:8000/api/hotels/{id}/ratings/
```

**Example**:
```
GET http://localhost:8000/api/hotels/1/ratings/
```

Returns a list of all user ratings/reviews for the hotel.

### Submit a Rating
```
POST http://localhost:8000/api/hotels/{id}/ratings/
```
Requires user login (token auth). Hotel accounts cannot submit reviews.

**Request Body**:
```json
{
  "user_name": "John Doe",
  "rating": 5,
  "comment": "Great hotel with excellent service!"
}
```

**Fields**:
- `user_name` (required) - Name of the reviewer
- `rating` (required) - Rating from 1 to 5
- `comment` (optional) - Review text

**Example**:
```bash
curl -X POST http://localhost:8000/api/hotels/1/ratings/ \
  -H "Authorization: Token <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_name": "John Doe", "rating": 5, "comment": "Amazing experience!"}'
```

### Hotel Reply to a Rating
```
POST http://localhost:8000/api/ratings/{id}/reply/
```
**Body:** `{ "hotel_reply": "Thanks for your feedback!" }` (hotel token required)
Only hotel accounts can reply, and only to their own hotel's reviews.

### User Authentication
```
POST http://localhost:8000/api/auth/register/
POST http://localhost:8000/api/auth/login/
POST http://localhost:8000/api/auth/logout/
GET  http://localhost:8000/api/auth/profile/
```

### Create a Booking
```
POST http://localhost:8000/api/hotels/{id}/book/
```
Requires user login (token auth). Hotel accounts cannot book rooms.

**Request Body**:
```json
{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "check_in": "2024-12-25",
  "check_out": "2024-12-28",
  "num_guests": 2
}
```

**Fields**:
- `guest_name` (required) - Full name of the guest
- `guest_email` (required) - Email address
- `check_in` (required) - Check-in date (YYYY-MM-DD)
- `check_out` (required) - Check-out date (YYYY-MM-DD, must be after check-in)
- `num_guests` (required) - Number of guests (1-20)

**Response**:
Returns booking details including:
- `booking_reference` - Unique 8-character booking reference
- `total_price` - Calculated total (price per night * number of nights)
- `status` - Booking status (pending, confirmed, declined, cancelled)
- `can_cancel` - Boolean flag for user cancellation window
- `cancel_deadline` - ISO timestamp for cancellation deadline
- All booking details

**Example**:
```bash
curl -X POST http://localhost:8000/api/hotels/1/book/ \
  -H "Authorization: Token <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "check_in": "2024-12-25",
    "check_out": "2024-12-28",
    "num_guests": 2
  }'
```

### List Bookings (User/Hotel)
```
GET http://localhost:8000/api/bookings/
```
Returns only the authenticated user's bookings or the authenticated hotel's bookings.

### Approve/Decline Booking (Hotel)
```
POST http://localhost:8000/api/bookings/{id}/approve/
POST http://localhost:8000/api/bookings/{id}/decline/
```
Only hotel accounts can approve or decline pending bookings.

### Cancel a Booking (User)
```
POST http://localhost:8000/api/bookings/{id}/cancel/
```
- Users can cancel within 2 hours of booking creation.
- After the window expires, ask the hotel to cancel.

### Hotel Authentication
```
POST http://localhost:8000/api/auth/hotel/login/
POST http://localhost:8000/api/auth/hotel/logout/
GET  http://localhost:8000/api/auth/hotel/profile/
```

### Cancel a Booking (Hotel)
```
POST http://localhost:8000/api/bookings/{id}/hotel-cancel/
```
- Hotels can cancel pending or confirmed bookings.

## How Sorting Works

The frontend sends sorting requests to the Django API using query parameters:

1. User selects a sort option from the dropdown
2. Frontend updates the `ordering` query parameter
3. Django REST Framework's `OrderingFilter` processes the request
4. Database query is executed with the appropriate `ORDER BY` clause
5. Sorted results are returned as JSON

**Supported Ordering Fields**:
- `price` / `-price` - Price ascending/descending
- `rating` / `-rating` - Rating ascending/descending
- `name` / `-name` - Name alphabetical/reverse

## Features

### Frontend Pages

1. **Home Page** (`/`)
   - Welcome banner
   - Featured hotels

2. **Hotels List** (`/hotels`)
   - Grid layout of all hotels
   - Search and sorting

3. **Hotel Details** (`/hotels/:id`)
   - Hotel info, amenities, and ratings
   - Booking modal
   - Hotel replies to reviews (if logged in as hotel)

4. **User Register/Login** (`/register`, `/login`)
   - User authentication

5. **User Dashboard** (`/user/dashboard`)
   - View bookings and cancel within window

6. **Hotel Login** (`/hotel/login`)
   - Hotel account authentication

7. **Hotel Dashboard** (`/hotel/dashboard`)
   - Approve/decline/cancel bookings
   - Reply to reviews

8. **Contact** (`/contact`)
   - Contact form

### Components

- **Navbar** - Navigation with logo and links
- **HotelCard** - Reusable card component for hotel listings
- **LoadingSpinner** - Loading state indicator
- **ErrorMessage** - Error state display
- **RatingForm** - Form to submit guest ratings/reviews (login required)
- **RatingList** - Display list of ratings and hotel replies
- **BookingModal** - Modal with booking form and confirmation
- **ImageGallery** - Hotel image carousel/gallery

## Troubleshooting

### Backend Issues

1. **MySQL Connection Error**:
   - Verify MySQL server is running
   - Check database credentials in `settings.py`
   - Ensure database `hotel_db` exists

2. **Module Not Found**:
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt` again

3. **Migration Errors**:
   - Delete migration files (except `__init__.py`) and run `makemigrations` again
   - Or reset database: drop and recreate `hotel_db`
   - If you see `Unknown column hotels_rating.hotel_reply`, run `python manage.py migrate` to apply the latest migration

### Frontend Issues

1. **CORS Error**:
   - Ensure backend is running on `http://localhost:8000`
   - Check `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:5173`

2. **API Connection Error**:
   - Verify backend server is running
   - Check browser console for error messages
   - Ensure API base URL in `src/services/api.js` is correct

3. **No Hotels Displayed**:
   - Check if hotels exist in database (via Django admin)
   - Verify API endpoint returns data: `http://localhost:8000/api/hotels/`

## Development Notes

- **Authentication**: Token auth for users and hotels (booking/review requires user login; hotel reply requires hotel login)
- **Plain CSS**: No CSS frameworks used, all styling is custom
- **Responsive Design**: Mobile-friendly layouts using CSS Grid and Flexbox
- **Error Handling**: Frontend includes loading and error states for better UX
- **Security**: Ratings/Bookings are read-only via list endpoints; create via custom endpoints; cancellation window enforced (2 hours)
- **Images**: Hotel images are URL-based and exposed via the `images` array with `image` as a fallback

## Next Steps (Optional Enhancements)

- Add payment gateway integration
- Improve availability/overlap checks
- Add file upload/storage for hotel images
- Add notifications (email/SMS)
- Add advanced filters (price range, amenities)

## License

This project is created for educational purposes.
