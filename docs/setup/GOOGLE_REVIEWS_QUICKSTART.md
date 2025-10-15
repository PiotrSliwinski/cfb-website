# Google Reviews Quick Start

## What Was Built

Your website now automatically displays 5-star reviews from your Google Business Profile! 🌟

## What You See

On your homepage, you'll now see a new testimonials section that:
- ✅ Automatically fetches 5-star reviews from Google
- ✅ Shows reviewer photos and names
- ✅ Displays star ratings
- ✅ Shows when reviews were posted
- ✅ Links to view all reviews on Google
- ✅ Works in both Portuguese and English

## To Activate (Required)

The feature is built but needs a Google API key to work. Follow these 3 simple steps:

### 1. Get a Google API Key (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "CFB Website"
3. Enable "Places API"
4. Create an API key
5. Copy the API key

### 2. Add the API Key

Open `.env.local` and replace this line:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

With your actual API key:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...your_actual_key
```

### 3. Restart the Server

```bash
npm run dev
```

That's it! Your Google reviews will now appear automatically.

## Detailed Setup Guide

For complete step-by-step instructions with screenshots, see:
**[docs/GOOGLE_REVIEWS_SETUP.md](docs/GOOGLE_REVIEWS_SETUP.md)**

## Cost

- **Free Tier**: $200 credit/month for first 90 days
- **Typical cost**: $0-5/month for a small business website
- **API limits**: 200,000 requests/month (plenty for most sites)

## What Happens Without API Key

If you don't set up the API key, you'll see a yellow warning message on the homepage explaining what needs to be configured. The site will still work perfectly - just without the Google reviews section.

## Need Help?

See the full documentation at [docs/GOOGLE_REVIEWS_SETUP.md](docs/GOOGLE_REVIEWS_SETUP.md) or open an issue on GitHub.
