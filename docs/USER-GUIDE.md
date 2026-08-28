# MarketMe User Guide

MarketMe is an AI marketing manager for small businesses. It helps you **draft, review, and schedule** social content — especially Instagram — with human approval before anything goes live.

This guide covers everything you need to use the product day to day.

---

## Table of contents

1. [Getting started](#getting-started)
2. [Dashboard overview](#dashboard-overview)
3. [Creating and scheduling posts](#creating-and-scheduling-posts)
4. [AI content generation](#ai-content-generation)
5. [Design Studio](#design-studio)
6. [Instagram connection](#instagram-connection)
7. [Publishing](#publishing)
8. [Workflows (automation)](#workflows-automation)
9. [Inbox](#inbox)
10. [Settings](#settings)
11. [Plans and AI credits](#plans-and-ai-credits)
12. [Post statuses explained](#post-statuses-explained)
13. [Troubleshooting](#troubleshooting)
14. [Help and support](#help-and-support)

---

## Getting started

### Create an account

1. Go to **Sign up** (`/signup`).
2. Register with **Google**, **email/password**, or request a **magic link** on the login page.
3. Accept the Terms of Service to continue.

### Complete onboarding

After your first sign-in, MarketMe walks you through a three-step business profile:

| Step | What you provide |
|------|------------------|
| **Business** | Business name, industry, services |
| **Marketing focus** | Goals, tone, target customers, channels (Instagram) |
| **Brand assets** | Optional logo, brand colors, fonts |

A complete profile improves AI drafts and scheduling suggestions. You can revisit onboarding anytime from the sidebar (**Setup Profile**).

### Recommended first-week loop

1. Finish onboarding.
2. Connect Instagram from **Connections**.
3. Generate a small batch of drafts from **Generate**.
4. Review captions and images in **Posts** or **Studio**.
5. Approve and schedule posts on **Calendar**.

MarketMe is built for a weekly shipping habit — you stay in control; nothing publishes without your approval.

---

## Dashboard overview

After sign-in, the dashboard sidebar is organized into three areas:

### Publish

| Page | Path | Purpose |
|------|------|---------|
| **Overview** | `/dashboard` | Stats, upcoming posts, drafts, quick links |
| **Posts** | `/dashboard/posts` | List view — review, approve, edit, delete |
| **Calendar** | `/dashboard/calendar` | Visual planner (Day / Week / Month views) |
| **Inbox** | `/dashboard/inbox` | Instagram direct messages |
| **Studio** | `/dashboard/studio` | Canvas editor for post creatives |

### Automate

| Page | Path | Purpose |
|------|------|---------|
| **Workflows** | `/dashboard/workflows` | Recurring automation (weekly generation, auto-queue, etc.) |
| **Generate** | `/dashboard/generate` | AI weekly content batch |

### Workspace

| Page | Path | Purpose |
|------|------|---------|
| **Connections** | `/dashboard/connections` | Connect Instagram and manage social accounts |
| **Setup Profile** | `/onboarding` | Re-run business profile setup |

**Settings** (profile menu) lives at `/dashboard/settings` with tabs for Profile, Preferences, Billing, Workspace, and AI.

---

## Creating and scheduling posts

You can create posts manually or from AI-generated drafts.

### Manual create (Calendar or Posts)

1. Open **Calendar** or **Posts** and click **Create post** (or click a date/time on the calendar).
2. Write your caption and optionally upload an image.
3. Pick a **platform** (currently Instagram) and **schedule date/time**.
4. Use the **Live Preview** on the right to see how the post will look in an Instagram feed.
5. Click **Schedule Post**.

The post is saved, approved, and queued for publishing at the scheduled time.

### Schedule presets

When scheduling, quick buttons help you pick common times:

- **In 1 hour**
- **Tomorrow 9 AM**
- **Tomorrow 6 PM**
- **Next Monday**

Times follow your timezone set in **Settings → Preferences**.

### Edit or reschedule

- Open a post from **Calendar** or **Posts** to edit caption, image, or time.
- Drag posts on the calendar to move them (draft, approved, and scheduled posts only — published posts cannot be moved).

### Approve before queue

Posts move through review stages:

```
Draft → Approved → Scheduled → Published
```

When you schedule from the create modal, MarketMe approves and queues the post in one step. Posts created as drafts elsewhere must be **approved** before they can be scheduled.

---

## AI content generation

**Generate** (`/dashboard/generate`) creates a weekly batch of Instagram drafts based on your business profile.

### How it works

1. MarketMe reads your business profile, brand memory, and preferences.
2. AI produces captions, hashtags, and post ideas aligned with your tone.
3. New posts appear as **drafts** in Posts and Calendar.
4. You review, edit, approve, and schedule — nothing publishes automatically.

### Brand memory

MarketMe learns your style over time. When you revise captions or approve/reject posts, short style notes are saved to your profile and used in future generations — no fine-tuning required.

### Image generation

You can generate images for posts using AI (DALL·E via OpenAI). Generated images are stored in your account and attached to posts. Image generation uses AI credits.

### Credits

Each generation run consumes **AI credits**. See [Plans and AI credits](#plans-and-ai-credits). When credits run out, new generation pauses until your allowance resets or you upgrade — you can still edit and schedule existing drafts.

---

## Design Studio

**Studio** (`/dashboard/studio`) is a canvas-based design editor for post creatives.

### Features

- **Templates** — Start from saved or preset layouts
- **Layers** — Text, shapes, images on a Konva canvas
- **Brand kit** — Use colors and fonts from your business profile
- **Stock images** — Search Pexels for royalty-free photos
- **Export** — Save designs and attach them to posts

Studio works on desktop and mobile. On mobile, tools open in a bottom sheet.

---

## Instagram connection

MarketMe publishes to Instagram through Meta's official OAuth API. Personal Instagram accounts cannot publish via the API — you need a **Business** or **Creator** account.

### Connect your account

1. Go to **Connections** (`/dashboard/connections`).
2. Click **Connect Instagram**.
3. Complete the Meta permissions screen.
4. Return to MarketMe and confirm the connection shows as connected.

### Requirements

- Instagram **Business** or **Creator** account
- If using Facebook Login: the Instagram account must be linked to a **Facebook Page** you admin
- Be signed into the correct Facebook/Instagram account in your browser

### If connection fails

- Switch to an Incognito/private window signed into the correct Meta account
- Confirm your Instagram account type is Business or Creator
- Verify the Facebook Page link if prompted
- See the in-app help article: **Connect Instagram the right way** (`/help/connect-instagram`)

### Reconnecting

If MarketMe shows your account as disconnected, open **Connections** and reconnect. OAuth tokens are stored securely on the MarketMe AI service — you do not need to stay logged in for scheduled posts to publish.

---

## Publishing

### Scheduled publishing

When a post reaches its scheduled time:

1. MarketMe's background job picks up posts with status **scheduled**.
2. The post is sent to Instagram via the connected account.
3. Status updates to **published** (or **failed** if something goes wrong).

You do not need to be online when a post publishes.

### Publish now

When editing a post, you can **Publish now** to send it to Instagram immediately instead of waiting for the scheduled time.

### Failed posts

If publishing fails (expired token, missing image, API error):

- The post status becomes **failed**.
- Open the post to see the error and retry, or return it to draft for editing.
- Reconnect Instagram from **Connections** if the token expired.

---

## Workflows (automation)

**Workflows** (`/dashboard/workflows`) run recurring tasks so you spend less time on repetitive work.

| Workflow | What it does |
|----------|--------------|
| **Weekly draft batch** | Generates a fresh batch of Instagram drafts on a fixed weekday (default: Monday 9 AM) |
| **Auto-queue approved posts** | When you approve a post, assigns the next available publish slot automatically |
| **Stale draft review** | Daily scan for old drafts that need attention |
| **Publish guardrail** | Pre-publish checks (connection valid, content present) before sending to Instagram |

Enable workflows from the Workflows page. Each workflow can be customized (weekday, time, spacing between posts).

Workflows require auto-publish to be enabled on the server. Scheduled posts still need your approval before they enter the queue unless you use auto-queue after approval.

---

## Inbox

**Inbox** (`/dashboard/inbox`) shows Instagram direct messages for your connected account.

Use it to read and respond to DMs without leaving MarketMe. Messages sync from Instagram when your account is connected.

---

## Settings

Open **Settings** from your profile menu (`/dashboard/settings`).

| Tab | What you configure |
|-----|-------------------|
| **Profile** | Display name, email, profile photo |
| **Preferences** | Timezone, week start day (for calendar views) |
| **Billing** | Current plan, usage, upgrade/cancel |
| **Workspace** | Business name, industry, brand colors, logo |
| **AI** | AI model preferences for generation |

Timezone affects how scheduled times display in the Calendar and Live Preview.

---

## Plans and AI credits

MarketMe offers three plans:

| | Free | Pro | Team |
|---|------|-----|------|
| **Price** | $0 | $29/mo | $79/mo |
| **Workspaces** | 1 | 3 | 10 |
| **Team members** | 1 | 3 | 10 |
| **Social profiles** | 1 | 5 | 25 |
| **Posts / month** | 10 | 100 | Unlimited |
| **AI credits / month** | 50 | 500 | 2,000 |

### What uses credits

- Weekly content generation
- Caption regeneration
- AI image generation
- Creative brief generation

### When credits run out

Generation pauses until credits reset (start of each billing period) or you upgrade. You can still edit, approve, and schedule existing drafts.

### Upgrading

Go to **Settings → Billing** or visit `/pricing` to compare plans. Paid plans unlock higher limits for profiles, posts, and AI credits.

---

## Post statuses explained

| Status | Meaning | What you can do |
|--------|---------|-----------------|
| **Draft** | Created but not reviewed | Edit, approve, reject, delete |
| **Approved** | Reviewed and ready | Schedule, return to draft, reject |
| **Scheduled** | Queued for publish at a set time | Wait for publish, reschedule, cancel queue |
| **Published** | Live on Instagram | View only — cannot edit or move |
| **Failed** | Publish attempt failed | Retry, edit, return to draft |
| **Rejected** | Marked as not suitable | Edit and return to draft |

---

## Troubleshooting

### Schedule button stuck on "Scheduling…"

If the modal stays on "Scheduling…" after creating a post, refresh the page. The post may already be saved. This was fixed in a recent update — ensure you are on the latest deployment.

### Instagram shows disconnected

Reconnect from **Connections**. Tokens can expire; reconnecting refreshes them. Scheduled posts will resume publishing after a successful reconnect.

### Post did not publish at scheduled time

Check:

1. Post status is **scheduled** (not draft or approved only).
2. Instagram connection is active.
3. Post has a caption and image (Instagram requires media).
4. Scheduled time is in the past and auto-publish is enabled on the server.

Open the post — if status is **failed**, read the error message and retry.

### AI generation returns nothing

You may be out of AI credits. Check **Settings → Billing** for your balance and reset date.

### Wrong timezone on calendar

Update your timezone in **Settings → Preferences**. All schedule times and previews use this setting.

### Meta "App not active" during connect

The Meta app may be in Development mode. Only users added as testers in the Meta Developer dashboard can complete OAuth until the app goes Live.

---

## Help and support

| Resource | URL |
|----------|-----|
| Help center | `/help` |
| Connect Instagram | `/help/connect-instagram` |
| AI credits | `/help/credits-and-generation` |
| First week loop | `/help/first-week-loop` |
| Contact | `/contact` |
| Pricing | `/pricing` |
| Changelog | `/changelog` |
| Privacy | `/privacy` |
| Terms | `/terms` |
| Refunds & billing | `/refunds` |

For account or billing questions, use the contact form or the support email listed in the site footer.

---

*Last updated: August 2026*
