# Google Reviews Troubleshooting

## Current Issue: REQUEST_DENIED

You're seeing this error because the **Places API** needs to be enabled in your Google Cloud project.

## ✅ Quick Fix (2 minutes)

### Step 1: Enable Places API

1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library)
2. Search for "**Places API**" (make sure it says "Places API (New)" or just "Places API")
3. Click on it
4. Click the blue "**ENABLE**" button
5. Wait 30 seconds for it to activate

### Step 2: Verify Your API Key

Your API key should be configured in `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

Make sure this key has:
- ✅ Places API enabled (from Step 1)
- ✅ HTTP referrer restrictions set to: `http://localhost:3000/*`

### Step 3: Find Your Correct Place ID

The Place ID in `.env.local` might need to be updated. Here's how to find it:

**Method 1: Use Google's Place ID Finder**
1. Go to: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
2. Search for: "Clinica Ferreira Borges, Lisboa"
3. Click on your business marker
4. Copy the Place ID (starts with "ChIJ...")

**Method 2: Use the API Directly**
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Clinica+Ferreira+Borges+Lisboa+Rua+Ferreira+Borges+173C&key=YOUR_API_KEY_HERE"
```

Replace `YOUR_API_KEY_HERE` with your actual API key from `.env.local`. Look for `"place_id"` in the response.

### Step 4: Update .env.local

Once you have the correct Place ID, update `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJYourCorrectPlaceIdHere
```

### Step 5: Restart the Dev Server

```bash
# Kill current server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

## Testing

Once you've enabled the API, test it:

1. Open: http://localhost:3000
2. Scroll to the testimonials section
3. You should see your 5-star Google reviews!

Or test the API directly:
```bash
curl "http://localhost:3000/api/google-reviews?minRating=5"
```

## Common Errors

### "REQUEST_DENIED"
- **Cause**: Places API not enabled
- **Fix**: Enable Places API in Google Cloud Console (see Step 1 above)

### "INVALID_REQUEST"
- **Cause**: Wrong Place ID
- **Fix**: Use Google's Place ID Finder tool to get the correct ID

### "Configuration Required" (Yellow Box)
- **Cause**: API key not set or invalid
- **Fix**: Check `.env.local` has the correct API key

### No Reviews Showing
- **Cause**: Your business might not have 5-star reviews yet
- **Fix**: Change `minRating=5` to `minRating=4` in the code

## Need More Help?

See the full setup guide: [docs/GOOGLE_REVIEWS_SETUP.md](docs/GOOGLE_REVIEWS_SETUP.md)
