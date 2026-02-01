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
git clone <repo-url>
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

All endpoints (except auth) require a JWT token in the Authorization header.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get tokens |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/auth/me | Get current user |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List all books (paginated) |
| GET | /api/books/search?q= | Search books |
| GET | /api/books/:id | Get single book |
| POST | /api/books | Add new book |
| PATCH | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |

### Users (Borrowers)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get single user |
| PATCH | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Borrowing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/borrowing/checkout | Borrow a book |
| POST | /api/borrowing/return/:id | Return a book |
| GET | /api/borrowing/my-books | Current user's borrowed books |
| GET | /api/borrowing/overdue | List overdue books |
| GET | /api/borrowing | All borrowing records |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/summary | Borrowing stats summary |
| GET | /api/analytics/export/summary | Export summary as CSV |
| GET | /api/analytics/export/overdue | Export overdue books as CSV |
| GET | /api/analytics/export/borrowings | Export all borrowings as CSV |

Query params for analytics: `startDate` and `endDate` (YYYY-MM-DD format, defaults to last month)

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
    ├── users/       # User/borrower management
    ├── books/       # Book management
    ├── borrowing/   # Checkout/return logic
    └── analytics/   # Reports and CSV exports
```
