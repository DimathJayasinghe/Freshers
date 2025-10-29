# UOC Freshers' Meet 2025 (Frontend)

This repository contains the frontend for the UOC Freshers' Meet 2025 web application.

Key technologies
- React + TypeScript (Vite)
- Tailwind CSS for styling
- lucide-react for icons
- Supabase client helper present under `src/lib/supabaseClient.ts` (optional backend integration)

Author: Pahasara / UCSC Media Club

Quick links
- Production: https://uocfreshers.netlify.app/ (may show empty data while DB is populated)
- Development: https://uocfreshersdev.netlify.app/

Getting started (frontend)
1. Install dependencies

```powershell
npm install
```

2. Run development server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

Notes
- The app uses local data helpers in `src/lib/api.ts`. Some pages include mock loading states and prototype admin UI.
- An Admin Dashboard page exists at the route `/admin`. See `src/pages/admin/README.md` for details about the admin prototype and local mock credentials.

Contributing
- Please follow the existing code style (TypeScript + Tailwind utility classes). If you add new components, place them under `src/components` and export/use the UI primitives in `src/components/ui`.

Security
- The current admin implementation is a prototype using local/mock credentials. Do NOT use it in production. Replace with proper auth (Supabase/Auth, JWT, or similar) and protect the `/admin` route.

If you need help running the project locally or want me to add CI scripts, tests, or a prettier/eslint setup, tell me which one to add and I'll implement it.