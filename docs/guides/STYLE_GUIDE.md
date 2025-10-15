# Clínica Ferreira Borges - Design System & Style Guide

## Color Palette

### Primary Color
- **Brand Primary**: `#0098AA` - Used for all main headings, CTAs, and brand elements
- **Primary Hover**: Use Tailwind's `hover:bg-primary-700` for interactive elements

### Neutral Colors
- **Dark Text**: `#4E5865` - For card titles and emphasized text (replaces black)
- **Headings (Discrete)**: `text-gray-700` - For section headings
- **Body Text**: `text-gray-600` - For paragraphs and descriptions
- **Subtext**: `text-gray-500` - For labels and secondary information
- **Borders**: `border-gray-200` - For cards and dividers
- **Backgrounds**: `bg-gray-50` - For alternate sections

**IMPORTANT**: Never use pure black (`#000000` or `text-black`). Use `#4E5865` instead.

## Typography

### Fonts
- **Primary Font**: Poppins (all weights: 300-900)
- **Line Height**: 1.8 for paragraphs, 1.3 for headings

### Heading Hierarchy

#### 1. Page Title (Hero Headings)
```tsx
<h1 className="page-title">
  // OR
  <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0098AA' }}>
```
**Usage**: Main page title in hero sections
**Size**: `text-4xl md:text-5xl`
**Weight**: `font-bold`
**Color**: `#0098AA`

#### 2. Section Heading (Discrete)
```tsx
<h2 className="section-heading">
  // OR
  <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
```
**Usage**: Section titles within page content (most common)
**Size**: `text-2xl md:text-3xl`
**Weight**: `font-semibold`
**Color**: `text-gray-700`

#### 3. Section Heading (Accent) - WITH DECORATIVE DOTS
```tsx
<div className="text-center mb-12">
  <div className="inline-flex items-center gap-2 mb-4">
    <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      {locale === 'pt' ? 'Category Label' : 'Category Label'}
    </span>
    <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
  </div>
  <h2 className="section-heading-accent">
    Section Title
  </h2>
  <p className="text-base text-gray-600">
    Section description
  </p>
</div>
```
**Usage**: ALWAYS use this pattern for important section headings with decorative dots
**Size**: `text-2xl md:text-3xl`
**Weight**: `font-semibold`
**Color**: `#0098AA`
**Decoration**: Small accent dots with uppercase label above heading

**When to use accent headings with decorations:**
- ALL payment/pricing section headings
- ALL contact information headings
- ALL key content sections you want to draw attention to
- Main page sections

**IMPORTANT**: The decorative dots pattern should be the default for all section headings unless using discrete style

#### 4. Subsection Heading
```tsx
<h3 className="subsection-heading">
  // OR
  <h3 className="text-lg font-semibold text-gray-700 mb-4">
```
**Usage**: Terms & conditions sections, FAQ questions
**Size**: `text-lg`
**Weight**: `font-semibold`
**Color**: `text-gray-700`

#### 5. Card Title
```tsx
<h3 className="card-title">
  // OR
  <h3 className="text-lg font-bold mb-2" style={{ color: '#4E5865' }}>
```
**Usage**: Titles within cards (treatments, team members, etc.)
**Size**: `text-lg`
**Weight**: `font-bold`
**Color**: `#4E5865`

## Layout Components

### Hero Section
```tsx
<section className="hero-section">
  // OR
  <section className="bg-white border-b border-gray-200 py-20">
```

### Page Section
```tsx
<section className="page-section">
  // OR
  <section className="py-20 px-6">
```

### Accent Badge
```tsx
<div className="inline-flex items-center gap-2 mb-6">
  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
    Label
  </span>
  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
</div>
```
**Usage**: Small category labels above page titles

### Content Card
```tsx
<div className="content-card">
  // OR
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-200 transition-all">
```

### Icon Containers - STANDARDIZED

