<!-- # ⛳ GolfGives — Golf Charity Subscription Platform

> **Live Demo:** [https://golf-charity-platform-vedant.vercel.app/](https://golf-charity-platform-vedant.vercel.app/)

A full-stack subscription platform where golfers track their Stableford scores, enter monthly prize draws, and automatically support the charities that matter to them.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe (Subscriptions + Webhooks) |
| Deployment | Vercel |

---

## ✨ Features

### 👤 User
- Sign up / Login with email
- Choose a charity & set donation % at signup
- Subscribe Monthly ( ₹19.99) or Yearly ( ₹199.99) via Stripe
- Enter Stableford scores (1–45, rolling last 5 logic)
- View published prize draws & winning numbers
- Track winnings history & payment status
- Cancel subscription anytime
- Adjust charity donation % from settings

### 🛠️ Admin
- Live dashboard with platform-wide stats
- User management (view/edit scores, manage subscriptions)
- Draw system (random + algorithmic simulation & publish)
- Prize pool auto-calculation (40/35/25 split)
- Jackpot rollover logic
- Charity management (add/edit/delete/feature)
- Winner verification (approve/reject/mark paid)

---

## 🖥️ User Dashboard Preview

After signing up and subscribing, users get access to their personal dashboard:

- 📊 **Score Tracker** — Enter and view your last 5 Stableford scores
- 🏆 **Prize Draw** — See your entry status for the current monthly draw
- 💚 **Charity Impact** — Track how much your subscription has donated
- 🔔 **Winnings** — Get notified when you win and track payment status

---

## ⚙️ Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → paste and run `supabase-schema.sql`
3. Go to **Project Settings → API** and copy your keys

### 3. Set Up Stripe
1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys** and copy your keys
3. Create two products in **Products → Add Product**:
   - `GolfGives Monthly` →  ₹270/month
   - `GolfGives Yearly` →  ₹3000/year
4. Copy both Price IDs

### 4. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 6. Set Up Stripe Webhook (Local)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

---

## 🌍 Deployment

The app is live at:
**[https://golf-charity-platform-vedant.vercel.app/](https://golf-charity-platform-vedant.vercel.app/)**

To deploy your own:
1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Deploy ✅
6. Add Stripe webhook endpoint in Stripe Dashboard:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

---

## 🧪 Testing Payments

Use Stripe's test card to simulate a subscription:

```
Card Number : 4242 4242 4242 4242
Expiry      : Any future date (e.g. 12/29)
CVC         : Any 3 digits (e.g. 123)
```

---

## 📁 Project Structure

```
golf-charity-platform/
├── app/
│   ├── api/          # API routes (Stripe, Supabase)
│   ├── auth/         # Login & Signup pages
│   ├── dashboard/    # User dashboard
│   ├── admin/        # Admin panel
│   └── subscribe/    # Subscription page
├── lib/
│   ├── supabase.ts   # Supabase client
│   └── stripe.ts     # Stripe client + plans
├── components/       # Reusable UI components
└── supabase-schema.sql
```

---

## 📄 License
 -->
# ⛳ GolfGives — Golf Charity Subscription Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-purple?style=for-the-badge&logo=stripe)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

> A full-stack subscription platform where golfers track their Stableford scores, enter monthly prize draws, and automatically support the charities that matter to them.

🌐 **Live Demo:** [https://golf-charity-platform-vedant.vercel.app/](https://golf-charity-platform-vedant.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Deployment](#-deployment)
- [Testing Payments](#-testing-payments)
- [Draw & Prize Logic](#-draw--prize-logic)

---

## 🧠 Overview

GolfGives is a **subscription-based SaaS platform** built for golfers who want to compete, win prizes, and give back — all in one place.

Users subscribe monthly or yearly, enter their latest golf scores in Stableford format, and are automatically entered into a monthly prize draw. A portion of every subscription goes directly to a charity of the user's choice.

The platform features a fully custom **draw engine** (random or algorithmic), an **automated prize pool calculator**, and a **complete admin panel** for managing users, draws, charities, and winner payouts.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe (Subscriptions + Webhooks) |
| Deployment | Vercel |

---

## ✨ Features

### 👤 User Features
- ✅ Sign up / Login with email (Supabase Auth)
- ✅ Choose a charity & set donation % at signup
- ✅ Subscribe Monthly or Yearly via Stripe Checkout
- ✅ Enter Stableford scores (1–45), rolling last 5 logic
- ✅ View published prize draws & winning numbers
- ✅ Track winnings history & payment status
- ✅ Cancel subscription anytime
- ✅ Adjust charity donation % from settings

### 🛠️ Admin Features
- ✅ Live dashboard — total users, active subscribers, prizes paid, active charities
- ✅ User management — view profiles, manage subscriptions
- ✅ Draw engine — random + algorithmic simulation & publish
- ✅ Prize pool auto-calculation (40% / 35% / 25% split)
- ✅ Jackpot rollover logic if no 5-match winner
- ✅ Charity management — add / edit / delete / feature charities
- ✅ Winner verification — approve / reject submissions, mark payouts as paid

---

## 🏆 Draw & Prize Logic

Every month, the admin runs a draw that generates **5 winning numbers (1–45)**. Each user's last 5 scores are compared against the draw results.

| Match Type | Prize Pool Share | Jackpot Rollover? |
|---|---|---|
| 5-Number Match | 40% | ✅ Yes |
| 4-Number Match | 35% | ❌ No |
| 3-Number Match | 25% | ❌ No |

- If multiple users match the same tier, the prize is **split equally**
- If no 5-match winner, the **jackpot rolls over** to next month
- Admin can **simulate** a draw before officially publishing it

---

## 📁 Project Structure

```
golf-charity-platform/
├── app/
│   ├── api/              # API routes (Stripe webhooks, draw engine, etc.)
│   ├── auth/             # Login & Signup pages
│   ├── dashboard/        # User dashboard (scores, draws, winnings, settings)
│   ├── admin/            # Admin panel (users, draw engine, charities, winners)
│   └── subscribe/        # Subscription / Stripe Checkout flow
├── components/           # Reusable UI components
├── lib/
│   ├── supabase.ts       # Supabase client setup
│   └── stripe.ts         # Stripe client + plan config
└── supabase-schema.sql   # Full database schema
```

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → paste and run `supabase-schema.sql`
3. Go to **Project Settings → API** and copy your keys

### 3. Set Up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys** and copy your keys
3. Create two products in **Products → Add Product**:
   - `GolfGives Monthly` → ₹270/month
   - `GolfGives Yearly` → ₹3000/year
4. Copy both **Price IDs**

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Set Up Stripe Webhook (Local Testing)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

---

## 🌍 Deployment

The app is live at:
**[https://golf-charity-platform-vedant.vercel.app/](https://golf-charity-platform-vedant.vercel.app/)**

To deploy your own instance:

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Click **Deploy** ✅
6. Add Stripe webhook endpoint in your Stripe Dashboard:
   - **URL:** `https://your-app.vercel.app/api/stripe/webhook`
   - **Events to listen for:**
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`

---

## 🧪 Testing Payments

Use Stripe's test card to simulate a subscription checkout:

```
Card Number  :  4242 4242 4242 4242
Expiry       :  Any future date (e.g. 12/29)
CVC          :  Any 3 digits (e.g. 123)
```

> All test transactions are completely safe and do not charge real money.

---

## 📄 License

This project was built as part of the **Digital Heroes Full-Stack Development Trainee Selection Process**.

Built with ❤️ by [Vedant](https://golf-charity-platform-vedant.vercel.app/)