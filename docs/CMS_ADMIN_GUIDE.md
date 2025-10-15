# 🎨 Clínica FB CMS - Admin Guide

## Overview

The Clínica Ferreira Borges CMS is a Strapi-inspired headless content management system built with Next.js, Supabase, and TypeScript. It provides a modern, intuitive interface for managing treatments and other content in multiple languages.

---

## 🚀 Accessing the Admin Panel

**URL**: `http://localhost:3000/pt/admin` (or `/en/admin`)

**Features**:
- Strapi-like dark sidebar navigation
- Collection-based content management
- Multi-language support (Portuguese & English)
- Real-time updates
- Full CRUD operations

---

## 📋 Main Features

### 1. **Sidebar Navigation**

#### Collections
- **Treatments** - Manage dental treatment content
  - Shows total count badge
  - Full multilingual support

#### General
- **Settings** - Application configuration

### 2. **Treatments Collection**

#### List View
- **Search bar** - Filter treatments by title or slug
- **Create new entry** - Add new treatments
- **Data table** with columns:
  - ID (display order)
  - Title (Portuguese)
  - Slug
  - Status (Published/Draft)
  - Order
  - Actions

#### Quick Actions (per row)
- ✏️ **Edit** - Open full editor
- 👁️ **Publish/Unpublish** - Toggle visibility
- ⭐ **Feature/Unfeature** - Mark as featured
- 🗑️ **Delete** - Remove treatment (with confirmation)

---

## ✍️ Treatment Editor

### Multi-Language Tabs

The editor supports **2 languages**:
- 🇵🇹 **Portuguese** (default)
- 🇬🇧 **English**

Switch between languages using tabs at the top.

### Basic Settings

#### Fields:
1. **Slug** - URL-friendly identifier (e.g., `implantes-dentarios`)
   - Must be unique
   - Used in URL: `/tratamentos/{slug}`

2. **Display Order** - Numeric ordering for list display
   - Lower numbers appear first

3. **Icon** - Lucide icon name (e.g., `activity`, `smile`, `sparkles`)
   - Used in treatment cards

4. **Published** ✅ - Makes treatment visible on website

5. **Featured** ⭐ - Marks treatment as featured

6. **Hero Image** - Main image for treatment page
   - Max size: 10MB
   - Formats: PNG, JPEG, WebP
   - Upload/preview/delete functionality

### Translation Fields

For **each language**, edit:

1. **Title** - Main treatment name
   - Example: "Implantes Dentários"

2. **Subtitle** - Short tagline
   - Example: "Renove Seu Sorriso"

3. **Description** - Detailed text description
   - Multiline textarea
   - Supports full description

### Benefits Editor

**Add/Edit/Remove Benefits**

Each benefit has:
- **Title** - Short benefit name
- **Description** - Benefit explanation

**Features**:
- ➕ Add new benefit
- 🗑️ Remove benefit
- Drag handle for reordering (visual only)

**Example**:
```json
{
  "title": "Solução Permanente",
  "description": "Implantes duram a vida toda"
}
```

### Process Steps Editor

**Add/Edit/Remove Steps**

Each step has:
- **Step number** - Auto-numbered (1, 2, 3...)
- **Title** - Step name
- **Description** - What happens in this step

**Features**:
- ➕ Add new step
- 🗑️ Remove step
- Step numbers shown in circle badge

**Example**:
```json
{
  "step": 1,
  "title": "Consulta Inicial",
  "description": "Avaliação completa..."
}
```

---

## 🔧 How to Use

### Create New Treatment

1. Click **"Create new entry"** button
2. Fill in basic settings:
   - Enter slug (lowercase, hyphens, no spaces)
   - Set display order
   - Choose icon name
   - Check Published/Featured as needed
3. Switch to **Portuguese tab**:
   - Enter title, subtitle, description
   - Add 4 benefits
   - Add 4 process steps
4. Switch to **English tab**:
   - Enter English translations
   - Add English benefits
   - Add English process steps
5. **Upload hero image** (optional)
6. Click **"Save Treatment"**

### Edit Existing Treatment

1. Click ✏️ **Edit** icon in table row
2. Modify any fields
3. Switch languages to update translations
4. Add/remove benefits or steps
5. Click **"Save Treatment"**

### Publish/Unpublish

**Quick method**:
- Click 👁️ icon in table row
- Toggles published status instantly

**In editor**:
- Check/uncheck "Published" checkbox
- Save treatment

### Feature Treatment

**Quick method**:
- Click ⭐ icon in table row
- Toggles featured status instantly

**In editor**:
- Check/uncheck "Featured" checkbox
- Save treatment

### Delete Treatment

1. Click 🗑️ **Delete** icon
2. Confirm deletion in popup
3. Treatment and all translations deleted permanently
   - ⚠️ **No undo!**

---

## 🎯 Best Practices

### Slugs
- ✅ Use lowercase
- ✅ Use hyphens for spaces: `implantes-dentarios`
- ✅ Keep short and descriptive
- ❌ Avoid special characters
- ❌ Don't change after publishing (breaks URLs)

### Display Order
- Use increments of 10: 10, 20, 30...
  - Allows inserting between items later
- Featured treatments can have any order

### Content Guidelines

#### Titles
- Keep under 50 characters
- Clear and specific

#### Subtitles
- 5-10 words
- Engaging tagline

#### Descriptions
- 2-3 sentences
- Focus on patient benefits

#### Benefits
- **4 benefits** per treatment
- Title: 2-4 words
- Description: 1 sentence

