# Library Management System

A REST API for managing books and borrowers in a library. Built with NestJS, PostgreSQL, and Prisma.

## What's Implemented

**Core Features:**
- Books management (CRUD, search by title/author/ISBN)
- Borrowers management (register, update, delete, list)
- Borrowing system (checkout, return, track due dates, overdue books)

**Bonus Features:**
- Analytics with CSV export (borrowing reports, overdue reports)
- Rate limiting on book creation and search endpoints
- Docker setup with docker-compose
- JWT authentication with refresh tokens
- Unit tests for books module

## Database Schema

See [docs/erd.md](docs/erd.md) for the full ERD diagram.

## Setup (First Time)

**Prerequisites:** Docker and Docker Compose installed.

1. Clone the repo and navigate to it:
```bash
git clone https://github.com/ahmed-taha1/Library-Management-System.git
cd library-management-system
```

2. Create your `.env` file:
```bash
cp .env.example .env
```

3. Start everything with Docker:
```bash
docker-compose up --build -d
```

4. Run database migrations:
```bash
docker exec library_api npx prisma migrate deploy
```

5. (Optional) Seed the database with sample data:
```bash
docker exec library_api npx prisma db seed
```

The API will be available at `http://localhost:4001/api`

## Running After Setup

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app
```

## API Endpoints

All endpoints (except login) require a JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

### Auth

#### POST /api/auth/login
Login and get tokens.

Request:
```json
{
  "email": "admin@library.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/refresh
Get a new access token using refresh token.

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response: Same as login response.

#### POST /api/auth/logout
Logout and revoke refresh token.

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  }
}
```

#### GET /api/auth/me
Get current logged-in user info.

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "admin@library.com"
  }
}
```

---

### Books

#### POST /api/books
Add a new book. (Rate limited: 5/minute)

Request:
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "description": "A novel about the American Dream",
  "quantity": 5,
  "shelf": "A1",
  "section": "Fiction"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "description": "A novel about the American Dream",
    "quantity": 5,
    "shelf": "A1",
    "section": "Fiction",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/books
List all books (paginated).

Query params: `page` (default: 1), `limit` (default: 10)

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "description": "A novel about the American Dream",
        "quantity": 5,
        "shelf": "A1",
        "section": "Fiction",
        "createdAt": "2026-01-15T10:30:00.000Z",
        "updatedAt": "2026-01-15T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

#### GET /api/books/search?q=Gatsby
Search books by title, author, or ISBN. (Rate limited: 10/minute)

Query params: `q` (search term), `page`, `limit`

Response: Same format as GET /api/books

#### GET /api/books/:id
Get a single book by ID.

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "description": "A novel about the American Dream",
    "quantity": 5,
    "shelf": "A1",
    "section": "Fiction",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

#### PATCH /api/books/:id
Update a book.

Request:
```json
{
  "quantity": 10,
  "shelf": "B2"
}
```

Response: Updated book object (same format as GET)

#### DELETE /api/books/:id
Delete a book.

Response:
```json
{
  "success": true,
  "data": {
    "message": "Book deleted successfully"
  }
}
```

---

### Borrowers

#### POST /api/borrowers
Register a new borrower.

Request:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-123-4567",
  "address": "123 Main Street, City, State 12345"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-123-4567",
    "address": "123 Main Street, City, State 12345",
    "registeredAt": "2026-01-15T10:30:00.000Z",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/borrowers
List all borrowers (paginated).

Query params: `page`, `limit`

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+1-555-123-4567",
        "address": "123 Main Street, City, State 12345",
        "registeredAt": "2026-01-15T10:30:00.000Z",
        "createdAt": "2026-01-15T10:30:00.000Z",
        "updatedAt": "2026-01-15T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### GET /api/borrowers/:id
Get a single borrower.

Response: Borrower object (same format as POST response)

#### PATCH /api/borrowers/:id
Update a borrower.

Request:
```json
{
  "phoneNumber": "+1-555-987-6543",
  "address": "456 Oak Avenue, New City, State 67890"
}
```

Response: Updated borrower object

#### DELETE /api/borrowers/:id
Delete a borrower.

Response:
```json
{
  "success": true,
  "data": {
    "message": "Borrower deleted successfully"
  }
}
```

---

### Borrowings

