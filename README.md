# RFID Attendance Dashboard - Next.js

This is the Next.js version of the RFID Attendance Dashboard, providing both frontend and backend in a single application.

## Features

- **Authentication**: Supabase Auth with email/password and Google OAuth
- **Dashboard**: Real-time attendance monitoring with charts and analytics
- **Attendance Log**: Track entry/exit times with filtering and export
- **User Management**: Add, edit, and manage users with RFID tags
- **API Routes**: Built-in backend APIs for all functionality
- **Real-time Updates**: Live occupancy tracking

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Environment variables configured

### Installation

1. Install dependencies:
```bash
cd rfid-attendance-nextjs
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
rfid-attendance-nextjs/
├── app/
│   ├── (protected)/          # Protected routes with sidebar layout
│   │   ├── dashboard/        # Dashboard page
│   │   ├── attendance/       # Attendance log page
│   │   ├── users/           # User management page
│   │   └── profile/         # User profile page
│   ├── auth/                # Authentication pages
│   ├── api/                 # API routes
│   │   ├── analytics/       # Analytics endpoints
│   │   └── attendance/      # Attendance CRUD endpoints
│   ├── layout.js           # Root layout
│   └── page.js             # Home page (redirects)
├── components/             # Reusable components
├── context/               # React contexts
├── lib/                   # Utilities and configurations
└── public/               # Static assets
```

## API Routes

### Analytics Endpoints

- `GET /api/analytics/current` - Get current occupants
- `GET /api/analytics/weekly` - Get weekly occupancy data
- `GET /api/analytics/rush-hours` - Get rush hours analysis

### Attendance Endpoints

- `GET /api/attendance` - Get attendance logs with filters
- `POST /api/attendance` - Create entry/exit log

## Database Schema

The application expects the following Supabase tables:

### profiles
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `rfid_tag` (text)
- `phone_number` (text)
- `department` (text)
- `is_active` (boolean)
- `created_at` (timestamp)

### attendance_logs
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `entry_time` (timestamp)
- `exit_time` (timestamp, nullable)
- `created_at` (timestamp)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Differences from React Version

- **Routing**: Uses Next.js App Router instead of React Router
- **API**: Built-in API routes instead of external backend
- **Auth**: Server-side auth with middleware protection
- **Performance**: Server-side rendering for better initial load
- **SEO**: Better search engine optimization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request