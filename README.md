# Computer-Jungle

A cyber cafe web app system for Computer Jungle Training Center in Kumba, Cameroon.

## Features

- **Admin Dashboard** - Manage admissions, certificates, repairs, and shop inventory
- **Admissions Portal** - Student applications with document uploads
- **Certificate Registry** - Verify and manage training certificates
- **Repairs Workshop** - Computer repair ticketing system
- **Documentation Services** - CV building and document processing
- **Hardware Shop** - E-commerce platform for laptops and accessories
- **Student Portal** - Academic records, attendance, and assignments
- **Teacher Workspace** - Manage timetables and grading
- **AI CV Builder** - Powered by Google Gemini API
- **AI Chatbot** - Customer support assistant

## Run Locally

**Prerequisites:** Node.js, npm

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=postgresql://user:password@host/database
   APP_URL=http://localhost:3000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Build for Production

```
npm run build
npm start
```

## Tech Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Express.js
- Database: PostgreSQL (Neon) or Local JSON (fallback)
- Styling: Tailwind CSS
- AI: Google Gemini API
- Deployment: Render + Neon

## Motto

"In Computer, We Trust" - Computer Jungle Training Center, Kumba
