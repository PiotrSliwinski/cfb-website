# Quick Start: Phase 3 Testing Guide

## 🚀 Getting Started

### 1. Start Supabase and Apply Migrations

```bash
# Make sure Docker is running first
npx supabase start

# Apply all new migrations (this will reset the database)
npx supabase db reset
```

Expected output:
- Supabase started on http://127.0.0.1:54321
- Database reset complete
- 9 migration files applied
- Sample data seeded

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Testing Checklist

### ✅ Treatment Pages
Visit each treatment to verify complete content:

1. **Implantes Dentários**
   - URL: http://localhost:3000/pt/tratamentos/implantes-dentarios
   - ✓ Hero section with title/subtitle
   - ✓ 4 benefits displayed
   - ✓ 4 process steps with numbers
   - ✓ 4 FAQs with accordion
   - ✓ CTA section

2. **Aparelho Invisível**
   - URL: http://localhost:3000/pt/tratamentos/aparelho-invisivel
   - ✓ Complete content
   - ✓ Benefits & process steps
   - ✓ FAQs

3. **Branqueamento**
   - URL: http://localhost:3000/pt/tratamentos/branqueamento
   - ✓ Complete content
   - ✓ Benefits & process steps
   - ✓ FAQs

4. **Ortodontia**
   - URL: http://localhost:3000/pt/tratamentos/ortodontia
   - ✓ Complete content
   - ✓ Benefits & process steps
   - ✓ FAQs

5. **Limpeza Dentária**
   - URL: http://localhost:3000/pt/tratamentos/limpeza-dentaria
   - ✓ Complete content
   - ✓ Benefits & process steps
   - ✓ FAQs

### ✅ English Versions
Test English translations:
- http://localhost:3000/en/tratamentos/implantes-dentarios
- http://localhost:3000/en/tratamentos/aparelho-invisivel
- (etc.)

### ✅ Admin Panel
1. **Access Admin Panel**
   - URL: http://localhost:3000/pt/admin
   - ✓ Page loads successfully
   - ✓ Shows all 5 treatments
   - ✓ Displays treatment info

2. **Image Upload** (requires authentication in production)
   - ✓ Upload button visible
   - ✓ Can select image file
   - ✓ Preview shows uploaded image
   - ✓ Image URL saved to database
   - ✓ Delete button works

---

## 🗄️ Database Verification

### Check Supabase Studio
Open: http://127.0.0.1:54323

#### Verify Tables:
1. **treatments** - 5 rows
   - All have `is_published = true`
   - `icon_url` contains Lucide icon names
   - `hero_image_url` column exists (initially NULL)

2. **treatment_translations** - 10 rows (5 × 2 languages)
   - All have complete content
   - `benefits` JSONB contains 4 items
   - `process_steps` JSONB contains 4 items

3. **treatment_faqs** - 20 rows (4 per treatment)
   - Ordered by `display_order`

4. **treatment_faq_translations** - 40 rows (20 × 2 languages)
   - All have questions and answers

#### Verify Storage:
1. **Buckets** tab
   - `treatment-images` bucket exists
   - `treatment-icons` bucket exists

2. **Policies**
   - Public SELECT on both buckets
   - Authenticated INSERT/UPDATE/DELETE

---

## 🎨 What to Test

### 1. FAQ Accordion
- Click on any FAQ question
- ✓ Answer expands smoothly
- ✓ Arrow icon rotates
- ✓ Click again to collapse

### 2. Content Display
- ✓ Benefits show with checkmark icons
- ✓ Process steps show numbered circles
- ✓ All text is properly formatted
- ✓ No missing translations

### 3. Responsive Design
- Test on mobile (DevTools)
- ✓ Layout adapts properly
- ✓ Images resize correctly
- ✓ Admin panel is usable

### 4. Image Upload (Admin)
1. Click "Upload Image" in admin panel
2. Select a PNG/JPEG/WebP image (max 10MB)
3. ✓ Preview appears immediately
4. ✓ Upload completes
5. ✓ Image URL saved to database
6. ✓ Refresh page - image persists

---

## 🔍 Troubleshooting

### Issue: Supabase won't start
```bash
# Check if Docker is running
docker ps

# If Docker is down, start Docker Desktop
# Then try again:
npx supabase start
```

### Issue: Migrations fail
```bash
# Reset completely
npx supabase db reset

# If that fails, stop and start fresh
npx supabase stop
npx supabase start
npx supabase db reset
```

### Issue: Admin panel shows no treatments
- Check browser console for errors
- Verify migrations applied: `npx supabase migration list`
- Check Supabase Studio for data

### Issue: Image upload fails
- Check file size (max 10MB for images, 2MB for icons)
- Verify file type (PNG, JPEG, WebP only)
- Check browser console for error messages
- Verify storage buckets exist in Supabase Studio

---

## 📊 Expected Data

### Treatment Counts:
- **5 treatments** (implantes, aparelho, branqueamento, ortodontia, limpeza)
- **10 translations** (5 PT + 5 EN)
- **20 FAQs** (4 per treatment)
- **40 FAQ translations** (20 PT + 20 EN)

### Content Structure:
Each treatment has:
- ✅ Title (VARCHAR)
- ✅ Subtitle (TEXT)
- ✅ Description (TEXT)
- ✅ 4 Benefits (JSONB array)
- ✅ 4 Process Steps (JSONB array)
- ✅ 4 FAQs (related table)
- ✅ Icon reference (Lucide icon name)
- ✅ Hero image URL support (initially NULL)

---

## 🎯 Success Criteria

Phase 3 is working correctly if:

1. ✅ All 5 treatment pages load with complete content
2. ✅ FAQs expand/collapse on all treatment pages
3. ✅ Benefits and process steps display correctly
4. ✅ English translations work on all pages
5. ✅ Admin panel loads and shows all treatments
6. ✅ Image upload functionality works
7. ✅ Storage buckets are configured
8. ✅ All database migrations applied successfully

---

## 📝 Next Steps

After verifying Phase 3:
1. Add actual images to treatments via admin panel
2. Consider adding more treatments
3. Move to Phase 4: Analytics & SEO
4. Plan production deployment

---

## 🆘 Need Help?

1. Check [PHASE_3_COMPLETE.md](PHASE_3_COMPLETE.md) for detailed documentation
2. Review migration files in `/supabase/migrations/`
3. Check component code in `/src/components/admin/`
4. Verify queries in `/src/lib/supabase/queries/`

---

*Last Updated: October 6, 2025*
