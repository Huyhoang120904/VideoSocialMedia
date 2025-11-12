# TikTok Clone - Setup Guide

## Prerequisites

- **Java 17+** (for backend)
- **Maven** (for backend)
- **Node.js 18+** (for frontend/admin-portal)
- **MongoDB** (running on localhost:27017)

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If not running, start it:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 2. Start Backend Server

Open a terminal in the backend directory:

```bash
cd D:\Sturdy\PersonalRepository\TiktokClone\backend

# Using Maven Wrapper (recommended)
mvnw spring-boot:run

# Or if Maven is installed globally
mvn spring-boot:run
```

**Expected Output:**
```
Started Application in X.XXX seconds
Tomcat started on port(s): 8082 (http)
```

**Backend will be available at:** `http://localhost:8082/api/v1`

### 3. Start Admin Portal

Open a new terminal in the admin-portal directory:

```bash
cd D:\Sturdy\PersonalRepository\TiktokClone\admin-portal

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Admin Portal will be available at:** `http://localhost:3000`

### 4. Create Admin User (First Time Setup)

If you don't have an admin user yet, you can create one using MongoDB:

```bash
mongosh

use thesocial

# Create an admin user (update with your desired credentials)
db.users.insertOne({
  username: "admin",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  mail: "admin@example.com",
  enable: true,
  roles: [
    { "$ref": "roles", "$id": "admin_role_id" }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the registration endpoint and manually assign ADMIN role in the database.

## Troubleshooting

### Issue: "Backend server is not running or not accessible"

**Solution:**
1. Check if backend is running on port 8082
2. Run: `netstat -ano | findstr :8082` (Windows) or `lsof -i :8082` (Linux/Mac)
3. If nothing is running, start the backend server (see step 2 above)

### Issue: "Authentication required" or 401 errors

**Solution:**
1. Make sure you're logged in via the admin portal
2. Check if your session token is valid
3. Try logging out and logging back in
4. Check browser console for authentication errors

### Issue: "Access forbidden" or 403 errors

**Solution:**
1. Your user needs ADMIN role
2. Check your user's roles in MongoDB:
   ```bash
   db.users.findOne({ username: "your_username" })
   ```
3. Make sure the user has the ADMIN role assigned

### Issue: MongoDB connection refused

**Solution:**
1. Ensure MongoDB is running
2. Check connection string in `backend/src/main/resources/application.yml`
3. Default should be: `mongodb://localhost:27017/thesocial`

### Issue: Port already in use (8082 or 3000)

**Solution:**

For Backend (Port 8082):
```bash
# Windows
netstat -ano | findstr :8082
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:8082 | xargs kill -9
```

For Frontend (Port 3000):
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: Analytics showing zero values

**Possible Causes:**
1. **Empty Database**: Fresh database with no data
   - **Solution**: Add some test data or use the mobile app to create content

2. **Backend Errors**: Check backend console for errors
   - **Solution**: Look for stack traces in the backend console
   - Common issue: Missing collections in MongoDB

3. **Data Format Issues**: Data might not match expected format
   - **Solution**: Check backend logs for warnings

## Verify Setup

### 1. Check Backend Health

Visit: `http://localhost:8082/api/v1/actuator/health` (if actuator is enabled)

Or test authentication endpoint:
```bash
curl -X POST http://localhost:8082/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### 2. Check Analytics Endpoint (after login)

```bash
curl -X GET http://localhost:8082/api/v1/admin/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Check Frontend

1. Open: `http://localhost:3000`
2. Login with admin credentials
3. Navigate to: `http://localhost:3000/admin/dashboard`
4. Check browser console for any errors

## Environment Variables

### Backend (.env or application.yml)

```yaml
server:
  port: 8082
  servlet:
    context-path: /api/v1

spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/thesocial
```

### Admin Portal (.env.local)

Create a `.env.local` file in the admin-portal directory:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8082/api/v1
```

## Development Workflow

### 1. Start Services in Order:
```bash
# Terminal 1: MongoDB (if not already running as service)
mongod

# Terminal 2: Backend
cd backend && mvnw spring-boot:run

# Terminal 3: Admin Portal
cd admin-portal && npm run dev

# Terminal 4: Mobile App (optional)
cd mobile-app && npm start
```

### 2. Access Applications:
- **Admin Portal**: http://localhost:3000
- **Backend API**: http://localhost:8082/api/v1
- **Mobile App**: Expo Go app on your device

## Useful Commands

### Backend
```bash
# Build
mvnw clean package

# Run tests
mvnw test

# Skip tests
mvnw spring-boot:run -DskipTests
```

### Admin Portal
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### MongoDB
```bash
# Connect to database
mongosh

# Select database
use thesocial

# List collections
show collections

# Count users
db.users.count()

# Count videos
db.videos.count()

# View analytics collections
db.users.count()
db.videos.count()
db.comments.count()
db.report_ticket.count()
```

## Next Steps

1. ✅ Backend running on port 8082
2. ✅ Admin portal running on port 3000
3. ✅ MongoDB running and accessible
4. ✅ Admin user created with proper roles
5. ✅ Login successful
6. ✅ Dashboard showing analytics (or mock data if no content exists)

## Need Help?

Check the following files for more information:
- `/DASHBOARD_IMPROVEMENTS.md` - Dashboard feature documentation
- `/backend/README.md` - Backend API documentation
- `/admin-portal/README.md` - Admin portal documentation

## Production Deployment

For production deployment, see:
- Backend: Use `mvnw clean package` to create a JAR file
- Frontend: Use `npm run build` to create optimized production build
- Use environment-specific configuration files
- Set up proper authentication and HTTPS
- Configure CORS properly for your domain

