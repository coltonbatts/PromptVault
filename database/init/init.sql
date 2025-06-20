-- Create the prompts table with optimized schema
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full-text search vector (generated column)
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(title, '') || ' ' || 
            COALESCE(content, '') || ' ' || 
            COALESCE(array_to_string(tags, ' '), '')
        )
    ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO prompts (title, content, tags) VALUES
(
    'Code Review Prompt', 
    'Please review the following code for best practices, potential bugs, and performance improvements. Pay special attention to security vulnerabilities and suggest optimizations where applicable.',
    ARRAY['code-review', 'development', 'security']
),
(
    'Creative Writing Assistant',
    'Help me write a compelling story about [TOPIC]. Focus on character development, plot structure, and engaging dialogue. The tone should be [TONE] and the target audience is [AUDIENCE].',
    ARRAY['creative-writing', 'storytelling', 'fiction']
),
(
    'Technical Documentation',
    'Create comprehensive technical documentation for [PROJECT/FEATURE]. Include: overview, prerequisites, step-by-step instructions, code examples, troubleshooting section, and FAQ.',
    ARRAY['documentation', 'technical-writing', 'guides']
),
(
    'Data Analysis Query',
    'Analyze the following dataset and provide insights on [SPECIFIC_METRICS]. Create visualizations if helpful and explain any patterns, trends, or anomalies you discover.',
    ARRAY['data-analysis', 'analytics', 'insights']
),
(
    'Learning Explanation',
    'Explain [COMPLEX_TOPIC] in simple terms suitable for a beginner. Use analogies, examples, and break it down into digestible concepts. Include practical applications and next steps for learning.',
    ARRAY['education', 'explanation', 'learning']
)
ON CONFLICT DO NOTHING; 