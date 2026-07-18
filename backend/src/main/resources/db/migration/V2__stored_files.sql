CREATE TABLE stored_files (
    id VARCHAR(36) PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_name VARCHAR(36) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_stored_files_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_stored_files_owner ON stored_files(owner_user_id);
