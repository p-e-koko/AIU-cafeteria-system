# Phase 2: Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LoginPage.js - Registration & Login Form               │   │
│  │  - Shows login/register form toggle                      │   │
│  │  - Calls authService.login() or .register()             │   │
│  │  - Stores token & user in localStorage                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │  App.js - Protected Routes                              │   │
│  │  - Checks token on mount                                │   │
│  │  - ProtectedRoute wrapper for auth-required pages       │   │
│  │  - AdminRoute wrapper for admin-only pages              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │  Layout.js - Navigation                                 │   │
│  │  - Navbar: Shows user name, role badge, logout button   │   │
│  │  - Sidebar: Shows menu (base + admin items if admin)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │  services/api.js - API Client                            │   │
│  │  - axios instance with Bearer token in headers          │   │
│  │  - authService methods: register(), login(), verify()   │   │
│  │  - Auto-logout on 401 Unauthorized                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                    HTTP (CORS Enabled)
                    http://localhost:5000
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│              Backend (Node.js + Express + Sequelize)            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  server.js - Main Entry Point                             │ │
│  │  - Express app setup                                      │ │
│  │  - CORS middleware (allows localhost:3000)               │ │
│  │  - Route handlers                                         │ │
│  │  - Database initialization                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────▼────────────────────────────┐    │
│  │  routes/auth.js - API Endpoints                          │    │
│  │  POST /api/auth/register  - Create new user              │    │
│  │  POST /api/auth/login     - Verify credentials, return JWT│   │
│  │  GET /api/auth/verify     - Check token validity         │    │
│  │  GET /api/auth/me         - Get current user info        │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────┐    │
│  │  middleware/auth.js - Authentication Middleware         │    │
│  │  verifyToken() - Check JWT in Authorization header       │    │
│  │  requireRole() - Check user role for authorization       │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────┐    │
│  │  models/User.js - User Model (Sequelize ORM)            │    │
│  │  - id (auto-increment)                                  │    │
│  │  - name                                                 │    │
│  │  - email (unique)                                       │    │
│  │  - password (hashed with bcrypt)                        │    │
│  │  - role (Student|Staff|Admin)                           │    │
│  │  - timestamps (createdAt, updatedAt)                    │    │
│  │  - Methods: verifyPassword()                             │    │
│  │  - Hooks: auto-hash password on create/update            │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────┐    │
│  │  models/index.js - Sequelize Configuration             │    │
│  │  - Connect to SQLite database                           │    │
│  │  - Database location: ./database.sqlite                 │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                   │
└───────────────────────────────┼────────────────────────────────────┘
                                │
                        SQLite Database
                    (database.sqlite file)
                        
                    ┌──────────────────────┐
                    │  users table         │
                    ├──────────────────────┤
                    │ id                   │
                    │ name                 │
                    │ email                │
                    │ password (hashed)    │
                    │ role                 │
                    │ createdAt            │
                    │ updatedAt            │
                    └──────────────────────┘
```

## Authentication Flow

### 1. Registration
```
User enters: name, email, password, role
         │
         ▼
Frontend: POST /api/auth/register
         │
         ▼
Backend:
  ✓ Check email not already registered
  ✓ Hash password with bcrypt
  ✓ Save to database
  ✓ Generate JWT token
  ✓ Return token + user info
         │
         ▼
Frontend:
  ✓ Store token in localStorage
  ✓ Store user in localStorage
  ✓ Redirect to dashboard
```

### 2. Login
```
User enters: email, password
         │
         ▼
Frontend: POST /api/auth/login
         │
         ▼
Backend:
  ✓ Find user by email
  ✓ Verify password (bcrypt.compare)
  ✓ If valid, generate JWT token
  ✓ Return token + user info
         │
         ▼
Frontend:
  ✓ Store token in localStorage
  ✓ Store user in localStorage
  ✓ Redirect to dashboard
```

### 3. Protected API Request
```
Frontend needs: User data
         │
         ▼
API Call: GET /api/auth/me
Header: Authorization: Bearer <JWT_TOKEN>
         │
         ▼
Backend middleware (verifyToken):
  ✓ Extract token from header
  ✓ Verify JWT signature
  ✓ Decode payload (id, email, role)
  ✓ Attach user to request object
  ✓ Pass to route handler
         │
         ▼
Route handler:
  ✓ Access req.user from middleware
  ✓ Query database if needed
  ✓ Return protected data
         │
         ▼
