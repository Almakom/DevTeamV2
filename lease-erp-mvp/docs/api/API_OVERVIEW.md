# 📡 API Overview - Leasing ERP

## Base URL

```
Development: http://localhost:4000/api/v1
Production: https://your-api-domain.com/api/v1
```

## Authentication

All endpoints require a valid JWT token from Auth0.

```bash
Authorization: Bearer <your-auth0-token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Request successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "data": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

## Modules

### 1. CRM Module

#### Leads

```
GET    /api/v1/leads              - List all leads (paginated)
POST   /api/v1/leads              - Create a new lead
GET    /api/v1/leads/:id          - Get lead by ID
PATCH  /api/v1/leads/:id          - Update lead
DELETE /api/v1/leads/:id          - Delete lead
POST   /api/v1/leads/:id/convert  - Convert lead to customer
```

**Query Parameters (for GET /leads):**
- `page` (default: 1)
- `limit` (default: 10)
- `sortBy` (default: 'createdAt')
- `sortOrder` ('asc' | 'desc', default: 'desc')

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "source": "WEBSITE",
    "notes": "Interested in vehicle leasing"
  }'
```

#### Customers

```
GET    /api/v1/customers              - List all customers
POST   /api/v1/customers              - Create customer
GET    /api/v1/customers/:id          - Get customer
PATCH  /api/v1/customers/:id          - Update customer
DELETE /api/v1/customers/:id          - Delete customer
PATCH  /api/v1/customers/:id/kyc      - Update KYC status
POST   /api/v1/customers/:id/documents - Upload KYC documents
```

#### Opportunities

```
GET    /api/v1/opportunities          - List opportunities
POST   /api/v1/opportunities          - Create opportunity
GET    /api/v1/opportunities/:id      - Get opportunity
PATCH  /api/v1/opportunities/:id      - Update opportunity
DELETE /api/v1/opportunities/:id      - Delete opportunity
POST   /api/v1/opportunities/:id/win  - Mark as won
POST   /api/v1/opportunities/:id/lose - Mark as lost
```

### 2. Quote Module

```
GET    /api/v1/quotes                 - List quotes
POST   /api/v1/quotes                 - Create quote
GET    /api/v1/quotes/:id             - Get quote
PATCH  /api/v1/quotes/:id             - Update quote
DELETE /api/v1/quotes/:id             - Delete quote
POST   /api/v1/quotes/:id/approve     - Approve quote
POST   /api/v1/quotes/:id/convert     - Convert to contract
POST   /api/v1/quotes/calculate       - Calculate without saving
GET    /api/v1/quotes/:id/pdf         - Generate PDF
```

**Example Calculate Request:**

```bash
curl -X POST http://localhost:4000/api/v1/quotes/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetValue": 50000,
    "downPayment": 10000,
    "interestRate": 0.055,
    "durationMonths": 36,
    "leaseType": "FINANCIAL_LEASE"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "monthlyPayment": 1206.93,
    "totalAmount": 53449.48,
    "totalInterest": 3449.48,
    "amortizationSchedule": [
      {
        "month": 1,
        "payment": 1206.93,
        "principal": 1023.60,
        "interest": 183.33,
        "balance": 38976.40
      },
      // ... more months
    ]
  }
}
```

### 3. Contract Module

```
GET    /api/v1/contracts              - List contracts
POST   /api/v1/contracts              - Create contract
GET    /api/v1/contracts/:id          - Get contract
PATCH  /api/v1/contracts/:id          - Update contract
DELETE /api/v1/contracts/:id          - Delete contract
POST   /api/v1/contracts/:id/activate - Activate contract
POST   /api/v1/contracts/:id/suspend  - Suspend contract
POST   /api/v1/contracts/:id/terminate - Terminate contract
POST   /api/v1/contracts/:id/assets   - Assign assets
GET    /api/v1/contracts/:id/pdf      - Generate contract PDF
```

### 4. Asset Module

```
GET    /api/v1/assets                 - List assets
POST   /api/v1/assets                 - Create asset
GET    /api/v1/assets/:id             - Get asset
PATCH  /api/v1/assets/:id             - Update asset
DELETE /api/v1/assets/:id             - Delete asset
POST   /api/v1/assets/:id/images      - Upload images
GET    /api/v1/assets/available       - Get available assets
```

### 5. Document Module

```
GET    /api/v1/documents              - List documents
POST   /api/v1/documents              - Upload document
GET    /api/v1/documents/:id          - Get document
DELETE /api/v1/documents/:id          - Delete document
GET    /api/v1/documents/:id/download - Download document
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:4000/api/docs
```

This provides:
- Try out endpoints
- View request/response schemas
- Test authentication

## Postman Collection

Coming soon: Import ready-to-use Postman collection for testing.

## WebSocket Events (Phase 2)

Future support for real-time notifications:
- Contract status changes
- New leads
- Quote approvals
- Asset updates

---

For detailed implementation examples, see [DEVELOPMENT.md](../guides/DEVELOPMENT.md)
