/*
# Initial Schema for PicPromise

Creates the core tables for the wedding photography marketplace:
- `profiles`: User profiles (both couples and photographers)
- `photographers`: Photographer-specific data with verification status
- `bookings`: Wedding photography bookings
- `reviews`: Reviews from couples for photographers
- `messages`: Messaging between couples and photographers

Security:
- RLS enabled on all tables
- Owner-scoped policies for authenticated users
- Photographer verification badge system
- Escrow payment tracking
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'couple' CHECK (role IN ('couple', 'photographer', 'admin')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photographers table
CREATE TABLE IF NOT EXISTS photographers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  bio TEXT,
  styles TEXT[] NOT NULL DEFAULT '{}',
  cities TEXT[] NOT NULL DEFAULT '{}',
  base_price INTEGER NOT NULL DEFAULT 0,
  portfolio_urls TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  portfolio_quality_score INTEGER DEFAULT 0,
  on_time_score INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  wedding_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_amount INTEGER NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded')),
  coverage_hours INTEGER NOT NULL DEFAULT 8,
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  coverage_hours INTEGER NOT NULL,
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  includes_album BOOLEAN DEFAULT FALSE,
  includes_video BOOLEAN DEFAULT FALSE,
  second_shooter BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Photographers policies - public read for all
DROP POLICY IF EXISTS "public_read_photographers" ON photographers;
CREATE POLICY "public_read_photographers" ON photographers FOR SELECT
  TO anon, authenticated USING (is_verified = TRUE OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "photographers_insert_own" ON photographers;
CREATE POLICY "photographers_insert_own" ON photographers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND id = auth.uid())
  );

DROP POLICY IF EXISTS "photographers_update_own" ON photographers;
CREATE POLICY "photographers_update_own" ON photographers FOR UPDATE
  TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Bookings policies
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT
  TO authenticated USING (
    auth.uid() = couple_id OR 
    EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "bookings_insert_couples" ON bookings;
CREATE POLICY "bookings_insert_couples" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = couple_id);

DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE
  TO authenticated USING (
    auth.uid() = couple_id OR 
    EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND profile_id = auth.uid())
  );

-- Reviews policies
DROP POLICY IF EXISTS "reviews_select_verified" ON reviews;
CREATE POLICY "reviews_select_verified" ON reviews FOR SELECT
  TO anon, authenticated USING (is_verified = TRUE OR auth.uid() = couple_id);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = couple_id);

-- Messages policies
DROP POLICY IF EXISTS "messages_select_own" ON messages;
CREATE POLICY "messages_select_own" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Packages policies
DROP POLICY IF EXISTS "packages_select_active" ON packages;
CREATE POLICY "packages_select_active" ON packages FOR SELECT
  TO anon, authenticated USING (is_active = TRUE OR auth.uid() IN (SELECT profile_id FROM photographers WHERE id = photographer_id));

DROP POLICY IF EXISTS "packages_insert_own" ON packages;
CREATE POLICY "packages_insert_own" ON packages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "packages_update_own" ON packages;
CREATE POLICY "packages_update_own" ON packages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM photographers WHERE id = photographer_id AND profile_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photographers_verified ON photographers(is_verified);
CREATE INDEX IF NOT EXISTS idx_photographers_city ON photographers USING GIN(cities);
CREATE INDEX IF NOT EXISTS idx_photographers_styles ON photographers USING GIN(styles);
CREATE INDEX IF NOT EXISTS idx_bookings_couple ON bookings(couple_id);
CREATE INDEX IF NOT EXISTS idx_bookings_photographer ON bookings(photographer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_photographer ON reviews(photographer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_photographers_updated_at ON photographers;
CREATE TRIGGER update_photographers_updated_at
  BEFORE UPDATE ON photographers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();