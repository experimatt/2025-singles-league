# 2025 Summer Tennis League App

**Live site**: https://experimatt.github.io/2025-singles-league/

## Overview

A client-side React application for tracking tennis league standings and submitting match results. Data is stored in Airtable and the app is hosted on GitHub Pages.

## Features

- View league standings by division (Leonardo, Donatello, Michelangelo, Raphael)
- Submit match results
- Real-time data sync with Airtable
- Responsive design with modern UI

## Setup Instructions

### 1. Airtable Setup

1. Create a new Airtable base or use an existing one
2. Create two tables:

**Players Table:**
- Name (Single line text)
- Division (Single select: Leonardo, Donatello, Michelangelo, Raphael)
- Email (Email)

**Matches Table:**
- Player1 (Single line text)
- Player2 (Single line text)
- Player1Score (Number)
- Player2Score (Number)
- Winner (Single line text)
- Division (Single line text)
- Date (Date)
- Notes (Long text)

3. Get your Airtable credentials:
   - **Personal Access Token**: Go to https://airtable.com/create/tokens
     - Create a new token with `data.records:read` and `data.records:write` permissions
     - Add your base to the token scope
   - **Base ID**: Found in the Airtable URL (starts with "app")

### 2. Environment Setup

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Airtable credentials in `.env.local`:
   ```
   NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=your_actual_token_here
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_actual_base_id_here
   ```

### 3. Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### 4. Deployment to GitHub Pages

The app is configured to automatically deploy to GitHub Pages when you push to the main branch.

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. Push your code to the main branch and the GitHub Action will build and deploy automatically

3. Your app will be available at: `https://yourusername.github.io/2025-singles-league/`

## Project Structure

```
├── app/
│   ├── components/         # App-specific components
│   ├── lib/               # Airtable API integration
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # Reusable UI components
├── .github/workflows/     # GitHub Actions for deployment
└── next.config.mjs       # Next.js configuration for static export
```

## Troubleshooting

### Airtable Connection Issues

1. Verify your Personal Access Token has the correct permissions
2. Check that your Base ID is correct (starts with "app")
3. Ensure your table and field names match exactly
4. Check browser console for detailed error messages

### GitHub Pages Deployment

1. Ensure the repository name matches the `basePath` in `next.config.mjs`
2. Check the GitHub Actions tab for build errors
3. Verify GitHub Pages is enabled in repository settings

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Data**: Airtable API
- **Deployment**: GitHub Pages with GitHub Actions 