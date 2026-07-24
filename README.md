# SocialDesk

## Overview

SocialDesk is a social media management dashboard built on Next.js (App Router) with a separate Express backend. It lets users connect social accounts (Meta/Facebook, Instagram, Pinterest), schedule/manage posts, and view analytics. Auth is cookie-based with role-gated routes (admin vs. regular user).

## Project Structure

- `frontend/` - Next.js 16 (App Router) React application with Tailwind CSS.
- `backend/` - Node.js/Express API server handling OAuth, queues, and Supabase integration.

## Prerequisites

- **Node.js**: v18+ recommended
- **Redis**: Required for BullMQ background queues (scheduled posts & analytics ingestion)
- **Supabase**: PostgreSQL database
- **Cloudinary**: For media uploads
- Social platform developer accounts (Meta, Pinterest, YouTube) for OAuth API integrations

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values (Supabase credentials, JWT secret, OAuth keys).
   ```bash
   cp .env.example .env
   ```
   *Note: If you do not have a local Redis server running, ensure that `SCHEDULED_POSTS_QUEUE_ENABLED=false` and `ANALYTICS_QUEUE_ENABLED=false` are set in your `.env` to prevent background queues from spamming connection errors.*

4. Start the backend server (starts on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file in the frontend directory and copy the `JWT_SECRET` from your backend `.env` file into it. This is required for the Next.js middleware (`proxy.ts`) to verify your authentication cookies.
   ```env
   JWT_SECRET=your_backend_jwt_secret_here
   ```

4. Start the frontend development server (starts on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

### 3. Access the Application

Once both servers are running:
- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser. API requests are automatically proxied to the backend via Next.js rewrites.
- **Backend API**: The backend is accessible directly at [http://localhost:5000/api](http://localhost:5000/api).
