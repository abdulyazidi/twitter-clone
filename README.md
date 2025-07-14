# Twitter Clone

A modern, full-stack Twitter clone built with React Router v7, featuring real-time interactions, media uploads, and comprehensive social features.

## ✨ Features

- 🐦 **Full Twitter Experience**: Tweet, reply, quote, retweet, like, and bookmark
- 👥 **Social Network**: Follow/unfollow users, mentions, user profiles
- 📸 **Media Support**: Image, video, audio, and GIF uploads via Cloudflare R2
- 🔒 **Authentication**: Secure user registration and login
- 📱 **Responsive Design**: Mobile-first UI with modern components
- ⚡️ **Real-time Updates**: Optimistic UI updates and seamless interactions
- 🎨 **Modern Stack**: React Router v7, Prisma ORM, PostgreSQL, TailwindCSS

## 🛠 Tech Stack

- **Frontend**: React Router v7, TypeScript, TailwindCSS, Radix UI
- **Backend**: React Router v7 Server, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudflare R2 (S3-compatible) for media files
- **Deployment**: Docker support included

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudflare R2 account (or S3-compatible storage)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd twitter-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/db"

# Cloudflare R2 Storage (or S3-compatible)
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="your-bucket-name"
R2_BUCKET_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

### 4. Database Setup

#### Initialize the Database

```bash
# Generate Prisma client
npx prisma generate --sql

# Run database migrations
npx prisma migrate deploy
```

#### Seed the Database (Optional)

```bash
# Seed with sample data including users and tweets
npx prisma db seed
```

This will create sample users (alex, brian, casey, drew, elliot) with various tweets, interactions, and follows to explore the features.

### 5. Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

### 6. Type Generation

React Router v7 uses automatic type generation. If you encounter TypeScript errors after adding routes:

```bash
npm run typecheck
```

## 📁 Project Structure

```
twitter-clone/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── tweet.tsx       # Tweet display component
│   │   ├── tweet-form.tsx  # Tweet composition form
│   │   └── ...
│   ├── routes/             # Route modules
│   │   ├── _home.tsx       # Main layout
│   │   ├── _home.home._index.tsx  # Home timeline
│   │   ├── _home.$username.tsx    # User profiles
│   │   ├── api.*.ts        # API endpoints
│   │   └── ...
│   ├── lib/                # Utilities and types
│   └── root.tsx           # Root layout
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seeding
└── ...
```

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with profiles and follower relationships
- **Tweets**: Posts with support for replies, quotes, and media
- **Interactions**: Likes, retweets, bookmarks, mentions
- **Media**: File storage references for images, videos, etc.
- **Sessions**: User authentication sessions

## 🐳 Docker Deployment

### Build the Docker Image

```bash
docker build -t twitter-clone .
```

### Run the Container

```bash
docker run -p 3000:3000 --env-file .env twitter-clone
```

Make sure your `.env` file contains all required environment variables and that your database is accessible from within the Docker container.

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Generate types and run TypeScript checks
- `npx prisma studio` - Open Prisma database browser
- `npx prisma db seed` - Seed database with sample data

## 🚀 Building for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## 📊 Key Features

### Social Features

- ✅ User registration and authentication
- ✅ Follow/unfollow users
- ✅ User profiles with bio, avatar, and stats
- ✅ Private account support

### Tweet Features

- ✅ Compose tweets with text and media
- ✅ Reply to tweets (threaded conversations)
- ✅ Quote tweets with additional commentary
- ✅ Retweet (share) functionality
- ✅ Like and bookmark tweets
- ✅ Mention users with @username

### Media Support

- ✅ Upload images, videos, audio, and GIFs
- ✅ Multiple media attachments per tweet
- ✅ Optimized media display and loading

### Timeline & Discovery

- ✅ Personalized home timeline
- ✅ Following timeline
- ✅ User profile tweets
- ✅ Real-time interaction counts

Built with ❤️ using React Router v7, Prisma, and modern web technologies.
