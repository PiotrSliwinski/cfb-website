# Google Reviews Integration Setup Guide

This guide will help you set up automatic loading of 5-star reviews from your Google Business Profile for Clínica Ferreira Borges.

## Overview

The website now automatically fetches and displays 5-star reviews from your Google Business Profile. The reviews are shown on the homepage in a modern, responsive grid layout with:

- ⭐ Star ratings
- 👤 Author profile photos
- 📝 Review text
- 🕒 Relative timestamps (e.g., "2 weeks ago")
- 🔗 Links to view all reviews on Google

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account to create API credentials
2. **Google Business Profile**: Your clinic must have an active Google Business Profile
3. **Place ID**: We've already configured the Place ID for Clínica Ferreira Borges

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "New Project"
4. Name it "CFB Website" (or any name you prefer)
5. Click "Create"

### Step 2: Enable the Places API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Places API"
3. Click on "Places API (New)"
4. Click "Enable"

### Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "API key"
3. Copy the generated API key
4. Click "RESTRICT KEY" (recommended for security)

### Step 4: Restrict the API Key (Recommended)

For security, restrict your API key to only work with the Places API and your website domain:

1. **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add your website domain (e.g., `https://clinicaferreiraborges.pt/*`)
   - For local development, also add `http://localhost:3000/*`

2. **API restrictions**:
   - Select "Restrict key"
   - Check only "Places API"

3. Click "Save"

### Step 5: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Add your Google Places API key:

\`\`\`bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
\`\`\`

The Place ID is already configured:
\`\`\`bash
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJI6mkuRNzJA0RNwj5bykp9vk
\`\`\`

3. Restart your development server for changes to take effect

### Step 6: Verify It Works

1. Open your website at `http://localhost:3000`
2. Scroll down to the testimonials section
3. You should see your 5-star Google reviews displayed automatically!

If you see a yellow warning message instead, check:
- Your API key is correct
- The Places API is enabled in Google Cloud Console
- Your API key restrictions allow your domain

## Features

### Automatic Filtering
- Only shows reviews with 5 stars
- Automatically sorted by most recent first
- Displays up to 6 reviews on the homepage

### Responsive Design
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

### SEO Benefits
- Fresh, real customer testimonials
- Authentic social proof
- Proper attribution to Google

### User Experience
- Profile photos for credibility
- Star ratings for quick scanning
- Links to view all reviews on Google
- Relative timestamps (e.g., "3 weeks ago")

## API Limitations

⚠️ **Important**: The Google Places API has some limitations:

1. **Maximum 5 reviews per request**: Google's API only returns up to 5 reviews at a time
2. **No sorting options**: You cannot request specific star ratings (filtering happens client-side)
3. **Rate limits**: Free tier allows 200,000 requests/month
4. **Caching**: Reviews are cached for 1 hour to reduce API calls

## Cost Estimate

For a typical small business website:

- **Monthly API calls**: ~1,000-5,000 (depending on traffic)
- **Google Cloud Free Tier**: $200 credit/month for first 90 days
- **Ongoing cost**: Typically $0-5/month for most small business websites

The Places API pricing is:
- First 1,000 requests: Free
- Additional requests: $0.00 per request (currently free for basic details)

## Troubleshooting

### "Configuration Required" Message

**Problem**: Yellow warning box appears instead of reviews

**Solutions**:
1. Check your `.env.local` file has the correct API key
2. Verify the API key is not set to `your_google_places_api_key_here`
3. Restart your development server after changing environment variables

### "REQUEST_DENIED" Error

**Problem**: API returns REQUEST_DENIED status

**Solutions**:
1. Verify the Places API is enabled in Google Cloud Console
2. Check that your API key has proper restrictions set
3. Ensure your domain is whitelisted in API key restrictions
4. Try using a new API key

### No Reviews Showing

**Problem**: Section doesn't display any reviews

**Solutions**:
1. Check if your business actually has 5-star reviews on Google
2. Open browser console (F12) to see any JavaScript errors
3. Test the API directly: `http://localhost:3000/api/google-reviews?minRating=5`
4. Verify the Place ID is correct for your business

### Wrong Business Reviews

**Problem**: Shows reviews from a different business

**Solutions**:
1. Find your correct Place ID:
   - Go to [Google Maps](https://www.google.com/maps)
   - Search for "Clínica Ferreira Borges Lisboa"
   - Look at the URL, find the data after `!1s` (should start with `0x`)
   - Use a Place ID lookup tool to convert to proper Place ID format
2. Update `NEXT_PUBLIC_GOOGLE_PLACE_ID` in `.env.local`

## Finding Your Place ID

If you need to verify or find your business's Place ID:

### Method 1: From Google Maps URL
1. Search for your business on [Google Maps](https://maps.google.com)
2. Click on your business listing
3. Look at the URL - it contains a code like `0xd1933613b9a4923:0xf969929ef0f90837`
4. Use [Google's Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder) to convert it

### Method 2: Use Place ID Finder Tool
1. Go to [Google Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for "Clínica Ferreira Borges, Lisboa"
3. Click on your business marker
4. Copy the Place ID shown

### Method 3: Use Places API
You can also use the Places API Text Search to find your Place ID:
\`\`\`bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Clinica+Ferreira+Borges+Lisboa&key=YOUR_API_KEY"
\`\`\`

## Customization

### Change Minimum Rating
To show 4-star and 5-star reviews instead of just 5-star:

1. Open `src/components/home/GoogleReviewsSection.tsx`
2. Find the line: `const response = await fetch('/api/google-reviews?minRating=5');`
3. Change `minRating=5` to `minRating=4`

### Change Number of Reviews Displayed
To show more or fewer reviews:

1. Open `src/components/home/GoogleReviewsSection.tsx`
2. Find the line: `{reviewsData.reviews.slice(0, 6).map(`
3. Change `6` to your desired number (e.g., `9` for 9 reviews)

### Change Update Frequency
Reviews are cached for 1 hour by default. To change this:

1. Open `src/app/api/google-reviews/route.ts`
2. Find the line: `next: { revalidate: 3600 }`
3. Change `3600` (seconds) to your desired cache time

## Production Deployment

When deploying to Vercel or other hosting platforms:

1. Add the environment variable `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` to your deployment platform
2. Update your API key restrictions to include your production domain
3. The Place ID should remain the same

### Vercel Deployment
1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` with your API key
4. Deploy!

## Support

For issues or questions:
- Check the [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- View [Google Cloud Console](https://console.cloud.google.com/)
- Open an issue on GitHub

---

**Last Updated**: January 2025
