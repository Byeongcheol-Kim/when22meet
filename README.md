# When2Meet (언제만나)

> A simple and efficient group scheduling service for finding the best meeting time

[한국어 문서 (Korean Documentation)](./README_KO.md)

## Overview

When2Meet is a scheduling coordination tool that helps groups find the optimal meeting time by allowing participants to mark their availability across selected dates. Built with modern web technologies, it provides a clean, intuitive interface for collaborative scheduling.

## Features

- 📅 **Intuitive Date Selection**: Click and drag to select multiple dates at once
- 👥 **Dynamic Participant Management**: Add participants during creation or on-the-fly
- 🎯 **Availability Tracking**: Three-state system (Available, Unavailable, Undecided)
- 📊 **Real-time Best Dates**: Instantly see which dates work best for most participants
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔗 **URL Shortening**: Optional shortened links for easy sharing
- 🔒 **Schedule Locking**: Prevent accidental changes to confirmed schedules

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Upstash Redis (18-month TTL)
- **Deployment**: Vercel
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- Upstash Redis account (free tier available)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/when2meet.git
cd when2meet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create `.env.local` file:
```bash
# Required: Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Optional: URL Shortener
SHORTENER_API_URL=your_shortener_api_url
SHORTENER_API_KEY=your_shortener_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Setting Up Upstash Redis

1. Sign up at [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token from the dashboard
4. Add them to your `.env.local` file

## Project Structure

```
when2meet/
├── app/                        # Next.js app router
│   ├── api/                   # API routes
│   │   ├── meetings/          # Meeting CRUD operations
│   │   └── shorten/           # URL shortening service
│   ├── meeting/[id]/          # Meeting view page
│   └── page.tsx               # Landing page
├── components/                 # React components
│   ├── AboutModal.tsx         # About dialog
│   ├── DateSelector.tsx       # Calendar date picker
│   ├── MeetingTitleInput.tsx  # Title input component
│   └── ParticipantsInput.tsx  # Participant management
├── lib/                        # Utility functions
│   ├── redis.ts               # Redis client setup
│   ├── types.ts               # TypeScript definitions
│   └── utils/                 # Helper functions
└── public/                     # Static assets
```

## API Endpoints

### Meetings

- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/[id]` - Get meeting details
- `PUT /api/meetings/[id]` - Update meeting (availability, lock status)
- `DELETE /api/meetings/[id]` - Delete a meeting

### URL Shortener

- `POST /api/shorten` - Create shortened URL (optional feature)

## Development

### Running Tests
```bash
npm run test
```

### Code Quality
```bash
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
```

### Building for Production
```bash
npm run build
npm run start
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The application will automatically deploy on push to the main branch.

### Environment Variables for Production

Required in Vercel dashboard:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:
- `SHORTENER_API_URL`
- `SHORTENER_API_KEY`

## Features in Detail

### Date Selection
- Click to select/deselect individual dates
- Click and drag for multiple date selection
- Quick templates for common patterns (weekdays, weekends, specific days)

### Availability States
- **Available (참여)**: Green indicator, participant can attend
- **Unavailable (불참)**: Gray indicator, participant cannot attend  
- **Undecided (미정)**: Light gray with border, not yet decided

### Best Dates Algorithm
The app calculates optimal meeting dates based on:
- Number of available participants
- Minimum unavailable count
- Real-time updates as participants mark availability

### Mobile Optimization
- Touch-friendly interface
- Horizontal scrolling for date grid
- Sticky headers for easy navigation
- Responsive typography and spacing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Retention

All meeting data is automatically deleted after 18 months (TTL set in Redis).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original When2meet service
- Built with Next.js and Vercel
- Database hosting by Upstash

## Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Next.js and TypeScript