#### POST /api/borrowings
Checkout a book.

Request:
```json
{
  "borrowerId": "550e8400-e29b-41d4-a716-446655440001",
  "bookId": "550e8400-e29b-41d4-a716-446655440002",
  "dueDate": "2026-02-15"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "borrowerId": "550e8400-e29b-41d4-a716-446655440001",
    "bookId": "550e8400-e29b-41d4-a716-446655440002",
    "borrowedAt": "2026-01-15T10:30:00.000Z",
    "dueDate": "2026-02-15T23:59:59.000Z",
    "returnedAt": null,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z",
    "borrower": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "book": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "9780743273565"
    }
  }
}
```

#### GET /api/borrowings
List all borrowings (paginated).

Query params: `page`, `limit`

Response:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

#### GET /api/borrowings/overdue
Get all overdue borrowings (paginated).

Query params: `page`, `limit`

Response: Same format as GET /api/borrowings

#### GET /api/borrowings/borrower/:borrowerId
Get all borrowings for a specific borrower (paginated).

Query params: `page`, `limit`

Response: Same format as GET /api/borrowings

#### GET /api/borrowings/borrower/:borrowerId/active
Get active (not returned) borrowings for a borrower.

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "borrowerId": "550e8400-e29b-41d4-a716-446655440001",
      "bookId": "550e8400-e29b-41d4-a716-446655440002",
      "borrowedAt": "2026-01-15T10:30:00.000Z",
      "dueDate": "2026-02-15T23:59:59.000Z",
      "returnedAt": null,
      "borrower": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "book": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565"
      }
    }
  ]
}
```

#### PATCH /api/borrowings/:id/return
Return a borrowed book.

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "borrowerId": "550e8400-e29b-41d4-a716-446655440001",
    "bookId": "550e8400-e29b-41d4-a716-446655440002",
    "borrowedAt": "2026-01-15T10:30:00.000Z",
    "dueDate": "2026-02-15T23:59:59.000Z",
    "returnedAt": "2026-01-20T14:00:00.000Z",
    "borrower": { ... },
    "book": { ... }
  }
}
```

---

### Analytics

All analytics endpoints accept optional query params: `startDate`, `endDate` (YYYY-MM-DD format, defaults to last month).

#### GET /api/analytics/export/summary
Export borrowing analytics summary as CSV.

Response: CSV file download
```csv
Metric,Value
Period Start,2026-01-01
Period End,2026-01-31
Total Borrowings,150
Active Borrowings,45
Overdue Borrowings,5
Returned Borrowings,105
```

#### GET /api/analytics/export/borrowings
Export all borrowings as CSV.

Response: CSV file download
```csv
ID,Borrower Name,Borrower Email,Book Title,Book Author,ISBN,Borrowed At,Due Date,Returned At,Status
uuid-1,John Doe,john@example.com,The Great Gatsby,F. Scott Fitzgerald,9780743273565,2026-01-15,2026-02-15,,Active
uuid-2,Jane Smith,jane@example.com,1984,George Orwell,9780451524935,2026-01-10,2026-02-10,2026-01-25,Returned
```

#### GET /api/analytics/export/overdue
Export all overdue borrowings as CSV.

Response: CSV file download
```csv
ID,Borrower Name,Borrower Email,Borrower Phone,Book Title,Book Author,ISBN,Borrowed At,Due Date,Days Overdue
uuid-1,John Doe,john@example.com,+1-555-123-4567,The Great Gatsby,F. Scott Fitzgerald,9780743273565,2026-01-01,2026-01-15,16
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- 400: Bad request (validation error)
- 401: Unauthorized (missing or invalid token)
- 404: Resource not found
- 409: Conflict (e.g., duplicate ISBN or email)
- 429: Too many requests (rate limit exceeded)

---

## Running Tests

```bash
npm test
```

## Tech Stack

- Node.js + NestJS
- PostgreSQL
- Prisma ORM
- JWT for authentication
- Docker

## Project Structure

```
src/
├── config/          # App configuration
├── prisma/          # Database client module
└── features/
    ├── auth/        # Authentication (JWT, refresh tokens)
    ├── borrowers/   # Borrower management
    ├── books/       # Book management
    ├── borrowings/  # Checkout/return logic
    └── analytics/   # Reports and CSV exports
```
