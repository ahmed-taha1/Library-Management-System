-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Book search indexes (GIN trigram for partial matching)
CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING GIN (author gin_trgm_ops);

-- Partial indexes for active borrowings
CREATE INDEX idx_borrowings_active ON borrowings(user_id) WHERE returned_at IS NULL;
CREATE INDEX idx_borrowings_overdue ON borrowings(due_date) WHERE returned_at IS NULL;
