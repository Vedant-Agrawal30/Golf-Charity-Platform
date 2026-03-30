-- ============================================================
-- GOLF CHARITY PLATFORM - SUPABASE SCHEMA
-- Run this ENTIRE file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  created_at timestamptz default now()
);

-- Charities
create table charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  total_raised integer default 0,
  created_at timestamptz default now()
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'past_due')),
  charity_id uuid references charities(id),
  charity_percentage integer not null default 10 check (charity_percentage >= 10 and charity_percentage <= 100),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Golf Scores
create table golf_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  date_played date not null,
  created_at timestamptz default now()
);

-- Draws
create table draws (
  id uuid primary key default uuid_generate_v4(),
  month text not null, -- YYYY-MM format
  status text not null default 'pending' check (status in ('pending', 'simulated', 'published')),
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  winning_numbers integer[] not null default '{}',
  five_match_pool integer default 0,
  four_match_pool integer default 0,
  three_match_pool integer default 0,
  jackpot_rollover integer default 0,
  five_match_winner_count integer default 0,
  four_match_winner_count integer default 0,
  three_match_winner_count integer default 0,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Draw Entries
create table draw_entries (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  scores integer[] not null,
  matched integer check (matched in (3, 4, 5)),
  prize_amount integer default 0,
  created_at timestamptz default now()
);

-- Winners
create table winners (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  draw_entry_id uuid references draw_entries(id),
  match_type integer not null check (match_type in (3, 4, 5)),
  prize_amount integer not null default 0,
  proof_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table charities enable row level security;
alter table subscriptions enable row level security;
alter table golf_scores enable row level security;
alter table draws enable row level security;
alter table draw_entries enable row level security;
alter table winners enable row level security;

-- Profiles: users see their own, admins see all
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Charities: anyone can read active, admins can write
create policy "Anyone can view active charities" on charities for select using (is_active = true);
create policy "Admins can manage charities" on charities for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions: users see own, admins see all
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = user_id);
create policy "Admins can manage all subscriptions" on subscriptions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Golf Scores: users manage own
create policy "Users can manage own scores" on golf_scores for all using (auth.uid() = user_id);
create policy "Admins can manage all scores" on golf_scores for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Draws: published draws are public, admins manage all
create policy "Anyone can view published draws" on draws for select using (status = 'published');
create policy "Admins can manage draws" on draws for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Draw entries: users see own
create policy "Users can view own draw entries" on draw_entries for select using (auth.uid() = user_id);
create policy "Admins can manage draw entries" on draw_entries for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
-- Service role can insert (for webhook/draw execution)
create policy "Service role can insert draw entries" on draw_entries for insert with check (true);

-- Winners: users see own, admins see all
create policy "Users can view own winnings" on winners for select using (auth.uid() = user_id);
create policy "Users can upload proof" on winners for update using (auth.uid() = user_id);
create policy "Admins can manage winners" on winners for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Service role can insert winners" on winners for insert with check (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'subscriber'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- SEED DATA - Sample charities
-- ============================================================

insert into charities (name, description, website_url, is_featured, is_active) values
(
  'Cancer Research UK',
  'The world''s leading cancer charity, funding research to save lives. Every pound helps fund life-saving research into all types of cancer.',
  'https://www.cancerresearchuk.org',
  true,
  true
),
(
  'British Heart Foundation',
  'Funding research into heart and circulatory diseases, supporting those affected and fighting for a world free from fear of heart disease.',
  'https://www.bhf.org.uk',
  true,
  true
),
(
  'Alzheimer''s Society',
  'The UK''s leading dementia charity. We fund research, provide support and campaign for change for people affected by dementia.',
  'https://www.alzheimers.org.uk',
  false,
  true
),
(
  'RNIB - Royal National Institute of Blind People',
  'The UK''s leading sight loss charity, providing practical and emotional support to people with sight loss across the country.',
  'https://www.rnib.org.uk',
  false,
  true
),
(
  'Mind - Mental Health Charity',
  'We provide advice and support to anyone experiencing a mental health problem. Together we can make mental health a priority.',
  'https://www.mind.org.uk',
  false,
  true
),
(
  'Children in Need',
  'BBC Children in Need exists to change the lives of disadvantaged children and young people across the UK.',
  'https://www.bbcchildreninneed.co.uk',
  false,
  true
);

-- ============================================================
-- ADMIN USER SETUP
-- ============================================================
-- After running this schema, create your admin user via:
-- 1. Sign up normally with email: admin@golfgives.com, password: Admin123!
-- 2. Then run this SQL to promote them to admin:
--    UPDATE profiles SET role = 'admin' WHERE email = 'admin@golfgives.com';
