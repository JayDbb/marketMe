-- Migration to add social connections table for storing OAuth tokens (e.g., Instagram)

CREATE TABLE IF NOT EXISTS social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- RLS policies
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social connections" 
ON social_connections FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social connections" 
ON social_connections FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Update trigger for modified time
CREATE TRIGGER update_social_connections_modtime
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
