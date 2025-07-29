# RFID Attendance Dashboard

A comprehensive RFID-based attendance system with a modern web dashboard, built with Next.js 15 and Supabase.

## 🚀 Overview

This system provides an automated attendance tracking solution using RFID cards. It consists of:
- **Web Dashboard**: Modern Next.js application with real-time attendance monitoring
- **Backend**: Supabase for authentication, database, and real-time updates

## 📋 Features

### Web Dashboard
- **Authentication**: Email/password and Google OAuth
- **Real-time Attendance**: Live tracking of who's currently in the lab
- **Analytics Dashboard**: 
  - Current occupancy gauge
  - Rush hours analysis
  - Weekly occupancy trends
  - Top users pie chart
- **User Management**: Add, edit, and manage authorized users
- **Attendance History**: Detailed logs with filtering options
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, Material-UI (MUI)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, Emotion
- **Charts**: MUI X Charts, Recharts
- **State Management**: React Context API

### Project Structure
```
rfid-attendance-dashboard/
├── app/                      # Next.js app directory
│   ├── (protected)/         # Protected routes requiring auth
│   │   ├── attendance/      # Attendance logs page
│   │   ├── dashboard/       # Main analytics dashboard
│   │   ├── profile/         # User profile page
│   │   └── users/           # User management page
│   ├── api/                 # API routes
│   │   ├── analytics/       # Analytics endpoints
│   │   └── attendance/      # Attendance CRUD operations
│   ├── auth/                # Authentication pages
│   └── layout.js            # Root layout with providers
├── components/              # Reusable React components
├── context/                 # React Context providers
├── lib/                     # Utility libraries
├── theme/                   # MUI theme configuration
└── docs/                    # Documentation

```

## 🗄️ Database Schema

### Tables in Supabase

#### `users` table (RFID users)
```sql
- id: uuid (primary key, auto-generated)
- rfid_uid: text (unique, not null)
- name: text
- email: text (unique)
- reg_number: text (unique)
- role: enum (default 'member')
- phone_number: bigint
- created_at: timestamp with time zone
```

#### `attendance` table
```sql
- id: bigint (primary key, auto-generated)
- rfid_uid: text (references users.rfid_uid)
- Check: text
- created_at: timestamp with time zone
```

#### `lab_analytics` table
```sql
- id: integer (primary key, auto-generated)
- person_id: text (references users.rfid_uid)
- name: varchar
- check_in_time: timestamp
- check_out_time: timestamp
- time_spent_in_lab: interval
```

#### `lab_occupancy` table
```sql
- id: integer (primary key, auto-generated)
- date: date (not null)
- occupancy_count: integer
- peak_hour: time
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rfid-attendance-dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Optional but recommended)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration
NEXT_PUBLIC_API_URL=/api
```

### 4. Set up Supabase

1. Create a new Supabase project
2. Run the following SQL to create the necessary tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create role enum type
create type role as enum ('admin', 'member');

-- Create users table (for RFID)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  rfid_uid text unique not null,
  name text,
  email text unique,
  reg_number text unique,
  role role default 'member',
  phone_number bigint,
  created_at timestamp with time zone default now()
);

-- Create attendance table
create table public.attendance (
  id bigint generated always as identity primary key,
  rfid_uid text references public.users(rfid_uid),
  "Check" text,
  created_at timestamp with time zone not null default now()
);

-- Create sequences for lab tables
create sequence lab_analytics_id_seq;
create sequence lab_occupancy_id_seq;

-- Create lab_analytics table
create table public.lab_analytics (
  id integer not null default nextval('lab_analytics_id_seq'::regclass) primary key,
  person_id text references public.users(rfid_uid),
  name varchar,
  check_in_time timestamp without time zone,
  check_out_time timestamp without time zone,
  time_spent_in_lab interval
);

-- Create lab_occupancy table
create table public.lab_occupancy (
  id integer not null default nextval('lab_occupancy_id_seq'::regclass) primary key,
  date date not null,
  occupancy_count integer,
  peak_hour time without time zone
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.attendance enable row level security;
alter table public.lab_analytics enable row level security;
alter table public.lab_occupancy enable row level security;

-- Create policies (adjust as needed)
create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Attendance records are viewable by everyone" on public.attendance
  for select using (true);

create policy "Analytics are viewable by everyone" on public.lab_analytics
  for select using (true);

create policy "Occupancy data is viewable by everyone" on public.lab_occupancy
  for select using (true);
```

### 5. Configure Google OAuth (Optional)

Follow the instructions in `docs/GOOGLE_OAUTH_SETUP.md` to:
1. Create a Google Cloud project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🔐 Authentication Flow

1. **Email/Password**: Traditional signup/signin with email confirmation
2. **Google OAuth**: One-click signin with Google (includes One Tap)
3. **Session Management**: Automatic token refresh and session persistence
4. **Protected Routes**: Middleware ensures authentication for sensitive pages

## 📡 API Endpoints

### Attendance
- `GET /api/attendance` - Fetch attendance logs with filters
- `POST /api/attendance` - Record entry/exit

### Analytics
- `GET /api/analytics/current` - Current lab occupancy
- `GET /api/analytics/weekly` - Weekly attendance trends
- `GET /api/analytics/rush-hours` - Peak usage hours analysis

## 🎨 Theming

The application uses Material-UI theming with:
- Custom color palette
- Light/dark mode toggle
- Consistent spacing and typography
- Responsive breakpoints

Theme configuration is in `theme/config.js`.

## 🚦 Development Tips

1. **Local Development Without Auth**: Set `NEXT_PUBLIC_DISABLE_AUTH=true` in `.env.local`
2. **Test API Endpoints**: Use tools like Postman or curl to test the REST API
3. **Debug Mode**: Check browser console for detailed logs
4. **Database Changes**: Remember to update RLS policies in Supabase

## 📱 Deployment

The Next.js app can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted with Node.js

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Supabase URL and anon key
   - Check Google OAuth redirect URIs
   - Ensure email confirmation is disabled for testing

2. **Database Connection Issues**
   - Verify Supabase credentials in `.env.local`
   - Check Row Level Security policies
   - Ensure tables are created with correct schema

3. **API Errors**
   - Check API endpoints are correctly configured
   - Verify authentication tokens are being sent
   - Review browser console for detailed error messages

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Check existing issues on GitHub
- Review the troubleshooting guide
- Contact the maintainers