#### Primary Icon (Accent Background)
**Usage**: Main section icons, feature highlights, important elements
```tsx
<div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0098AA' }}>
  <Icon className="w-6 h-6 text-white" />
</div>
```
**Size**: `w-12 h-12` (48px)
**Shape**: `rounded-full` (circle)
**Background**: `#0098AA` (brand color)
**Icon Color**: `text-white`
**Icon Size**: `w-6 h-6` (24px)

#### Secondary Icon (Light Background)
**Usage**: Contact info, supporting elements, less prominent features
```tsx
<div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
  <Icon className="w-6 h-6 text-primary-600" />
</div>
```
**Size**: `w-12 h-12` (48px)
**Shape**: `rounded-full` (circle)
**Background**: `bg-gray-50`
**Border**: `border border-gray-200`
**Icon Color**: `text-primary-600`
**Icon Size**: `w-6 h-6` (24px)

#### Large Icon (Hero/Featured)
**Usage**: Large feature cards, hero sections
```tsx
<div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0098AA' }}>
  <Icon className="w-8 h-8 text-white" />
</div>
```
**Size**: `w-16 h-16` (64px)
**Icon Size**: `w-8 h-8` (32px)

**IMPORTANT RULES:**
- ALWAYS use circular icons (`rounded-full`)
- Primary actions/features = #0098AA background with white icon
- Secondary/supporting elements = gray-50 background with #0098AA icon
- Icons should be 50% of container size (12px in 24px, 24px in 48px, 32px in 64px)
- Never use square icons for features/sections

#### Using the Global Classes
```tsx
// Primary icon with class
<div className="icon-primary">
  <Icon className="w-6 h-6 text-white" />
</div>

// Secondary icon with class
<div className="icon-secondary">
  <Icon className="w-6 h-6 text-primary-600" />
</div>

// Large icon with class
<div className="icon-large">
  <Icon className="w-8 h-8 text-white" />
</div>
```

#### Example: Feature Card with Icon
```tsx
<div className="content-card">
  <div className="icon-primary mb-4">
    <CheckCircle className="w-6 h-6 text-white" />
  </div>
  <h3 className="card-title">Feature Title</h3>
  <p className="text-base text-gray-600">Feature description</p>
</div>
```

## Component Patterns

### Standard Page Structure
```tsx
<div className="flex flex-col bg-white min-h-screen">
  {/* Hero Section */}
  <section className="hero-section">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="accent-badge">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Category
          </span>
        </div>
        <h1 className="page-title">Page Title</h1>
        <p className="text-base text-gray-600">Subtitle</p>
      </div>
    </div>
  </section>

  {/* Content Section */}
  <section className="page-section bg-white">
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-heading">Section Title</h2>
        {/* Content */}
      </div>
    </div>
  </section>
</div>
```

### Treatment/Service Card
```tsx
<div className="content-card">
  <div className="icon-circle">
    <Icon className="w-6 h-6 text-primary-600" />
  </div>
  <h3 className="card-title">Title</h3>
  <p className="text-sm text-gray-600">Description</p>
</div>
```

## Spacing Standards

- **Section Padding**: `py-20` (vertical), `px-6` (horizontal)
- **Container Max Width**:
  - Content: `max-w-4xl` (centered text/forms)
  - Grid/Cards: `max-w-6xl` or `max-w-7xl`
- **Card Padding**: `p-6`
- **Gap Between Items**: `gap-6` or `gap-8`

## Interactive Elements & Hover States

### Hover Principles
**IMPORTANT**: All interactive elements must have smooth, minimalistic hover states.

**Minimalistic Hover Pattern**:
- Use `transition-colors` or `transition-all` for smooth animations
- Cards: Border color change ONLY (no shadow elevation)
- Icons: Change background color (no scaling)
- Buttons: Darken background color
- Links: Change color shade

