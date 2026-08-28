# Marketme Admin Console — Developer Guide

This document explains how to access, configure, and work with the **Marketme Admin Console** (`/dashboard/admin`).

---

## 1. Access Control & Configuration

The Admin Console is guarded at the **sidebar UI level**, **Next.js server-page level**, and **server-action mutation level**.

### Setting Up Admin Access Locally

1. Open your `.env.local` file (create one from `.env.example` if you haven't already).
2. Add your account's email address (or multiple comma-separated emails) to the `ADMIN_EMAILS` variable:

```env
ADMIN_EMAILS=your.email@example.com,dev2@marketme.app
```

3. Restart the Next.js development server (or run `npm run dev`).
4. Log into Marketme using the specified email address.

---

## 2. Navigating to the Admin Page

Once configured and logged in:
- **Sidebar**: An **Administration** group with the **Admin Console** link (Shield icon) will appear at the bottom of the dashboard sidebar.
- **Direct Route**: Navigate to [`http://localhost:3000/dashboard/admin`](http://localhost:3000/dashboard/admin).
- **Short URL**: Accessing [`http://localhost:3000/admin`](http://localhost:3000/admin) automatically redirects to `/dashboard/admin`.

> [!NOTE]
> If a user's email is **not** present in `ADMIN_EMAILS`, the sidebar link will be hidden, direct requests to `/dashboard/admin` will redirect back to `/dashboard`, and server actions will reject mutations with `Not authorized`.

---

## 3. Features & Tabs

The Admin Console provides live system observability and user controls:

### Top Metrics Grid
- **Total Users & Active Users**: Live count of registered users and users with active non-expired sessions.
- **Total Businesses & Active Workflows**: Aggregate counts across the platform.
- **AI Credit Usage Meter**: System-wide credit consumption vs. total allocated credits.
- **Plan Distribution**: Breakdown of Free vs. Pro vs. Team subscription tiers.
- **Post & Plan Volume**: Total published posts and generated content plans.

### Tabs
1. **Overview**:
   - Live health status and latency pings for Database (Supabase), Resend, Stripe, Trigger.dev, Better Auth, and Pexels.
   - Filterable Audit Event stream showing recent credit spending transactions and signups.
2. **Users**:
   - Searchable and plan-filtered user roster sorted by most recent activity.
   - Shows active session indicators (🟢 green badge for users active in the last 30 minutes), remaining credits, and post counts.
   - **Grant Credits**: Inline credit adjustment action.
   - **Change Plan**: Instant plan switching (Free, Pro, Team).
3. **Workflows**:
   - Monitor automation pipelines, last run times, failure counters, and run statuses.

---

## 4. Key Code Locations

- **Page Route**: `app/dashboard/admin/page.tsx`
- **Server Actions**: `app/dashboard/admin/actions.ts`
- **Redirect Shim**: `app/admin/route.ts`
- **Admin Service**: `lib/services/admin.service.ts`
- **Admin UI Components**: `components/dashboard/admin/`
- **Types**: `types/admin.ts`
- **Sidebar Integration**: `components/dashboard/app-sidebar.tsx`
