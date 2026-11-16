# EventHub: how to run (backend + frontend)

You need Node 18+ and MongoDB running locally (or a MongoDB Atlas URL).

## 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # open .env and set MONGODB_URI and JWT_SECRET
npm run seed                # creates demo users + 12 sample Indore events (Sarafa, Rajwada, 56 Dukan, Meghdoot Garden...)
npm run dev                 # http://localhost:5000
```

Demo logins created by `npm run seed`:

| Role      | Email                  | Password       |
|-----------|------------------------|----------------|
| Admin     | admin@eventhub.com     | Admin@123      |
| Organizer | organizer@eventhub.com | Organizer@123  |
| Attendee  | user@eventhub.com      | User@123       |

## 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env        # REACT_APP_API_URL=http://localhost:5000/api/v1
npm start                   # http://localhost:3000
```

## Things worth knowing
- **Create event:** "Publish event" makes it live immediately. "Save as draft" keeps it hidden until an admin approves it from the Admin dashboard.
- **Passes:** free tickets are confirmed instantly. For paid tickets press **Pay now** on My bookings (demo payment). Then **Download pass** creates a PDF with one pass per attendee and a QR code.
- Cover image: paste an image link when creating an event, or leave it empty and a photo for the category is used.
- Admin accounts cannot be self-registered; use the seed account.
- Always restart the backend after changing `.env`.

## Look and feel
Calm, professional theme (indigo accent, soft borders) with light and dark mode. The background reacts to the cursor (lit grid and spotlight) and the hero has a particle network; both switch off on touch devices and for "reduce motion".

## What was fixed for event creation and passes
- Create event: the default start time was already "in the past" by the time you pressed submit, so validation silently blocked the form. Defaults are now tomorrow 6 PM, and any error scrolls into view with a message.
- Online events no longer fail because of a missing venue; empty "maximum attendees" no longer causes errors.
- New events are published immediately (they used to be saved as drafts, so nobody could see or book them).
- Passes: the pass number is now always generated, free tickets auto-confirm, and "Download pass" produces a real PDF (it was a placeholder before).
- Marking a booking as paid twice no longer double-counts tickets, and only the booking owner can pay for it.

## What was fixed earlier
- Token was signed with one secret and verified with another, so every protected request returned 401 (logout, profile, bookings, notifications all failed).
- Logout now always works, even if the server is unreachable.
- Wrong password no longer reloads the page and hides the error; a wrong "current password" no longer logs you out.
- Server no longer crashes at start when `STRIPE_SECRET_KEY` is missing.
- Rate limit raised for development (was 100 requests / 15 min), CORS accepts any localhost port.
- Booking errors now return a response instead of hanging.
- Profile save now actually saves; payment email failure no longer breaks payment.
