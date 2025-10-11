# ZEN Trading Testing Suite

This directory contains test scripts for the ZEN Trading API.

## Test Scripts

### 1. `test-auth.js`
Tests authentication functionality:
- Health check
- User registration
- User login
- Get current user
- Token refresh
- Invalid login handling

**Run:**
```bash
node test-auth.js
```

### 2. `test-complete-flow.js`
Comprehensive end-to-end test of the complete user flow:
- Backend health check
- Stock API endpoints (list & detail)
- User registration
- User login
- Onboarding (zodiac, investing style, starting balance)
- User holdings
- Onboarding status verification

**Run:**
```bash
node test-complete-flow.js
```

## Prerequisites

1. **Backend must be running** on port 42069
2. **Database must be accessible**
3. **Node.js** must be installed

## Running Tests with Docker

If you're using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy (check logs)
docker-compose logs -f backend

# Run tests from host machine
cd testing
node test-complete-flow.js

# Or run tests from testing container
docker-compose exec testing node test-complete-flow.js
```

## Test Output

The tests provide:
- ✅ Green checkmarks for passing tests
- ❌ Red X marks for failing tests
- 📊 Summary statistics at the end
- Detailed error messages for failures

## Expected Results

When all services are running correctly:
- All tests should pass
- Stock API should return ~100 stocks
- User registration and login should work
- Onboarding should save correctly
- Holdings should reflect starting balance

## Troubleshooting

### "Backend is not running"
- Ensure backend is running on port 42069
- Check: `curl http://localhost:42069/health/`

### "Stock list is empty"
- Backend may not have populated stocks
- Run: `docker-compose exec backend python manage.py populate_stocks`

### "Registration failed"
- Database may not be migrated
- Check backend logs for errors
- Verify CLEAR_DB environment variable

### "Onboarding failed"
- Check request payload format
- Verify zodiac_sign is valid
- Verify investing_style is one of: casual, balanced, profit-seeking, playful

## Adding New Tests

Follow the existing pattern:

```javascript
async function testMyFeature(tokens) {
  testStart('My Feature Test')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/my-endpoint/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    testFail(`My feature failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('My feature returned non-OK status', data)
    return false
  }
  
  testPass('My feature works!', data)
  return true
}
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```bash
# Exit with error code if tests fail
node test-complete-flow.js || exit 1
```

## Test Data

- **Test users**: Created with timestamp-based email/username
- **Onboarding data**: Uses predefined zodiac (Taurus) and investing style (balanced)
- **Starting balance**: $50,000

## Notes

- Tests create new users each run to avoid conflicts
- Tests are read-only for stocks (no modifications)
- Tests DO modify user data (registration, onboarding, holdings)
- Safe to run multiple times - each creates a new test user

