การทดสอบ Terminal > npm run start:dev

✅ Valid commission calculation: GET /commission/calculate?userId=user-123&month=1&year=2025

✅ Invalid month (shows validation): GET /commission/calculate?userId=user-123&month=13&year=2025

✅ Network commissions with admin role: GET /commission/test-network

✅ Network without authorization (blocked): GET /commission/network/user-123

✅ User not found: GET /commission/calculate?userId=invalid-user&month=1&year=2025

✅ Completely insecure endpoint: GET /commission/admin-data

✅ Test $1.00 lemonade sale commission breakdown: GET /commission/test-mlm

✅ Test specific sale commission: GET /commission/level-commission?saleId=sale-5&saleAmount=1.00

✅ Test user's total network earnings: GET /commission/network-earnings/user-123
