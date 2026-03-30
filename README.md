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
- [User Roles](#-user-roles)
- [Features](#-features)
- [Draw & Prize Logic](#-draw--prize-logic)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Deployment](#-deployment)
- [Testing Payments](#-testing-payments)
- [Scalability](#-scalability)
- [PRD Testing Checklist](#-prd-testing-checklist)

---

## 🧠 Overview

GolfGives is a **subscription-based SaaS platform** built for golfers who want to compete, win prizes, and give back — all in one place.

Users subscribe monthly or yearly, enter their latest golf scores in Stableford format, and are automatically entered into a monthly prize draw. A portion of every subscription goes directly to a charity of the user's choice.

The platform is designed to feel **emotionally engaging and modern** — deliberately avoiding the aesthetics of a traditional golf website. Design leads with charitable impact, not sport.

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

## 👥 User Roles

### 🌍 Public Visitor
- View platform concept and how it works
- Explore listed charities
- Understand draw mechanics and prize structure
- Initiate subscription / signup flow

### 🏌️ Registered Subscriber
- Manage profile & account settings
- Enter and edit golf scores (Stableford format)
- Select charity and set donation percentage
- View participation summary and upcoming draws
- Track winnings and payment status
- Upload winner proof (screenshot of scores)

### 🛠️ Administrator
- Manage users & subscriptions
- Configure and run monthly draws
- Manage charity listings
- Verify winners & process payouts
- Access reports & analytics

---

## ✨ Features

### 👤 User Features
- ✅ Sign up / Login with email (Supabase Auth)
- ✅ Choose a charity & set donation % at signup (minimum 10%)
- ✅ Voluntarily increase charity contribution percentage
- ✅ Independent donation option (not tied to gameplay)
- ✅ Subscribe Monthly or Yearly via Stripe Checkout
- ✅ Enter and edit Stableford scores (1–45), rolling last 5 logic
- ✅ Scores displayed in reverse chronological order (latest first)
- ✅ View published prize draws & winning numbers
- ✅ Participation summary — draws entered & upcoming draws
- ✅ Track winnings history & current payment status
- ✅ Upload winner proof (screenshot) for verification
- ✅ Cancel subscription anytime
- ✅ Adjust charity donation % from settings

### 🛠️ Admin Features
- ✅ Live dashboard — total users, active subscribers, prizes paid, active charities
- ✅ User management — view/edit profiles, manage subscriptions
- ✅ Draw engine — random + algorithmic simulation & publish
- ✅ Prize pool auto-calculation (40% / 35% / 25% split)
- ✅ Jackpot rollover logic if no 5-match winner
- ✅ Charity management — add / edit / delete / feature charities
- ✅ Charity profiles — description, images, upcoming events (e.g. golf days)
- ✅ Featured / spotlight charity on homepage
- ✅ Winner verification — approve / reject submissions
- ✅ Mark winner payouts as completed (Pending → Paid)
- ✅ Reports & analytics — draw stats, prize totals, charity contributions

---

## 🏆 Draw & Prize Logic

Every month, the admin runs a draw that generates **5 winning numbers (1–45)**. Each user's last 5 scores are compared against the draw results.

| Match Type | Prize Pool Share | Jackpot Rollover? |
|---|---|---|
| 5-Number Match | 40% | ✅ Yes |
| 4-Number Match | 35% | ❌ No |
| 3-Number Match | 25% | ❌ No |

- Prize pool is **auto-calculated** based on active subscriber count
- If multiple users match the same tier, the prize is **split equally**
- If no 5-match winner, the **jackpot rolls over** to next month
- Admin can **simulate** a draw before officially publishing it
- Draw logic options: **Random** (lottery-style) or **Algorithmic** (weighted by score frequency)

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

> ⚠️ As per project requirements — deploy to a **new Vercel account** and use a **new Supabase project** (not personal/existing).

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

## 📈 Scalability

This platform has been architected with future growth in mind:

- 🌐 **Multi-country expansion** — architecture supports regional scaling
- 🏢 **Teams / Corporate accounts** — extensible data model for group subscriptions
- 📣 **Campaign module** — ready for future activation
- 📱 **Mobile app ready** — codebase structured to support a React Native / mobile version

---

## ✅ PRD Testing Checklist

| Feature | Status |
|---|---|
| User signup & login | ✅ |
| Subscription flow (monthly and yearly) | ✅ |
| Score entry — 5-score rolling logic | ✅ |
| Draw system logic and simulation | ✅ |
| Charity selection and contribution calculation | ✅ |
| Winner verification flow and payout tracking | ✅ |
| User Dashboard — all modules functional | ✅ |
| Admin Panel — full control and usability | ✅ |
| Data accuracy across all modules | ✅ |
| Responsive design on mobile and desktop | ✅ |
| Error handling and edge cases | ✅ |

---

## 📄 License

This project was built as part of the **Digital Heroes Full-Stack Development Trainee Selection Process**.

Built with ❤️ by [Vedant](https://golf-charity-platform-vedant.vercel.app/)