#### Process Steps
- **4 steps** typically
- Title: 2-4 words
- Description: 1 sentence
- Order matters!

---

## 🌐 Multi-Language Workflow

### Recommended Process:

1. **Create in Portuguese first** (primary language)
   - Complete all fields
   - Add benefits and steps

2. **Switch to English tab**
   - Translate all text
   - Adapt for English audience
   - Keep same structure (same number of benefits/steps)

3. **Review both languages**
   - Switch tabs to verify
   - Ensure consistency

4. **Save once** - saves both languages

---

## 🔍 Search & Filter

### Search Box
- Searches across:
  - Treatment slugs
  - Portuguese titles
  - English titles
- Real-time filtering
- Clear search to see all

### Empty States
- **No results found** - Adjust search
- **No treatments** - Create first treatment

---

## 💾 Data Structure

### How Data is Stored

#### Treatments Table
```sql
{
  id: UUID
  slug: string
  icon_url: string
  hero_image_url: string
  display_order: number
  is_featured: boolean
  is_published: boolean
}
```

#### Treatment Translations Table
```sql
{
  id: UUID
  treatment_id: UUID (FK)
  language_code: 'pt' | 'en'
  title: string
  subtitle: string
  description: string
  benefits: JSONB[]
  process_steps: JSONB[]
}
```

**Each treatment has**:
- 1 treatment record
- 2 translation records (PT + EN)

---

## 🚨 Troubleshooting

### Editor Won't Save
- Check all required fields filled
- Verify slug is unique
- Check console for errors

### Image Upload Fails
- File must be < 10MB
- Only PNG, JPEG, WebP allowed
- Check browser console

### Changes Not Visible
- Ensure treatment is **Published**
- Check display_order value
- Clear browser cache

### Translation Missing
- Both PT and EN must be filled
- Switch tabs to verify
- Check for empty fields

---

## 📊 Keyboard Shortcuts

*(Future feature)*
- `Ctrl/Cmd + S` - Save
- `Ctrl/Cmd + E` - Edit mode
- `Esc` - Close editor

---

## 🔐 Security Notes

### Current State (Development)
- ❌ No authentication yet
- ⚠️ Anyone can access admin panel

### Production Requirements
- ✅ Add authentication (Supabase Auth)
- ✅ Implement role-based access
- ✅ Restrict by user roles
- ✅ Add audit logging

---

## 📈 Future Enhancements

### Planned Features:
1. **FAQ Management**
   - Add FAQs in editor
   - Per-treatment FAQs

2. **Media Library**
   - Browse all uploaded images
   - Reuse images across treatments

3. **Bulk Operations**
   - Publish multiple treatments
   - Bulk delete
   - Duplicate treatment

4. **Version History**
   - Track changes
   - Rollback to previous version

5. **Rich Text Editor**
   - Formatted descriptions
   - Bold, italic, lists
   - Embedded media

6. **SEO Fields**
   - Meta descriptions
   - Keywords
   - Open Graph images

7. **Preview Mode**
   - Preview before publishing
   - Draft changes

---

## 🎨 UI Components

### Based on Strapi Design:
- Dark sidebar navigation
- Light content area
- Table-based collection view
- Modal-based editor
- Responsive design

### Colors:
- **Primary**: Blue (#4F46E5)
- **Sidebar**: Dark gray (#111827)
- **Success**: Green (published)
- **Warning**: Yellow (featured)
- **Danger**: Red (delete)

---

## 📝 Quick Reference

### Common Tasks

#### 1. Add New Treatment
```
Admin → Create new entry → Fill fields → Save
```

#### 2. Edit Translation
```
Admin → Edit (row) → Switch language tab → Modify → Save
```

#### 3. Upload Image
```
Admin → Edit → Hero Image → Upload → Select file → Auto-saves URL
```

#### 4. Reorder Treatments
```
Admin → Edit → Change display_order → Save
```

#### 5. Mark Featured
```
Admin → Click star icon (⭐)
```

---

## 📧 Support

### Getting Help:
- Check this guide first
- Review error messages in console
- Check browser Network tab
- Verify Supabase connection

### Common Errors:
1. **"Slug already exists"** → Use unique slug
2. **"Upload failed"** → Check file size/type
3. **"Save error"** → Check required fields
4. **"Cannot read property"** → Refresh page

---

## 🔗 Related Documentation

- [Phase 3 Complete](PHASE_3_COMPLETE.md) - Full implementation details
- [Quick Start Guide](QUICK_START_PHASE3.md) - Setup instructions
- [Component Summary](PHASE_3_COMPONENTS_SUMMARY.md) - Technical details

---

## ✅ Checklist for New Treatment

- [ ] Create treatment entry
- [ ] Enter unique slug
- [ ] Set display order
- [ ] Choose appropriate icon
- [ ] Add Portuguese title/subtitle/description
- [ ] Add 4 Portuguese benefits
- [ ] Add 4 Portuguese process steps
- [ ] Switch to English tab
- [ ] Add English translations
- [ ] Add 4 English benefits
- [ ] Add 4 English process steps
- [ ] Upload hero image (optional)
- [ ] Check "Published" if ready
- [ ] Save treatment
- [ ] Verify on frontend: `/pt/tratamentos/{slug}`
- [ ] Verify in English: `/en/tratamentos/{slug}`

---

*Last Updated: October 6, 2025*
*CMS Version: 1.0 (Strapi-inspired)*
