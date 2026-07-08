import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'couple' | 'photographer' | 'admin';
  city: string | null;
  created_at: string;
  updated_at: string;
};

export type Photographer = {
  id: string;
  profile_id: string;
  business_name: string;
  bio: string | null;
  styles: string[];
  cities: string[];
  base_price: number;
  portfolio_urls: string[];
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  portfolio_quality_score: number;
  on_time_score: number;
  satisfaction_score: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

export type Package = {
  id: string;
  photographer_id: string;
  name: string;
  description: string | null;
  price: number;
  coverage_hours: number;
  deliverables: string[];
  includes_album: boolean;
  includes_video: boolean;
  second_shooter: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  couple_id: string;
  photographer_id: string;
  wedding_date: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  escrow_status: 'pending' | 'held' | 'released' | 'refunded';
  coverage_hours: number;
  deliverables: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  photographer?: Photographer & { profile: Profile };
  couple?: Profile;
};

export type Review = {
  id: string;
  booking_id: string;
  couple_id: string;
  photographer_id: string;
  rating: number;
  quality_rating: number | null;
  timeliness_rating: number | null;
  communication_rating: number | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  booking_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
};
