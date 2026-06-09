# Territory Intelligence Platform

A full-stack B2B SaaS revenue intelligence application for Regional Sales Directors managing western US territories.

## Features

- Executive overview dashboard with real-time KPIs
- Customer health scoring (health, renewal risk, expansion scores)
- AI-generated executive summaries powered by Claude
- Pipeline tracking by stage
- Priority actions ranked by urgency
- 300 seeded accounts with intentional data patterns

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **AI:** Anthropic Claude API

## Local Development

### Prerequisites

- Node.js v20+
- Supabase account

### Setup

1. Clone the repo
2. Install server dependencies: `cd server && npm install`
3. Install client dependencies: `cd client && npm install`
4. Add your `.env` file to the server folder with `DATABASE_URL`, `DIRECT_URL`, and `ANTHROPIC_API_KEY`
5. Run migrations: `cd server && npx prisma migrate dev`
6. Seed the database: `npm run seed`
7. Start the server: `node index.js`
8. Start the client: `cd client && npm run dev`
