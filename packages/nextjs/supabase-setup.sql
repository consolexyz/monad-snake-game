-- Run this in the Supabase SQL Editor

-- Create the scores table
CREATE TABLE IF NOT EXISTS "Score" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_personal_best BOOLEAN DEFAULT FALSE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_score_address ON "Score"(address);
CREATE INDEX IF NOT EXISTS idx_score_score ON "Score"(score);
CREATE INDEX IF NOT EXISTS idx_score_is_personal_best ON "Score"(is_personal_best); 