### Card Hover (Feature/Certification Cards)
```tsx
<div className="group bg-white rounded-xl p-6 transition-all duration-300 border border-gray-200 hover:border-primary-400">
  <div className="icon-primary mb-4 group-hover:bg-primary-400 transition-colors duration-300">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <h3 className="card-title">Feature Title</h3>
  <p className="text-base text-gray-600">Description</p>
</div>
```

**Card Hover Effects (Minimalistic)**:
- `border-gray-200` → `hover:border-primary-400` (subtle accent border)
- Icon background brightens: `bg-primary-600` (#0098AA) → `group-hover:bg-primary-400` (even brighter shade)
- NO shadow elevation (keep minimalist)
- NO icon scaling (keep subtle)
- Use `group` class on parent, `group-hover:` on children

### Content Card Hover (Already in globals.css)
```tsx
<div className="content-card">
  {/* hover:border-primary-400 is built-in */}
</div>
```
**Note**: Update globals.css to use `hover:border-primary-400` instead of `hover:border-primary-200`

### Primary Button
```tsx
<button className="bg-primary-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors">
  Button Text
</button>
```
**Hover**: Brightens from `#0098AA` (primary-600) to lighter `primary-400`
**Important**: NO scale or transform effects - keep minimalistic

### Secondary Button
```tsx
<button className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors border-2 border-primary-600">
  Button Text
</button>
```
**Hover**: Background changes to light `primary-50`
**Important**: NO scale or transform effects

### Link Hover
```tsx
<a className="text-primary-600 hover:text-primary-700 transition-colors">
  Link Text
</a>
```

### Icon Hover (in cards/features)
```tsx
<div className="group">
  <div className="icon-primary group-hover:bg-primary-400 transition-colors duration-300">
    <Icon className="w-6 h-6 text-white" />
  </div>
</div>
```

**Minimalistic Hover State Checklist**:
- [ ] All cards have border color change on hover (gray-200 → primary-400)
- [ ] NO shadow elevation (removed for minimalism)
- [ ] All icons brighten background color on hover (primary-600 → primary-400 for vibrant effect)
- [ ] NO icon scaling (removed for minimalism)
- [ ] All transitions use `duration-300` for consistency
- [ ] Use `group` pattern for parent-child hover effects
- [ ] All interactive elements have `transition-all` or `transition-colors`

## Common Mistakes to Avoid

❌ **Don't use**: Heavy gradients, shadows, or decorative elements
❌ **Don't use**: `text-primary-600` for headings (use `#0098AA` or `text-gray-700`)
❌ **Don't use**: Bold headings in content sections (use semibold)
❌ **Don't use**: Different heading sizes across similar pages

✅ **Do use**: Subtle borders (`border-gray-200`)
✅ **Do use**: Consistent spacing (`py-20`, `px-6`)
✅ **Do use**: Strategic accent dots for labels
✅ **Do use**: Minimalistic hover states

## Page-Specific Guidelines

### Home Page
- Video background in hero
- White/light gray alternating sections
- Strategic use of accent dots

### Treatment Pages
- Two-column hero with image
- Benefits in 3-column grid
- Process steps with numbered badges
- FAQ with accordion style

### Team Page
- 3-column grid for team members
- Photo at top of each card
- Specialty tags with subtle styling

### Contact Page
- Two-column layout (info + form)
- Icon circles for contact methods
- Embedded map with rounded corners

### Terms & Payments
- Single column max-w-4xl
- Discrete subsection headings
- Regulatory info box at bottom

## Implementation Checklist

When creating/updating a page:
- [ ] Hero uses `page-title` class or equivalent
- [ ] Section headings use `section-heading` class
- [ ] Accent badges have dots on both sides
- [ ] Cards use `border-gray-200` with subtle hover
- [ ] Spacing is consistent (`py-20`, `px-6`)
- [ ] Text colors follow hierarchy (#4E5865 > gray-700 > gray-600 > gray-500)
- [ ] No black (#000000) colors used anywhere
- [ ] Interactive elements have smooth transitions
- [ ] Bilingual content (PT/EN) properly implemented
