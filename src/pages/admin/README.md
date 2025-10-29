# Admin Dashboard (Frontend)

This document explains the Admin Dashboard prototype included in the frontend.

Location
- Component: `src/pages/AdminDashboard.tsx`
- Route (dev): `/admin`

Purpose
- The Admin Dashboard included here is a lightweight prototype to manage site-level configuration and view a sports grid for quick management actions.
- It is intended as a UI scaffold; it does not include secure authentication or server-side protections.

Local (mock) credentials
- Username: `admin`
- Password: `admin123`

These credentials are used only for the prototype UI and are stored in local component state. Replace this flow with a proper authentication method (Supabase Auth, OAuth, or a secure backend) before deploying.

Notes for developers
- To change the admin UI, edit `src/pages/AdminDashboard.tsx`.
- If you add backend endpoints for admin actions, protect them with proper auth and consider adding server-side validation.
- Consider adding a route guard (private route) in `src/App.tsx` so `/admin` cannot be accessed without authentication.

Suggestions / next steps
- Wire admin login to Supabase Auth or another auth provider and persist a secure session (cookies or localStorage with JWT + refresh token).
- Add user roles and permission checks on the server.
- Extract the login panel into a reusable component under `src/components/admin` and add unit tests.

If you want, I can implement the secure auth integration and a basic route guard next. Reply with which provider you prefer (Supabase, Auth0, Firebase Auth, custom JWT) and I'll scaffold it.
