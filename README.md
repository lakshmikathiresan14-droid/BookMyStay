# BookMyStay

A hotel listing app: add, edit, delete, search, filter by price, paginate, and view each hotel on a map.

- **client/** - React + Redux Toolkit + React Router (Vite)
- **server/** - Node.js + Express + PostgreSQL (native SQL, no ORM), images saved on the server's disk

## What you need

- Node.js 18 or newer (nodejs.org)
- PostgreSQL (postgresql.org), with a running server

## 1. Set up the database

Create an empty database (use whichever way you like). With the command line:

```bash
createdb bookmystay
```

or in `psql`: `CREATE DATABASE bookmystay;`

## 2. Start the backend

```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Open `server/.env` and set `DATABASE_URL` to your Postgres username and password, e.g.
`postgres://postgres:yourpassword@localhost:5432/bookmystay`

Then:

```bash
npm run db:init             # creates the hotels table
npm run db:seed             # adds 12 sample hotels (optional)
npm run dev                 # API on http://localhost:5000
```

Quick check: open http://localhost:5000/api/health, it should show `{"status":"ok"}`.

## 3. Start the frontend (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. In development the Vite dev server forwards `/api` and `/uploads`
to the backend, so there is nothing else to configure.

## API

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/api/hotels?search=&minPrice=&maxPrice=&limit=&offset=` | List hotels. Returns `{ data, total, limit, offset }` |
| GET | `/api/hotels/:id` | One hotel |
| POST | `/api/hotels` | Create (multipart form: `image`, `title`, `description`, `latitude`, `longitude`, `price`) |
| PUT | `/api/hotels/:id` | Update. Send a new `image` only if you want to replace it |
| DELETE | `/api/hotels/:id` | Delete the hotel and its image file |

- Validation errors come back as `400 { message, errors: { field: "text" } }`.
- Uploaded images go to `server/uploads/` and the database stores the path (e.g. `/uploads/1732..-ab12.jpg`).
  When a hotel is deleted, or its image is replaced, the old file is removed from disk.
- All queries are plain parameterized SQL (`$1, $2, ...`) in `server/src/controllers/hotelController.js`.

## Requirement checklist

| Requirement | Where |
| --- | --- |
| One form for add and edit, with image preview | `client/src/components/HotelForm.jsx` |
| Validation (client and server) | `client/src/utils/validate.js`, `server/src/middleware/validate.js` |
| Card list, search by title, price filter, pagination | `client/src/pages/HotelList.jsx` and its components |
| Delete with success popup | `client/src/components/DeleteFlow.jsx` |
| Details page with map (lat/lng) | `client/src/pages/HotelDetails.jsx`, `MapView.jsx` |
| Geolocation API | "Use my current location" button in the form |
| SEO | `react-helmet-async` on every page, `alt` text on every image |
| Redux | `client/src/redux/hotelSlice.js` (async thunks call the API) |
| Express + PostgreSQL + native SQL + local image storage | `server/` |

## Notes

- `react-helmet-async` is used instead of the older `react-helmet` (same `<Helmet>` API, works with React 18).
- Seed hotels use picsum.photos images (needs internet). Hotels you add use the uploaded file from `server/uploads/`.
- For a deployed setup, set `VITE_API_URL` in `client/.env` to the API's address.
