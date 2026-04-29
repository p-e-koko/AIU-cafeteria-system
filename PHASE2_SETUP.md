# Phase 2: Authentication and Roles - Setup Guide

## What's Implemented

✅ **Backend Setup**
- Express.js server with SQLite database
- Sequelize ORM with User model
- User model with bcrypt password hashing
- JWT-based authentication
- Role-based access control (Student, Staff, Admin)
- Auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify`

✅ **Frontend Updates**
- React API service with axios
- Login and registration combined on one page
- Token storage in localStorage
- Protected routes with role-based access
- Navbar with logout and user info display
- Updated Sidebar with admin menu items (conditionally)

✅ **Database**
- SQLite database (stored as `backend/database.sqlite`)
- User table with email, hashed password, role, timestamps
- Demo users pre-created:
  - Student: email: `demo@aiu.edu`, password: `password123`
  - Admin: email: `admin@aiu.edu`, password: `admin123`

## How to Run

### Backend Setup (One-time)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
npm run dev
# Or for production: npm start
```

The backend will run on `http://localhost:5000` and automatically:
- Create the SQLite database
- Sync the User model
- Create demo users if they don't exist

### Frontend Setup (One-time)

```bash
# In the root directory (AIU-cafeteria-system)
npm install

# Install the new axios dependency
npm install axios

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000`

### Running Both Together

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (in root directory):**
```bash
npm start
```

Both should be running simultaneously for the app to work properly.

## Testing the Authentication

### Test Case 1: Login with Demo Student
1. Go to http://localhost:3000
2. Click "Sign In" (or use demo link)
3. Email: `demo@aiu.edu`
4. Password: `password123`
5. You'll see the main dashboard with "Student" role displayed

### Test Case 2: Create New Account
1. Click "Register" link on the login page
2. Fill in name, email, password, and select role
3. Submit - creates new user in database
4. Automatically logs in and redirects to dashboard

### Test Case 3: Admin Login
1. Email: `admin@aiu.edu`
2. Password: `admin123`
3. Notice extra "Admin Dashboard", "Suggestion Review", and "Analytics" menu items in sidebar

### Test Case 4: Token Persistence
1. Log in as any user
2. Refresh the page - you should stay logged in
3. Check browser console - token is stored in localStorage

### Test Case 5: Session Expiration
1. Log in and note your token
2. Manually delete the token from localStorage
3. Refresh - redirected to login page

## Project Structure

```
AIU-cafeteria-system/
├── backend/                    # Express API server
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── models/
│   │   ├── index.js           # Sequelize config
│   │   └── User.js            # User model with bcrypt
│   ├── routes/
│   │   └── auth.js            # Auth endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT verification & RBAC
│   └── database.sqlite        # SQLite database (auto-created)
│
├── src/
│   ├── services/
│   │   └── api.js             # Axios API client with interceptors
│   ├── LoginPage.js           # Updated with real API calls
│   ├── components/
│   │   └── Layout.js          # Updated Navbar with logout & role display
│   ├── App.js                 # Fixed JSX & route protection
│   └── ...
│
└── package.json               # Frontend dependencies (now includes axios)
```

## Key Features in Phase 2

### 1. **Secure Password Storage**
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Hash happens automatically on user creation/update

### 2. **JWT Authentication**
- Token expires in 24 hours (customizable in `.env`)
- Token sent with every API request (Authorization header)
- Invalid/expired tokens auto-redirect to login

### 3. **Role-Based Access Control**
- Three roles: `Student`, `Staff`, `Admin`
- Admin menu items only visible to admin users
- Protected routes reject unauthorized access
- Can extend with `requireRole` middleware for specific endpoints

### 4. **Token Management**
- Stored in `localStorage` for persistence
- Cleared on logout
- Auto-attached to all API requests
- Failed requests with 401 auto-logout user

## Environment Variables

Backend `.env` file:
```env
PORT=5000
DB_PATH=./database.sqlite
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRY=24h
NODE_ENV=development
```

⚠️ **For production:** Change `JWT_SECRET` to a strong random value

## Common Issues & Solutions

### "Backend is not running"
- Make sure `npm run dev` is running in backend terminal
- Check http://localhost:5000/api/health should show `{"message":"Backend is running"}`

### "CORS error"
- Ensure backend is running before frontend
- Backend is configured to accept requests from `http://localhost:3000`

### "Invalid token" after login
- Clear localStorage and logger in again
- Command: `localStorage.clear()` in browser console

### Database locked error
- Delete `backend/database.sqlite` and restart backend
- New database will be created with demo users

## Next Phase (Phase 3)

Once Phase 2 is working:
1. Implement Menu Suggestion model in backend
2. Create suggestion form on frontend
3. Add approve/reject endpoints for admins
4. Build suggestion list view with filters

## Notes

- Database autosyncs on startup (set `alter: true` in server.js if you modify models)
- Demo users are created on first run only
- JWT secret should be very secure in production
- Consider adding password reset functionality later
- Email validation is basic (only checks format)

## Documentation

- Sequelize docs: https://sequelize.org/
- Express docs: https://expressjs.com/
- JWT docs: https://jwt.io/
- bcrypt docs: https://www.npmjs.com/package/bcrypt
