# E-Commerce Next.js App

## Overview
A Next.js 16 e-commerce application using Firebase for auth/storage and Cloudinary for image management. Migrated from Vercel to Replit.

## Architecture
- **Framework**: Next.js 16.2.3 (App Router, Turbopack)
- **Auth & Storage**: Firebase (client-side SDK)
- **Image CDN**: Cloudinary
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **UI Components**: Radix UI + shadcn/ui pattern
- **Package Manager**: npm

## Key Directories
- `src/app/` — Next.js App Router pages
- `src/components/` — Reusable UI components
- `src/store/` — Zustand state stores
- `src/utils/` — Utility functions
- `src/providers/` — React context providers
- `src/middleware.ts` — Auth route protection (admin/dashboard)

## Environment Variables
All stored in Replit's shared environment:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
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
- `next.config.ts` serverActions allowedOrigins updated for Replit domains
- Firebase config migrated from `.env.local` to Replit shared environment variables
