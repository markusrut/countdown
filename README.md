# Countdown Application

A full-stack countdown application powered by Next.js, Prisma, and NextAuth. It allows users to track upcoming events and share them via short links.

## Prerequisites

- Node.js >= 18
- npm

## Getting Started

1. **Clone the repository and install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment variables:**

   Copy the sample environment file to `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in the required values in your `.env` file, specifically your `GITHUB_ID` and `GITHUB_SECRET`. You can generate these by creating a new OAuth Apps in your GitHub developer settings. Set the authorization callback URL to `http://localhost:3000/api/auth/callback/github`.

3. **Initialize the Database:**

   We use a local SQLite database for development. Create the database schema by running:

   ```bash
   pnpm prisma db push
   ```

4. **Start the Development Server:**

   ```bash
   pnpm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- **Offline Support**: Create temporary countdowns directly from URL parameters without an account for offline usage.
- **User Accounts**: Login securely with GitHub to save, manage, and share events.
- **Short Links**: Share countdowns with others via persistent short links (`/c/[shortCode]`) that fetch from the database.
- **Premium UI**: Uses a glassmorphism design with neat and dynamic gradients.
