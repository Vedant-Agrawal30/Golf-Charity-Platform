export type UserRole = 'subscriber' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  handicap?: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  charity_id: string
  charity_percentage: number
  current_period_end: string
  created_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number // 1-45 Stableford
  date_played: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url?: string
  website_url?: string
  is_featured: boolean
  is_active: boolean
  total_raised: number
  upcoming_events?: CharityEvent[]
  created_at: string
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  date: string
  description: string
}

export interface Draw {
  id: string
  month: string // YYYY-MM
  status: 'pending' | 'simulated' | 'published'
  draw_type: 'random' | 'algorithmic'
  winning_numbers: number[]
  five_match_pool: number
  four_match_pool: number
  three_match_pool: number
  jackpot_rollover: number
  five_match_winner_count: number
  four_match_winner_count: number
  three_match_winner_count: number
  published_at?: string
  created_at: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  scores: number[]
  matched: 3 | 4 | 5 | null
  prize_amount: number
  created_at: string
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  draw_entry_id: string
  match_type: 3 | 4 | 5
  prize_amount: number
  proof_url?: string
  verification_status: 'pending' | 'approved' | 'rejected'
  payment_status: 'pending' | 'paid'
  created_at: string
  profile?: Profile
  draw?: Draw
}

export interface PrizePool {
  draw_id: string
  total_pool: number
  five_match_pool: number
  four_match_pool: number
  three_match_pool: number
  jackpot_rollover: number
}
