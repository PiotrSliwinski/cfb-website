# Quick Start - Next Session

## ⚡ Fast Startup (2 minutes)

```bash
cd /Users/piotr/Source\ Code/Github/cfb-website

# 1. Start Supabase (if not running)
npx supabase start

# 2. Start Next.js
npm run dev
```

**Access URLs:**
- Admin Panel: http://localhost:3000/admin
- Supabase Studio: http://127.0.0.1:54323
- Website: http://localhost:3000

---

## 🎯 Priority Tasks (in order)

### 1. Fix TypeScript Build (15 min)
The site works but build fails due to translation syntax.

**File**: `src/app/[locale]/tratamentos/[slug]/page.tsx`

**Find & Replace Pattern**:
```typescript
// WRONG (causes build error):
{t('some.key', 'fallback text')}

// CORRECT:
{t('some.key') || 'fallback text'}
```

**Quick fix**:
```bash
# Use sed or manually fix remaining ~5-10 instances
cd /Users/piotr/Source\ Code/Github/cfb-website
npm run build  # Should succeed after fixes
```

---

### 2. Create Admin User (5 min)

1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to **SQL Editor**
3. Run:
```sql
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@clinicaferreiraborges.pt',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

**Credentials**:
- Email: `admin@clinicaferreiraborges.pt`
- Password: `Admin123!` (change this!)

---

### 3. Test Admin Panel (5 min)

1. Go to: http://localhost:3000/admin
2. Should redirect to login
3. Enter credentials
4. Should see dashboard with:
   - 15 treatments
   - 9 team members
   - 25 FAQs
5. Click **Treatments** → See list of all treatments
6. Click **Edit** on any treatment → (form not built yet)

---

### 4. Build Treatment Editor (2-3 hours)

**File to create**: `src/app/admin/treatments/[id]/page.tsx`

**Features needed**:
- Load treatment data by ID
- PT/EN tabs for translations
- Form fields:
  - Slug (text input)
  - Display Order (number)
  - Is Published (checkbox)
  - Is Featured (checkbox)
  - Icon URL (text/upload)
  - Hero Image URL (text/upload)
  - **For each language (PT/EN)**:
    - Title (text)
    - Subtitle (text)
    - Description (rich text editor)
    - Benefits (JSONB array editor)
    - Process Steps (JSONB array editor)
- Save button (Server Action)
- Delete button (with confirmation)

**Dependencies to install**:
```bash
npm install react-hook-form zod @hookform/resolvers
npm install @tiptap/react @tiptap/starter-kit  # Rich text editor
```

**Example structure**:
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
// ... imports

export default function TreatmentEditPage({ params }) {
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  const form = useForm()

  // Form submission via Server Action
  async function onSubmit(data) {
    // Call server action to update treatment
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Language tabs */}
      {/* Form fields */}
      {/* Save button */}
    </form>
  )
}
```

---

### 5. Build Team Editor (1-2 hours)

**File to create**: `src/app/admin/team/[id]/page.tsx`

Similar to treatment editor but simpler:
- Photo upload
- Name, email, phone
- PT/EN: title, specialty, bio, credentials
- Specialties multi-select (link to treatments)

---

## 📊 Current Status

**Database**: ✅ Ready (30+ tables, data populated)
**Admin Auth**: ✅ Working (needs user created)
**Admin Dashboard**: ✅ Complete
**Admin Lists**: ✅ Complete (treatments, team, faqs)
**Admin Editors**: ❌ Not built yet ← **YOU ARE HERE**

---

## 📚 Reference Files

- **[TRANSITION-PLAN.md](TRANSITION-PLAN.md)** - Full roadmap
- **[SESSION-SUMMARY.md](SESSION-SUMMARY.md)** - What we accomplished today
- **[PROGRESS-UPDATE.md](PROGRESS-UPDATE.md)** - Detailed progress
- **[ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)** - User guide (for end-users)

---

## 🐛 Known Issues

1. **Build fails** - TypeScript errors in tratamentos page (~5-10 fixes needed)
2. **No admin user** - Need to create via SQL (5 min task)
3. **Editors missing** - Main blocking issue for Phase 4

---

## 💡 Tips

- Use Server Actions for form submissions (simpler than API routes)
- Keep forms client components (`'use client'`)
- Use Server Components for data fetching
- Tailwind CSS classes already available
- shadcn/ui components can be added as needed

---

## ⏱️ Time Estimates

- Fix TypeScript: 15 minutes
- Create admin user: 5 minutes
- Treatment editor: 2-3 hours
- Team editor: 1-2 hours
- Settings pages: 1-2 hours
- **Total to Phase 4 complete**: ~6-8 hours

---

## 🚀 After Admin CRUD Complete

1. **Remove Strapi**: Delete directories, update docs
2. **SEO Optimization**: Verify SSR, add JSON-LD
3. **Testing**: Full functionality, Lighthouse, cross-browser
4. **Deploy**: Vercel or similar

**Estimated time to production**: 2-3 more days

---

*Ready to code! Good luck! 🎉*
