# Production Hosting & Deployment Guide

This guide provides step-by-step instructions for deploying this full-stack application with a split architecture:
- **Frontend**: Netlify (Static Hosting + API Redirect Proxies)
- **Backend (Express)**: Render (Node.js Web Service)
- **Database**: Neon (PostgreSQL cloud database)

---

## Part 1: Database Setup in Neon (PostgreSQL)

Neon provides a fast, scale-to-zero serverless PostgreSQL database.

### 1. Create a Neon Project
1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **Create Project**. Name your project (e.g., `computer-jungle-db`) and select your region (e.g., closest to your users).
3. Copy the **Connection String** shown on the dashboard. It will look like this:
   ```env
   postgresql://alex:password@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   *Keep this connection string safe! You will need it for the Render backend.*

### 2. Create the Database Schema
1. Inside the Neon console, click on the **SQL Editor** tab on the left sidebar.
2. Open the file `/src/db/schema.sql` inside this project.
3. Copy the entire contents of `schema.sql` and paste them into the Neon SQL Editor.
4. Click **Run** to execute the script. This will create all 15 relational tables (`users`, `departments`, `courses`, `admissions`, `repairs`, etc.) with perfect types and constraints.

---

## Part 2: Backend Setup in Render

Render is a modern platform-as-a-service perfect for hosting your Express server (`server.ts`).

### 1. Create a Web Service on Render
1. Go to [Render.com](https://render.com/) and log in.
2. Click **New +** and choose **Web Service**.
3. Connect your GitHub repository containing this codebase.
4. Set the following configuration settings:
   - **Name**: `computer-jungle-backend`
   - **Region**: Select the region closest to your Neon database (e.g., Oregon, Frankfurt).
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

### 2. Add Environment Variables in Render
Under the **Environment** tab in your Render Web Service dashboard, add the following variables:
1. `NODE_ENV` = `production`
2. `DATABASE_URL` = *(Your Neon PostgreSQL Connection String copied in Part 1)*
3. `GEMINI_API_KEY` = *(Your Google Gemini API Key for chatbot services)*
4. `PORT` = `3000` (Optional, Render assigns this automatically, but Express is hardcoded to listen here).

### 3. Deploy
- Click **Deploy Web Service**. Render will install dependencies, build the React static files, bundle the Express TypeScript server into `/dist/server.cjs`, and launch it on an HTTPS URL (e.g., `https://computer-jungle-backend.onrender.com`).
- Copy your live **Render Service URL**! You will need it for Netlify.

---

## Part 3: Frontend Setup in Netlify

Netlify is a fast, global CDN perfect for static frontend assets.

### 1. Configure the `netlify.toml` Proxy Redirects
We have created a `/netlify.toml` file in the root of this project. It is pre-configured to:
1. Serve the frontend SPA correctly (preventing "404 on page refresh" errors).
2. Proxy all `/api/*` fetch calls from your React code directly to your Render backend without triggering any CORS errors or needing you to change any frontend code URLs!

**Action Required**:
Open `/netlify.toml` and change line 13 to point to your live Render Web Service URL:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-on-render.onrender.com/api/:splat" # <-- REPLACE THIS URL with your live Render backend URL!
  status = 200
  force = true
```

### 2. Create the Site on Netlify
1. Log in to [Netlify.com](https://www.netlify.com/).
2. Click **Add new site** > **Import from an existing project**.
3. Authorize and connect your GitHub repository.
4. Set the build parameters (Netlify will automatically detect them from `netlify.toml`):
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy Site**.
6. Once deployed, Netlify will give you a custom subdomain (e.g. `https://computer-jungle.netlify.app`).

**That's it!** All frontend assets are loaded from Netlify, and any `/api/admissions`, `/api/health`, or user logins are seamlessly proxied to your Render backend, which queries your durable Neon database.

---

## Part 4: Code Modifications for Full PostgreSQL Integration

Currently, the server uses a local JSON file (`db.json`) as its database layer through `db-store.ts`. To fully switch your backend to query Neon PostgreSQL in production, do the following:

### 1. Install the `pg` package
Run these commands in your project terminal:
```bash
npm install pg
npm install -D @types/pg
```

### 2. Swap `dbStore` references in `server.ts`
We have prepared a ready-to-use PostgreSQL connector in `/src/db/db-postgres.ts` using the official `pg` client.

To hook it up to your server:
1. Open `/server.ts`.
2. Import `dbPostgres` at the top:
   ```typescript
   import { dbPostgres } from "./src/db/db-postgres";
   ```
3. Update endpoints that query/mutate data to use the async `dbPostgres` functions. For example:

   *Before (Synchronous File DB)*:
   ```typescript
   app.get("/api/admissions", (req, res) => {
     const admissions = dbStore.getAdmissions();
     res.json(admissions);
   });
   ```

   *After (Async PostgreSQL DB)*:
   ```typescript
   app.get("/api/admissions", async (req, res) => {
     try {
       const admissions = await dbPostgres.getAdmissions();
       res.json(admissions);
     } catch (err) {
       res.status(500).json({ error: "Failed to fetch admissions" });
     }
   });
   ```

Use the patterns already built in `/src/db/db-postgres.ts` to map columns between snake_case (SQL standard) and camelCase (TypeScript frontend objects).
