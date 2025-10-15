# Team Member Specialties Setup

## Overview
This feature links team member specialties to treatment pages, allowing doctors to have their specialties displayed as clickable links to the corresponding treatment pages.

## Database Migration Required

**IMPORTANT:** You need to apply the migration to create the `team_member_specialties` table in Supabase.

### Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of: `supabase/migrations/20251006120000_add_team_member_specialties.sql`
4. Click "Run" to execute the migration

### Option 2: Apply via Supabase CLI

```bash
# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
npx supabase db push
```

### Migration SQL

The migration creates:
- `team_member_specialties` junction table
- Relationships between team members and treatments
- Proper indexes for performance

```sql
CREATE TABLE team_member_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_member_id, treatment_id)
);
```

## Features Implemented

### 1. Admin Interface
- **Team Member Editor** now includes a treatment selector
- Select multiple treatments as specialties using checkboxes
- Treatments are loaded dynamically from the database
- Shows count of selected treatments

### 2. Team Page Display
- Specialties displayed as **clickable badges** on team member cards
- Each badge links to the corresponding treatment page
- Format: `/[locale]/tratamentos/[treatment-slug]`
- Falls back to text specialty if no treatments selected

### 3. Data Structure
- Team members can have multiple specialties
- Specialties are ordered by `display_order`
- Maintains backwards compatibility with text-based specialty field

## How to Use

### In Admin Panel (`/en/admin`)

1. Click on "Team Members" tab
2. Edit or create a team member
3. Scroll to "Specialties (Select Treatments)" section
4. Check the treatments that this team member specializes in
5. Save

### Frontend Display

Visit the team page (`/en/equipa` or `/pt/equipa`) and you'll see:

```
Dr. John Doe
Dentista
OMD Nº 12345

Especialidades:
[Ortodontia] [Aparelho Invisível] [Dentisteria Estética]
```

Each specialty badge is clickable and navigates to the treatment page.

## Code Changes

### Files Modified:
1. `src/components/admin/TeamMemberEditor.tsx` - Added treatment selection UI
2. `src/app/[locale]/admin/page.tsx` - Updated CRUD operations to save specialties
3. `src/lib/supabase/queries/team.ts` - Updated query to fetch linked treatments
4. `src/app/[locale]/equipa/page.tsx` - Display specialties as clickable links

### Files Created:
1. `supabase/migrations/20251006120000_add_team_member_specialties.sql` - Database migration

## Troubleshooting

If you see an error about `team_member_specialties` not found:
1. Apply the database migration (see above)
2. Restart the development server: `npm run dev`

## Example

A team member with specialties in "Ortodontia" and "Aparelho Invisível" will display:

```html
<div class="flex flex-wrap gap-2">
  <a href="/pt/tratamentos/ortodontia" class="badge">Ortodontia</a>
  <a href="/pt/tratamentos/aparelho-invisivel" class="badge">Aparelho Invisível</a>
</div>
```
