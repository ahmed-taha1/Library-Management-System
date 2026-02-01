# ERD - Library Management System

## Diagram

```
┌────────────────┐          ┌────────────────┐
│     users      │          │     books      │
├────────────────┤          ├────────────────┤
│ id             │          │ id             │
│ name           │          │ title          │
│ email          │          │ author         │
│ password_hash  │          │ isbn           │
│ phone_number   │          │ description    │
│ address        │          │ quantity       │
│ role           │          │ shelf          │
│ registered_at  │          │ section        │
│ created_at     │          │ created_at     │
│ updated_at     │          │ updated_at     │
└───────┬────────┘          └───────┬────────┘
        │                           │
        │    ┌────────────────┐     │
        │    │   borrowings   │     │
        │    ├────────────────┤     │
        └───►│ id             │◄────┘
        1:N  │ user_id        │ 1:N
             │ book_id        │
             │ borrowed_at    │
             │ due_date       │
             │ returned_at    │
             │ created_at     │
             │ updated_at     │
             └────────────────┘

┌────────────────┐
│ refresh_tokens │
├────────────────┤
│ id             │
│ user_id ───────┼──► users.id
│ token_hash     │
│ expires_at     │
│ revoked_at     │
│ created_at     │
└────────────────┘
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| phone_number | VARCHAR(20) | NOT NULL |
| address | TEXT | NOT NULL |
| role | ENUM('borrower','librarian') | DEFAULT 'borrower' |
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
| quantity | INTEGER | DEFAULT 1, CHECK >= 0 |
| shelf | VARCHAR(50) | NOT NULL |
| section | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### borrowings
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
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
-- FK indexes (schema)
CREATE INDEX idx_borrowings_user_id ON borrowings(user_id);
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Search indexes (migration)
CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING GIN (author gin_trgm_ops);
CREATE INDEX idx_borrowings_active ON borrowings(user_id) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_overdue ON borrowings(due_date) WHERE returned_at IS NULL;
```
