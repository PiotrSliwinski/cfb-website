# Admin Panel User Guide

## Accessing the Admin Panel

The admin panel is available at: `http://localhost:3000/admin` (development) or `https://yourdomain.com/admin` (production)

### Login Credentials
- **Email**: Set in environment variables
- **Password**: Set during initial setup

---

## Dashboard Overview

After logging in, you'll see the main dashboard with:
- Quick stats (total treatments, team members, pending submissions)
- Recent activity
- Quick action buttons

---

## Managing Treatments

### Viewing All Treatments
1. Click **Treatments** in the sidebar
2. See list of all dental treatments
3. Use search bar to find specific treatments
4. Click **Edit** to modify or **Delete** to remove

### Adding a New Treatment
1. Go to Treatments → **Add New**
2. Fill in required fields:
   - **Slug**: URL-friendly name (e.g., `implantes-dentarios`)
   - **Display Order**: Number for sorting (0 = first)
   - **Icon**: Upload SVG icon (optional)
   - **Hero Image**: Upload banner image
   - **Status**: Draft or Published

3. **Portuguese Content** (required):
   - Title
   - Subtitle
   - Description (rich text)
   - Benefits (JSON array)
   - Process Steps (JSON array)

4. **English Content** (required):
   - Same fields as Portuguese

5. Click **Save Draft** or **Publish**

### Editing a Treatment
1. Find treatment in list
2. Click **Edit**
3. Modify content in either language
4. Click **Update**

### Adding FAQs to Treatment
1. Edit the treatment
2. Scroll to **FAQs Section**
3. Click **Add FAQ**
4. Enter question and answer (PT + EN)
5. Save

---

## Managing Team Members

### Adding a Team Member
1. Go to **Team** → **Add New**
2. Fill in details:
   - **Name**: Full name
   - **Slug**: URL-friendly (e.g., `dr-joao-silva`)
   - **Photo**: Upload profile picture
   - **Email & Phone**: Contact details
   - **Portuguese**:
     - Title (e.g., "Médico Dentista")
     - Specialty
     - Biography
     - Credentials
   - **English**: Same fields translated

3. **Specialties**: Select treatments they specialize in
4. **Display Order**: Set position in team list
5. Click **Publish**

---

## Site Settings

### Contact Information
1. Go to **Settings** → **Contact**
2. Update:
   - Phone number
   - Email address
   - Physical address
   - Business hours (PT + EN)
   - Google Maps coordinates

### Payment Methods
1. Go to **Settings** → **Payments**
2. Enable/disable payment options:
   - Cash
   - Debit/Credit Cards
   - MB WAY
   - Bank Transfer
3. Add descriptions (PT + EN)

### Insurance Providers
1. Go to **Settings** → **Insurance**
2. Add accepted insurance companies
3. Upload logos
4. Set display order

### Social Media Links
1. Go to **Settings** → **Social Media**
2. Add links to:
   - Facebook
   - Instagram
   - LinkedIn
   - YouTube
3. Toggle visibility

---

## Media Library

### Uploading Images
1. Go to **Media** → **Upload**
2. Drag & drop images or click to browse
3. Supported formats: JPG, PNG, WebP, SVG
4. Images are automatically optimized

### Organizing Media
- Images are stored by type:
  - `/treatment-images/` - Treatment photos
  - `/treatment-icons/` - Service icons
  - `/team-photos/` - Staff pictures
  - `/media/` - General uploads

### Using Images
- Copy image URL from media library
- Paste into content editor
- Or select from file picker in forms

---

## Contact Form Submissions

### Viewing Submissions
1. Go to **Submissions**
2. See all contact form entries
3. Filter by:
   - Status (New, Read, Replied)
   - Date range
   - Treatment interest

### Responding to Inquiries
1. Click on submission
2. View full message details
3. Mark as **Read** or **Replied**
4. Respond via email client (click email link)

---

## Best Practices

### SEO Optimization
- **Titles**: Keep under 60 characters
- **Descriptions**: 150-160 characters optimal
- **Alt Text**: Always add for images
- **Keywords**: Use naturally in content

### Content Guidelines
- **Write clearly**: Avoid medical jargon when possible
- **Be bilingual**: Always provide PT + EN versions
- **Use images**: Visual content improves engagement
- **Update regularly**: Keep information current

### Image Guidelines
- **File size**: Under 2MB per image
- **Dimensions**:
  - Hero images: 1920x1080px
  - Team photos: 800x800px (square)
  - Icons: 512x512px SVG
- **Format**: WebP preferred, JPG/PNG acceptable

---

## Troubleshooting

### Can't Login
- Check email/password spelling
- Clear browser cache
- Contact system administrator

### Images Not Uploading
- Check file size (< 2MB)
- Verify file format (JPG, PNG, WebP, SVG)
- Check internet connection

### Content Not Saving
- Ensure all required fields filled
- Check for error messages
- Refresh page and try again

### Changes Not Visible on Website
- Click **Publish** (not just Save Draft)
- Clear website cache
- Wait 1-2 minutes for changes to propagate

---

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save draft
- `Ctrl/Cmd + Enter` - Publish
- `Ctrl/Cmd + K` - Search
- `Esc` - Close modal/dialog

---

## Support

For technical issues or questions:
- **Email**: admin@clinicaferreiraborges.pt
- **Documentation**: [Technical docs](/docs)
- **Developer**: Contact your web developer

---

*Last updated: October 14, 2025*
