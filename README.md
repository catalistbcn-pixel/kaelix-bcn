# Kaelix BCN — Reservation App

React + Netlify + Supabase + Google Sheets reservation system for Exposición Kaelix BCN.

---

## Stack

- **Frontend**: React (Vite) — hosted on Netlify
- **Backend**: Netlify Function (serverless)
- **Database**: Supabase (PostgreSQL)
- **Guest list**: Google Sheets (auto-appended on each registration)

---

## Setup Guide

### 1 — Supabase

1. Go to [supabase.com](https://supabase.com) → your project
2. Open **SQL Editor** → paste the contents of `supabase-setup.sql` → Run
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_KEY`

### 2 — Google Sheets

1. Create a new Google Sheet in your Drive
2. Add headers in Row 1: `Fecha` | `Nombre` | `Email` | `Instagram` | `WhatsApp`
3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID_HERE**/edit`

**Create a Google Service Account:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Name it (e.g. `kaelix-sheets`), skip optional steps, click Done
6. Click the service account → **Keys → Add Key → Create new key → JSON**
7. Download the JSON file — you'll need `client_email` and `private_key` from it

**Share your Sheet:**

1. Open the Google Sheet
2. Click **Share**
3. Paste the service account email (`client_email` from the JSON)
4. Give it **Editor** access
5. Click Send

### 3 — Netlify

1. Push this project to GitHub (or GitLab)
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`
5. Go to **Site Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `GOOGLE_SHEET_ID` | Your Google Sheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON (paste the whole value including `\n`) |

6. Click **Deploy site**

### 4 — Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your values in .env.local
npm run dev
```

To test the Netlify function locally, install the Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

---

## What each registration does

1. Guest fills the form and submits
2. Netlify Function receives the POST
3. Simultaneously:
   - Inserts a row into Supabase `reservations` table
   - Appends a row to your Google Sheet
4. Guest sees a confirmation message

---

## Viewing registrations

- **Supabase**: Dashboard → Table Editor → `reservations`
- **Google Sheets**: Open your Sheet — rows appear in real time
