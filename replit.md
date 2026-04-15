# E-Commerce Next.js App — Zest & Partners

## Overview
A production-level Next.js 16 e-commerce application in PKR currency, powered by Firebase (auth + Firestore + Storage) and Cloudinary for images. Fully dynamic — all store settings, banners, policies, and shipping are controlled from the admin panel and stored in Firestore.

## Architecture
- **Framework**: Next.js 16.2.3 (App Router, Turbopack)
- **Auth & Storage**: Firebase (client-side SDK)
- **Database**: Firestore (products, orders, users, config)
- **Image CDN**: Cloudinary
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Charts**: Recharts (admin analytics)
- **Package Manager**: npm

## Key Directories
- `src/app/(shop)/` — Customer-facing shop pages
- `src/app/admin/` — Admin panel (dashboard, orders, products, users, analytics, settings, coupons)
- `src/components/` — Reusable UI components
- `src/lib/services/` — Firebase service layer (products, orders, users, storeSettings, coupons)
- `src/store/` — Zustand state stores (cart, wishlist, auth)
- `src/types/index.ts` — All TypeScript interfaces including Banner, StoreSettings, Coupon
- `src/middleware.ts` — Auth route protection (admin/dashboard)

## Admin Panel Features
- **Dashboard**: Live metrics (revenue, orders, customers, products), recent orders with images, low-stock alerts
- **Orders**: Full order management with status progression, product images, customer details
- **Products**: CRUD with image upload, flash sale pricing, stock management, archiving
- **Users**: View all registered users, disable/enable accounts
- **Analytics**: Revenue, orders, top products charts via Recharts
- **Store Settings**: Dynamic banners, announcement bar, flash sale banner, free delivery threshold, standard shipping cost, delivery estimate, return policy, warranty policy — all stored in `config/storeSettings` Firestore document
- **Coupons**: Create/disable/delete discount coupons with expiry and usage limits

## Dynamic Store Configuration (Firestore: `config/storeSettings`)
Controlled via admin panel, read server-side on every page:
- `announcementBar` / `announcementBarActive` — top-of-page announcement text
- `banners[]` — hero banners (title, subtitle, CTA, image, active flag)
- `flashSaleBannerActive` / `flashSaleBannerTitle` / `flashSaleBannerSubtitle`
- `freeDeliveryThreshold` (PKR) — used at checkout
- `standardShippingCost` (PKR)
- `deliveryEstimate`, `returnPolicy`, `returnPolicyDays`, `warrantyPolicy` — shown on product pages

## Product Pages
- Vertical thumbnail strip (left) + tall main image (right) — John Lewis style gallery
- Dynamic store policies (delivery estimate, return policy, warranty) fetched server-side from Firestore

## Environment Variables
All stored in Replit's shared environment:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Running the App
- **Dev**: `npm run dev` (port 5000, 0.0.0.0)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, 0.0.0.0)

## Replit-Specific Changes
- Dev/start scripts use `-p 5000 -H 0.0.0.0` for Replit preview compatibility
- `next.config.ts` has `allowedDevOrigins: ['*.replit.dev']` and serverActions allowedOrigins
- Firebase config migrated from `.env.local` to Replit shared environment variables
- Currency: Pakistani Rupees (PKR) via `formatPrice` in `src/utils/formatters.ts`
