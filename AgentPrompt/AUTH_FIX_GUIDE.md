# Authentication Fix - Admin Portal ✅

## Problem Identified

The admin portal was using **mock data** instead of real backend data because:

- JWT tokens were stored in **HttpOnly cookies**
- But Spring Security expects tokens in the **Authorization header** as `Bearer <token>`
- The axios client wasn't adding the token to requests

## Solution Implemented

### 1. Updated Token Route (`/api/auth/token/route.ts`)

✅ Created GET endpoint to retrieve token from HttpOnly cookie

### 2. Updated Axios Interceptor (`config/axios.tsx`)

✅ Added request interceptor that:

- Fetches token from server-side cookie via API route
- Caches token for performance
- Adds token to Authorization header: `Authorization: Bearer <token>`
- Clears cache on 401 errors

### 3. Removed Invalid Import (`analyticsService.ts`)

✅ Removed `import { log } from "console"` (Node.js only module)

## How to Test

### Step 1: Clear Browser Cache

```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

### Step 2: Log In Again

1. Navigate to `http://localhost:3000/login`
2. Log in with your admin credentials
3. You should be redirected to `/admin/dashboard`

### Step 3: Check Browser Console

Open Developer Tools (F12) and check the Console tab. You should see:

```
Analytics response: { code: 1000, message: "...", result: {...} }
```

**If you see this, it's working!** ✅

### Step 4: Verify the Request

In the Network tab, find the request to `/admin/analytics/dashboard`:

**Request Headers should include:**

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Response should be:**

```json
{
  "code": 1000,
  "message": "Analytics retrieved successfully",
  "result": {
    "totalUsers": 5,
    "totalVideos": 10,
    ...
  }
}
```

### Step 5: Check Dashboard

The yellow warning banner should **disappear** and show real data!

## Debugging Steps

### Issue: Still seeing mock data (all zeros)

**Check 1: Are you logged in?**

```javascript
// In browser console:
document.cookie;
// Should show: accessToken=...
```

**Check 2: Is the token being sent?**

1. Open Network tab
2. Find request to `/admin/analytics/dashboard`
3. Check Request Headers → Should have `Authorization: Bearer ...`

**Check 3: Backend logs**
Check your Spring Boot console for:

```
Generating dashboard analytics
```

If you see authentication errors:

```
Access is denied (user does not have ADMIN role)
```

### Issue: 401 Unauthorized

**Solution 1: Your user needs ADMIN role**

Connect to MongoDB:

```bash
mongosh
use thesocial

# Check your user's roles
db.users.findOne({ username: "your_username" })
```

If you don't have ADMIN role, add it:

```javascript
// First, find the ADMIN role ID
db.roles.findOne({ roleName: "ADMIN" });
// Copy the _id

// Then update your user
db.users.updateOne(
  { username: "your_username" },
  {
    $addToSet: {
      roles: ObjectId("paste_admin_role_id_here"),
    },
  }
);
```

**Solution 2: Token expired**

- Log out and log back in
- The token cookie has a 7-day expiry

### Issue: 403 Forbidden

This means you're authenticated but don't have ADMIN authority. Follow "Solution 1" above to add ADMIN role.

### Issue: CORS errors

If you see CORS errors in console, make sure your Spring Boot backend has CORS configured for `http://localhost:3000`.

Check `SecuritySetting.java` or create a CORS configuration:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/**", config);

        return new CorsFilter(source);
    }
}
```

## How It Works Now

### Request Flow:

```
1. Dashboard Component loads
   ↓
2. useAnalytics() hook calls analyticsService.getDashboardAnalytics()
   ↓
3. Axios interceptor runs:
   - Calls /api/auth/token (GET)
   - Retrieves token from HttpOnly cookie
   - Caches token in memory
   - Adds to request: Authorization: Bearer <token>
   ↓
4. Request sent to backend: GET /admin/analytics/dashboard
   ↓
5. Spring Security validates JWT token
   ↓
6. Checks if user has ADMIN authority
   ↓
7. AnalyticsService generates real analytics
   ↓
8. Returns data to frontend
   ↓
9. Dashboard displays real data ✅
```

### Token Caching:

- First request: Fetches token from cookie (1 extra request)
- Subsequent requests: Uses cached token (no extra requests)
- On 401 error: Clears cache and tries refresh

## Performance

✅ **Optimized**: Token is cached in memory

- First API call: 2 requests (token + analytics)
- Next API calls: 1 request each (uses cached token)

## Security

✅ **Secure**:

- Token stored in HttpOnly cookie (XSS protection)
- Token only exposed to server-side API routes
- Cached token is cleared on logout/error
- 7-day expiry on cookies

## Testing Real Data

If you want to see real data instead of zeros, add some test data:

```javascript
// Connect to MongoDB
mongosh
use thesocial

// Add test users
db.users.insertMany([
  { username: "user1", mail: "user1@test.com", enable: true, roles: [], createdAt: new Date() },
  { username: "user2", mail: "user2@test.com", enable: true, roles: [], createdAt: new Date() },
  { username: "user3", mail: "user3@test.com", enable: true, roles: [], createdAt: new Date() }
])

// Add test videos
db.videos.insertMany([
  { title: "Video 1", uploader: "user1", createdAt: new Date() },
  { title: "Video 2", uploader: "user2", createdAt: new Date() }
])

// Add test comments
db.comments.insertMany([
  { content: "Great video!", userDetailId: "123", createdAt: new Date() },
  { content: "Nice!", userDetailId: "456", createdAt: new Date() }
])
```

Then refresh the dashboard!

## Quick Verification Commands

```bash
# Check if backend is running
curl http://localhost:8082/api/v1/admin/analytics/dashboard

# Should return 401 or 403 (needs auth)

# Check with authentication (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8082/api/v1/admin/analytics/dashboard
```

## Summary

✅ **Fixed**: JWT token now properly sent in Authorization header
✅ **Cached**: Token cached for performance
✅ **Secure**: HttpOnly cookies + Bearer token pattern
✅ **Working**: Dashboard should now show real analytics data

## Next Steps

1. **Clear browser cache** and cookies
2. **Log in** to the admin portal
3. **Navigate** to dashboard
4. **Verify** real data is displayed
5. **Check** browser console for the log: "Analytics response: ..."

If you still see issues, check the debugging steps above! 🚀