Frontend:
  ✓ Receive data
  ✓ Display in UI
```

### 4. Logout
```
User clicks logout
         │
         ▼
Frontend:
  ✓ Delete token from localStorage
  ✓ Delete user from localStorage
  ✓ Redirect to /login
         │
         ▼
Backend: (no logout endpoint needed)
         │
         ▼
Next request without token:
  ✓ axios interceptor catches 401
  ✓ Clears localStorage
  ✓ Redirects to /login
```

## Data Flow: User Object

### At Registration/Login
```javascript
{
  id: 1,
  name: "Demo User",
  email: "demo@aiu.edu",
  role: "Student"
}
```

### Stored in Frontend
- In `localStorage` as JSON string
- In React state (App.js component state)
- Passed as `user` prop to child components

### In JWT Token (encoded)
```javascript
{
  id: 1,
  email: "demo@aiu.edu",
  role: "Student",
  name: "Demo User",
  iat: 1234567890,
  exp: 1234654290
}
```

### When Verifying (backend)
- Token decoded and validated
- Payload attached to `req.user`
- Can be used in middleware for role checking

## Key Security Features

### 1. Password Security
- bcrypt with 10 salt rounds
- Never stored in plain text
- Automatic hashing on user creation/update
- Comparison done securely (bcrypt.compare)

### 2. Token Security
- JWT signed with SECRET_KEY
- Expires after 24 hours
- Stored in localStorage (vulnerable to XSS, but acceptable for demo)
- Sent in Authorization header (not in URL)

### 3. Route Protection
- Token required for protected endpoints
- Role validation for admin endpoints
- CORS prevents cross-origin requests

### 4. Frontend Protection
- Token cleared on logout
- Auto-logout on 401 response
- Protected components check user existence
- Admin routes reject non-admin users

## Environment Variables

### Backend .env
```
PORT=5000                                    # Server port
DB_PATH=./database.sqlite                    # SQLite file location
JWT_SECRET=your_jwt_secret_key_here...       # Token signing key
JWT_EXPIRY=24h                               # Token expiration time
NODE_ENV=development                         # Environment
```

### Frontend .env (optional)
```
REACT_APP_API_URL=http://localhost:5000      # Backend URL
```

## File Organization

```
project/
├── backend/
│   ├── server.js                 # Entry point
│   ├── package.json              # Dependencies
│   ├── .env                      # Environment config
│   ├── database.sqlite           # SQLite DB (created on startup)
│   ├── models/
│   │   ├── index.js              # Sequelize instance
│   │   └── User.js               # User model
│   ├── routes/
│   │   └── auth.js               # Auth endpoints
│   └── middleware/
│       └── auth.js               # JWT & role middleware
│
├── src/
│   ├── services/api.js           # Axios client & API calls
│   ├── App.js                    # Main app with routing
│   ├── LoginPage.js              # Login/Register form
│   ├── components/
│   │   └── Layout.js             # Navbar & Sidebar
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Suggestions.js
│   │   ├── Feedback.js
│   │   └── Summaries.js
│   └── ...
```

## Testing Endpoints with curl

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@aiu.edu","password":"password123","role":"Student"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@aiu.edu","password":"password123"}'
```

### Verify Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer <JWT_TOKEN_HERE>"
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN_HERE>"
```

## Common Customizations

### Change JWT Expiry
Edit `backend/.env`:
```
JWT_EXPIRY=7d    # 7 days
JWT_EXPIRY=30m   # 30 minutes
```

### Add More User Fields
Edit `backend/models/User.js` and add fields to the model definition,
then restart backend (uses `alter: false`, so manual migration or drop table needed).

### Add More Roles
Edit `backend/models/User.js` - ENUM field:
```javascript
role: {
  type: DataTypes.ENUM('Student', 'Staff', 'Admin', 'Faculty'),
  ...
}
```

### Add Email Verification
Create new route in `routes/auth.js` that:
1. Generates verification token
2. Sends email with link
3. POST endpoint verifies token and marks user as verified
4. Only verified users can log in

## Next Steps for Phase 3

The authentication system is ready. Phase 3 (Menu Suggestions) will:
1. Create MenuSuggestion model (similar to User model)
2. Add suggestion routes with admin approval
3. Build frontend form to submit suggestions
4. Create admin review page
5. Connect to existing auth system

All database queries will use `req.user` from the JWT token to know who's making requests.
