# ERD - Library Management System

## Diagram

```
┌────────────────┐          ┌────────────────┐
│     users      │          │   borrowers    │
│  (librarians)  │          │   (members)    │
├────────────────┤          ├────────────────┤
│ id             │          │ id             │
│ name           │          │ name           │
│ email          │          │ email          │
│ password_hash  │          │ phone_number   │
│ created_at     │          │ address        │
│ updated_at     │          │ registered_at  │
└───────┬────────┘          │ created_at     │
        │                   │ updated_at     │
        │                   └───────┬────────┘
        │                           │
┌───────┴────────┐                  │
│ refresh_tokens │                  │
├────────────────┤                  │
│ id             │                  │
│ user_id ───────┼──► users.id      │
│ token_hash     │                  │
│ expires_at     │                  │
│ revoked_at     │                  │
│ created_at     │                  │
└────────────────┘                  │
                                    │
        ┌────────────────┐          │
        │     books      │          │
        ├────────────────┤          │
        │ id             │          │
        │ title          │          │
        │ author         │          │
        │ isbn           │          │
        │ description    │          │
        │ quantity       │          │
        │ shelf          │          │
        │ section        │          │
        │ created_at     │          │
        │ updated_at     │          │
        └───────┬────────┘          │
                │                   │
                │  ┌────────────────┤
                │  │  borrowings    │
                │  ├────────────────┤
                └─►│ id             │◄───┘
               1:N │ borrower_id    │ 1:N
                   │ book_id        │
                   │ borrowed_at    │
                   │ due_date       │
                   │ returned_at    │
                   │ created_at     │
                   │ updated_at     │
                   └────────────────┘
```

## Tables

### users (Librarians/Admins)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### borrowers (Library Members)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone_number | VARCHAR(20) | NOT NULL |
| address | TEXT | NOT NULL |
| registered_at | TIMESTAMPTZ | DEFAULT NOW() |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### books
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(255) | NOT NULL |
| author | VARCHAR(255) | NOT NULL |
| isbn | VARCHAR(13) | UNIQUE, NOT NULL |
| description | TEXT | |
| quantity | INTEGER | DEFAULT 1 |
| shelf | VARCHAR(50) | NOT NULL |
| section | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### borrowings
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| borrower_id | UUID | FK → borrowers, NOT NULL |
| book_id | UUID | FK → books, NOT NULL |
| borrowed_at | TIMESTAMPTZ | DEFAULT NOW() |
| due_date | TIMESTAMPTZ | NOT NULL |
| returned_at | TIMESTAMPTZ | NULL = active |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### refresh_tokens
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| token_hash | VARCHAR(64) | UNIQUE, NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULL = valid |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

## Indexes

```sql
-- FK indexes (auto-created by Prisma)
CREATE INDEX idx_borrowings_borrower_id ON borrowings(borrower_id);
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Book search indexes (GIN trigram for partial text matching)
CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING GIN (author gin_trgm_ops);
CREATE INDEX idx_books_isbn ON books (isbn);

-- Borrowings partial indexes for common queries
CREATE INDEX idx_borrowings_active ON borrowings (borrower_id) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_overdue ON borrowings (due_date) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_returned ON borrowings (borrower_id) WHERE returned_at IS NOT NULL;

-- Refresh tokens cleanup index
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;
```

## Index Usage

| Index | Purpose |
|-------|---------|
| `idx_books_title_trgm` | Fast partial text search on book titles |
| `idx_books_author_trgm` | Fast partial text search on author names |
| `idx_books_isbn` | Fast exact match lookup by ISBN |
| `idx_borrowings_active` | Find active borrowings for a borrower |
| `idx_borrowings_overdue` | Find overdue books (due_date < now, not returned) |
| `idx_borrowings_returned` | Find borrowing history for a borrower |
| `idx_refresh_tokens_expires` | Cleanup expired tokens |
