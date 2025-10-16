# Clínica Ferreira Borges Website

Modern website for Clínica Ferreira Borges dental clinic in Lisbon, built with Next.js and Supabase.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Internationalization**: next-intl (Portuguese & English)
- **UI Components**: shadcn/ui + Lucide icons
- **Deployment**: Vercel (recommended)

## Features

- ✅ Multi-language support (Portuguese/English)
- ✅ Server-side rendering for optimal SEO
- ✅ PostgreSQL database with full schema
- ✅ Type-safe API with Supabase
- ✅ Responsive design
- ✅ Content management ready
- ✅ Dynamic treatment pages
- ✅ Team member profiles
- ✅ **Google Business Profile reviews integration** (automatic 5-star reviews)
- ✅ Contact forms
- 🚧 Admin panel (basic structure ready)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for local Supabase)
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/PiotrSliwinski/cfb-website.git
cd cfb-website
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start Supabase (requires Docker):
\`\`\`bash
npx supabase start
\`\`\`

This will start local Supabase instance with:
- API URL: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio: http://127.0.0.1:54323
- Mailpit: http://127.0.0.1:54324

4. Copy environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

The `.env.local` file is already configured with local Supabase credentials.

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
cfb-website/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   └── layout.tsx     # Locale layout
│   │   ├── globals.css
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Header, Footer, LanguageSwitcher
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── i18n/              # Internationalization config
│   │   ├── supabase/          # Supabase client setup
│   │   └── utils.ts           # Utility functions
│   ├── messages/              # Translation files
│   │   ├── pt.json
│   │   └── en.json
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── supabase/
│   └── migrations/            # Database migrations
├── .env.local                 # Environment variables
└── README.md
\`\`\`

## Database Schema

The database includes tables for:
- Languages (pt, en)
- Pages & translations
- Treatments & translations
- Treatment FAQs & translations
- Team members & translations
- Testimonials & translations
- Media items
- Contact submissions
- Site settings

See [supabase/migrations/20251005223123_initial_schema.sql](supabase/migrations/20251005223123_initial_schema.sql) for the complete schema.

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npx supabase start\` - Start local Supabase
- \`npx supabase stop\` - Stop local Supabase
- \`npx supabase status\` - Check Supabase status
- \`npx supabase db reset\` - Reset database to migrations

## Environment Variables

Create a \`.env.local\` file with:

\`\`\`env
# Supabase (NEXT_PUBLIC_ prefix required for client-side access)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Places API (server-only, no NEXT_PUBLIC_ prefix for security)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_PLACE_ID=ChIJI6mkuRNzJA0RNwj5bykp9vk
\`\`\`

For local development, Supabase variables are set automatically when you run \`npx supabase start\`.

**For Google reviews integration**, see [docs/GOOGLE_REVIEWS_SETUP.md](docs/GOOGLE_REVIEWS_SETUP.md) for detailed setup instructions.

## Multi-Language Support

The website supports Portuguese (default) and English. URLs are structured as:
- Portuguese: \`/\` or \`/pt\`
- English: \`/en\`

Add translations in \`src/messages/pt.json\` and \`src/messages/en.json\`.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set up a Supabase project at [supabase.com](https://supabase.com)
4. Run migrations: \`npx supabase db push\`
5. Add environment variables in Vercel dashboard
6. Deploy!

## Development Progress

1. ✅ Phase 1: Foundation - COMPLETED
   - Next.js setup
   - Supabase with Docker
   - Multi-language support
   - Base layout components

2. ✅ Phase 2: Core Pages - COMPLETED
   - Homepage with Hero, Services, Commitment sections
   - Google Business Profile reviews integration (automatic 5-star reviews)
   - Dynamic treatment pages with benefits, process steps, and FAQs
   - Team page with all 9 team members and photos
   - Location page with contact information and map
   - Contact forms integrated

3. ✅ Phase 3: Content Management - COMPLETED
   - Complete treatment content for all 5 treatments (PT/EN)
   - Admin panel with image upload system
   - Supabase Storage buckets configured
   - 20 treatment FAQs created
   - Benefits and process steps (JSONB data)
   - See [docs/PHASE_3_VISUAL_SUMMARY.md](docs/PHASE_3_VISUAL_SUMMARY.md) for details

4. 🚧 Phase 4: Features & Integration
   - Analytics
   - SEO optimization
   - Social media integration

5. 🚧 Phase 5: Testing & Launch
   - Testing
   - Performance optimization
   - Production deployment

## License

Copyright © 2025 Clínica Ferreira Borges. All rights reserved.

## Support

For issues or questions, please open an issue on GitHub.
