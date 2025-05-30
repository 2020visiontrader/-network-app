# Network App

A relationship management platform for maintaining and strengthening personal and professional connections through smart reminders, introductions, city-based meetups, and travel visibility.

## Features

- User management with roles (member, mentor, mentee, ambassador)
- Contact management with relationship tracking
- Smart introduction system
- Birthday reminders
- Coffee chat meetups
- Travel check-ins and notifications
- City-based networking

## Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)

2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file and update with your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase project credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

5. Run the database setup script:
   ```bash
   npm run setup-db
   ```

## Development

Build the project:
```bash
npm run build
```

Start the development server:
```bash
npm start
```

## Database Schema

The application uses the following main tables:

- `users`: User profiles and authentication
- `contacts`: Personal and professional contacts
- `introductions`: Connection introductions between contacts
- `birthday_reminders`: Automated birthday reminder system
- `coffee_chats`: City-based meetup scheduling
- `travel_checkins`: User travel and location updates

For detailed schema information, see `database/migrations/01_initial_schema.sql`.
# -network-app
