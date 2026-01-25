-- Knowledge Network Database Schema

-- Knowledge table
CREATE TABLE IF NOT EXISTS knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT knowledge_title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200),
    CONSTRAINT knowledge_content_length CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
);

-- Connections table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS knowledge_connections (
    source_id UUID NOT NULL REFERENCES knowledge(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES knowledge(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (source_id, target_id),
    CONSTRAINT knowledge_connections_no_self_loop CHECK (source_id != target_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_source ON knowledge_connections(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_target ON knowledge_connections(target_id);

-- Full-text search index (PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge USING gin(to_tsvector('english', title || ' ' || content));
