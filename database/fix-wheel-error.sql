-- FIX: Wheel Spin 500 Error
-- This creates the missing wheel_spins and wheel_config tables
-- Run this in Supabase SQL Editor immediately

-- Create wheel_spins table
CREATE TABLE IF NOT EXISTS wheel_spins (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spin_date DATE NOT NULL,
    reward_amount INTEGER NOT NULL,
    spin_time TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create wheel_config table
CREATE TABLE IF NOT EXISTS wheel_config (
    id SERIAL PRIMARY KEY,
    prize_amounts INTEGER[] DEFAULT ARRAY[500, 750, 1000, 2000, 3000, 5000, 7500, 10000],
    prize_weights INTEGER[] DEFAULT ARRAY[30, 25, 20, 12, 7, 4, 1, 1],
    spins_per_day INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO wheel_config (prize_amounts, prize_weights, spins_per_day)
VALUES 
(ARRAY[500, 750, 1000, 2000, 3000, 5000, 7500, 10000], ARRAY[30, 25, 20, 12, 7, 4, 1, 1], 1)
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_wheel_spins_user_date ON wheel_spins(user_id, spin_date);

-- Enable RLS
ALTER TABLE wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_config ENABLE ROW LEVEL SECURITY;

-- Allow all operations (backend validates with JWT)
DROP POLICY IF EXISTS "Allow all on wheel_spins" ON wheel_spins;
CREATE POLICY "Allow all on wheel_spins" ON wheel_spins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on wheel_config" ON wheel_config;
CREATE POLICY "Allow all on wheel_config" ON wheel_config FOR ALL USING (true) WITH CHECK (true);

SELECT 'Wheel spin tables created successfully! ✅' AS status;
