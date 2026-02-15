# Manual Verification Guide: Hashed Refresh Tokens

## Overview
This guide provides step-by-step instructions to manually verify that refresh tokens are properly hashed before database storage and that the authentication flow works correctly.

## Prerequisites
1. Database running (PostgreSQL)
2. Redis running (for NestJS caching)
3. Environment variables configured (.env file)
4. API dependencies installed (`pnpm install`)

## Verification Steps

### Step 1: Start the API Server

```bash
# From the project root
pnpm dev:api
```

Expected output: Server should start on port 3000 (or configured port)

### Step 2: Register a New User

**Request:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-hashed-tokens@example.com",
    "password": "SecurePassword123!",
    "name": "Test User",
    "associationId": "test-association-id"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Save the tokens for later steps:**
```bash
# Save these values
ACCESS_TOKEN="<your-access-token>"
REFRESH_TOKEN="<your-refresh-token>"
```

### Step 3: Verify Token is Hashed in Database

**Using Prisma Studio:**
```bash
# Open Prisma Studio
pnpm --filter @ahub/database studio
```

Navigate to the `RefreshToken` table and check:
- ✅ The `token` field should start with `$2b$10$` (bcrypt hash prefix)
- ✅ The token should be 60 characters long (bcrypt hash length)
- ❌ The token should NOT match the plain `refreshToken` you received

**Using psql CLI:**
```bash
# Connect to your database
psql -h localhost -U your_user -d your_database

# Query refresh tokens
SELECT id, substring(token, 1, 10) as token_prefix, length(token) as token_length, "userId", "expiresAt"
FROM "RefreshToken"
ORDER BY "createdAt" DESC
LIMIT 5;
```

**Expected output:**
```
token_prefix | token_length
$2b$10$... | 60
```

### Step 4: Use Refresh Token to Get New Access Token

**Request:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Verification:**
- ✅ Should receive new tokens (different from the original ones)
- ✅ HTTP 200 status
- ✅ Check database again - old hashed token should be deleted, new hashed token should exist

### Step 5: Verify Logout Deletes Tokens

**Get user ID from access token:**
```bash
# Decode JWT (you can use jwt.io or a JWT decoder)
# Extract the "sub" field which is the userId
```

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected Response:**
- ✅ HTTP 200 status
- ✅ Empty response or success message

**Database Verification:**
```bash
# Using psql
SELECT COUNT(*) FROM "RefreshToken" WHERE "userId" = '<your-user-id>';
```

**Expected output:**
```
count
0
```

### Step 6: Attempt to Use Invalid Refresh Token

**Request:**
```bash
# Try with a completely invalid token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-token-12345"
  }'
```

**Expected Response:**
- ✅ HTTP 401 Unauthorized
- ✅ Error message about invalid token

**Request with expired/non-existent token:**
```bash
# Try with the token you already used (after logout)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

**Expected Response:**
- ✅ HTTP 401 Unauthorized
- ✅ Error message about invalid or expired token

## Security Verification Checklist

After completing all steps, verify:

- [x] **Tokens are hashed in database**: Refresh tokens in the `RefreshToken` table are bcrypt hashes (60 chars, starting with `$2b$10$`)
- [x] **Plain tokens cannot be extracted**: The database only contains hashes, not the actual JWT tokens
- [x] **Token validation works**: Users can successfully refresh their access tokens using valid refresh tokens
- [x] **Invalid tokens are rejected**: Attempting to use invalid, expired, or already-used tokens results in 401 errors
- [x] **Logout clears tokens**: After logout, all refresh tokens for the user are removed from the database
- [x] **Hash comparison is secure**: The implementation uses `bcrypt.compare()` for constant-time comparison

## Troubleshooting

### Issue: Cannot start API server
**Solution:** Check that PostgreSQL and Redis are running, and .env file is properly configured

### Issue: 401 on refresh endpoint with valid token
**Solution:** Check that:
- The JWT_REFRESH_SECRET in .env matches what was used to sign the token
- The token hasn't expired
- The database contains the hashed token for that user

### Issue: Database shows plain text tokens
**Solution:** Verify that:
- The code changes were properly deployed
- The server was restarted after code changes
- You're registering a NEW user (old tokens were created before the change)

## Implementation Details

### How It Works

1. **Token Generation** (auth.service.ts ~line 172):
   ```typescript
   const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
   await this.prisma.refreshToken.create({
     data: { token: hashedRefreshToken, ... }
   });
   ```

2. **Token Validation** (auth.service.ts ~line 119):
   ```typescript
   for (const storedToken of refreshTokens) {
     const isValid = await bcrypt.compare(dto.refreshToken, storedToken.token);
     if (isValid) {
       matchedToken = storedToken;
       break;
     }
   }
   ```

3. **Security Benefits**:
   - Database breach doesn't expose usable tokens
   - Attacker would need to crack bcrypt hashes (computationally expensive)
   - Defense-in-depth security layer

## Notes

- **Breaking Change**: All existing refresh tokens become invalid after this change deploys
- **User Impact**: All users will need to sign in again after deployment
- **Migration**: No database schema changes required
- **Rollback**: If needed, revert code changes and users sign in again
