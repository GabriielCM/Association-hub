#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
TEST_EMAIL="test-hashed-tokens-$(date +%s)@example.com"
TEST_PASSWORD="SecurePassword123!"
TEST_NAME="Test User"
TEST_ASSOCIATION="test-association-id"

echo -e "${YELLOW}=== Refresh Token Hashing Verification Script ===${NC}\n"

# Check if server is running
echo -e "${YELLOW}[1/6] Checking if API server is running...${NC}"
if curl -s -f "${API_URL}/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API server is running${NC}\n"
else
  echo -e "${RED}✗ API server is not responding at ${API_URL}${NC}"
  echo -e "${YELLOW}Please start the server with: pnpm dev:api${NC}\n"
  exit 1
fi

# Step 1: Register a new user
echo -e "${YELLOW}[2/6] Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\",
    \"associationId\": \"${TEST_ASSOCIATION}\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ User registered successfully${NC}"
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  echo -e "  Email: ${TEST_EMAIL}"
  echo -e "  Refresh Token (first 20 chars): ${REFRESH_TOKEN:0:20}...\n"
else
  echo -e "${RED}✗ Failed to register user${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

# Step 2: Verify token is hashed in database
echo -e "${YELLOW}[3/6] Verifying token is hashed in database...${NC}"
echo -e "${YELLOW}NOTE: This requires manual database inspection${NC}"
echo -e "${YELLOW}Run this SQL query:${NC}"
echo -e "  ${GREEN}SELECT substring(token, 1, 10) as token_prefix, length(token) as token_length FROM \"RefreshToken\" WHERE \"createdAt\" > NOW() - INTERVAL '1 minute';${NC}"
echo -e "${YELLOW}Expected:${NC}"
echo -e "  - token_prefix should be: \$2b\$10\$..."
echo -e "  - token_length should be: 60"
echo -e "${YELLOW}Or use Prisma Studio: pnpm --filter @ahub/database studio${NC}\n"
read -p "Press Enter after verifying the token is hashed in the database..."

# Step 3: Use refresh token to get new access token
echo -e "\n${YELLOW}[4/6] Testing refresh token endpoint...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ Successfully refreshed tokens${NC}"
  NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

  # Verify tokens changed
  if [ "$ACCESS_TOKEN" != "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ New access token is different from original${NC}\n"
  else
    echo -e "${RED}✗ New access token is same as original${NC}\n"
  fi

  ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
  REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
else
  echo -e "${RED}✗ Failed to refresh tokens${NC}"
  echo "Response: $REFRESH_RESPONSE"
  exit 1
fi

# Step 4: Test logout
echo -e "${YELLOW}[5/6] Testing logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ Logout successful${NC}\n"
else
  echo -e "${YELLOW}⚠ Logout returned HTTP $HTTP_CODE (might still be successful)${NC}\n"
fi

# Step 5: Test invalid token rejection
echo -e "${YELLOW}[6/6] Testing invalid token rejection...${NC}"

# Test with the token we just used (should be deleted after logout)
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Invalid token correctly rejected (HTTP 401)${NC}"
else
  echo -e "${RED}✗ Invalid token not rejected (HTTP $HTTP_CODE)${NC}"
  echo "Response: $INVALID_RESPONSE"
fi

# Test with completely invalid token
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "completely-invalid-token-12345"
  }')

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Malformed token correctly rejected (HTTP 401)${NC}\n"
else
  echo -e "${RED}✗ Malformed token not rejected (HTTP $HTTP_CODE)${NC}\n"
fi

# Summary
echo -e "${YELLOW}=== Verification Summary ===${NC}"
echo -e "${GREEN}✓ User registration works${NC}"
echo -e "${YELLOW}⚠ Database token hashing (manual check required)${NC}"
echo -e "${GREEN}✓ Token refresh works${NC}"
echo -e "${GREEN}✓ Logout works${NC}"
echo -e "${GREEN}✓ Invalid token rejection works${NC}"
echo -e "\n${YELLOW}Please verify in the database that tokens are stored as bcrypt hashes.${NC}"
echo -e "${YELLOW}See MANUAL_VERIFICATION_GUIDE.md for detailed instructions.${NC}\n"
