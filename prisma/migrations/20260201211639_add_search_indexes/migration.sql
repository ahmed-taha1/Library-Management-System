-- Enable pg_trgm extension for trigram-based text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Books search indexes (GIN trigram for partial text matching)
CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING GIN (author gin_trgm_ops);
CREATE INDEX idx_books_isbn ON books (isbn);

-- Borrowings indexes for common queries
CREATE INDEX idx_borrowings_active ON borrowings (borrower_id) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_overdue ON borrowings (due_date) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_returned ON borrowings (borrower_id) WHERE returned_at IS NOT NULL;

-- Refresh tokens index for cleanup queries
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;
