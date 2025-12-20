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
├── hotel_backend/          # Django backend
│   ├── hotel_backend/      # Project settings
│   ├── hotels/            # Hotels app
│   │   ├── models.py      # Hotel model
│   │   ├── serializers.py # DRF serializers
│   │   ├── views.py       # API viewsets
│   │   ├── urls.py        # API URLs
│   │   └── admin.py       # Admin configuration
│   ├── manage.py
│   └── requirements.txt
├── src/                    # React frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API service
│   ├── styles.css        # Global styles
│   └── main.jsx          # Entry point
├── package.json
├── vite.config.js
└── README.md
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

5. **Run migrations** (creates Hotel, Rating, and Booking tables):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
   
   **Note**: After running migrations, you'll have three tables:
   - `Hotel` - Hotel listings
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
5. Add at least 8 hotels with different prices, ratings, and locations

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
  -H "Content-Type: application/json" \
  -d '{"user_name": "John Doe", "rating": 5, "comment": "Amazing experience!"}'
```

### Create a Booking
```
POST http://localhost:8000/api/hotels/{id}/book/
```

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
- `total_price` - Calculated total (price per night × number of nights)
- `status` - Booking status (confirmed)
- All booking details

**Example**:
```bash
curl -X POST http://localhost:8000/api/hotels/1/book/ \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "check_in": "2024-12-25",
    "check_out": "2024-12-28",
    "num_guests": 2
  }'
```

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
   - Navigation to hotels list

2. **Hotels List** (`/hotels`)
   - Grid layout of all hotels
   - Sort dropdown (Price, Rating, Name)
   - Responsive design
   - Loading and error states

3. **Hotel Details** (`/hotels/:id`)
   - Large hotel image
   - Full description
   - Amenities list
   - Price and rating display
   - User rating form (submit reviews)
   - User ratings list (view all reviews)
   - Average user rating display
   - **Book Now button** - Opens booking modal with form
   - **Booking simulation** - Complete booking flow with confirmation

### Components

- **Navbar** - Navigation with logo and links
- **HotelCard** - Reusable card component for hotel listings
- **LoadingSpinner** - Loading state indicator
- **ErrorMessage** - Error state display
- **RatingForm** - Form to submit user ratings/reviews
- **RatingList** - Display list of user ratings/reviews
- **BookingModal** - Modal with booking form and confirmation

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

- **No Authentication**: This is a school project with public API access
- **Plain CSS**: No CSS frameworks used, all styling is custom
- **Responsive Design**: Mobile-friendly layouts using CSS Grid and Flexbox
- **Error Handling**: Frontend includes loading and error states for better UX

## Next Steps (Optional Enhancements)

- Add search functionality
- Implement pagination
- Add image upload for hotels
- Create booking functionality
- Add user authentication
- Implement favorites/bookmarks
- Add reviews and ratings system

## License

This project is created for educational purposes.

---

**Happy Coding! 🏨**

