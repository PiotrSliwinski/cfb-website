# Drag and Drop Sorting - Implementation Guide

## Overview

I've added the foundation for drag-and-drop sorting to the admin panel. The implementation uses `@dnd-kit` library for accessible, performant drag-and-drop functionality.

## What's Been Implemented ✅

### 1. **Installed Dependencies**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. **Server Actions Created**
- `updateTreatmentsOrder()` in [src/app/actions/treatments.ts](../src/app/actions/treatments.ts)
- `updateTeamMembersOrder()` in [src/app/actions/team.ts](../src/app/actions/team.ts)

Both functions accept an array of `{id, display_order}` pairs and update the database.

### 3. **Sortable Component**
Created [src/components/admin/SortableTableRow.tsx](../src/components/admin/SortableTableRow.tsx)
- Wraps table rows to make them draggable
- Shows grip handle icon
- Handles drag state styling

### 4. **Drag Handlers Added**
Added to [src/app/[locale]/admin/page.tsx](../src/app/[locale]/admin/page.tsx):
- `handleDragEndTreatments()` - Reorders treatments and saves to DB
- `handleDragEndTeamMembers()` - Reorders team members and saves to DB
- Optimistic UI updates for instant feedback

## What Needs to Be Done

### Update the Table Markup

You need to wrap the table bodies with DndContext and SortableContext, and use SortableTableRow for each row.

#### For Treatments Table (around line 420-450):

**Current structure:**
```tsx
<table>
  <thead>...</thead>
  <tbody>
    {filteredTreatments.map((treatment) => (
      <tr key={treatment.id}>
        <td>...</td>
        ...
      </tr>
    ))}
  </tbody>
</table>
```

**New structure:**
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEndTreatments}
>
  <table>
    <thead>
      <tr>
        <th className="w-12">Sort</th>  {/* Add new column */}
        <th>ID</th>
        <th>Title (PT)</th>
        ...
      </tr>
    </thead>
    <SortableContext
      items={filteredTreatments.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <tbody>
        {filteredTreatments.map((treatment) => {
          const ptTranslation = treatment.treatment_translations?.find(
            (t: any) => t.language_code === 'pt'
          );
          return (
            <SortableTableRow key={treatment.id} id={treatment.id}>
              {/* All your existing table cells go here */}
              <td>#{treatment.display_order}</td>
              <td>{ptTranslation?.title || 'Untitled'}</td>
              ...
            </SortableTableRow>
          );
        })}
      </tbody>
    </SortableContext>
  </table>
</DndContext>
```

#### For Team Members Table (around line 580-620):

Same pattern - wrap with DndContext, use SortableContext on tbody, and SortableTableRow for each row.

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEndTeamMembers}
>
  <table>
    <thead>
      <tr>
        <th className="w-12">Sort</th>  {/* Add new column */}
        <th>Photo</th>
        <th>Name (PT)</th>
        ...
      </tr>
    </thead>
    <SortableContext
      items={filteredTeamMembers.map((m) => m.id)}
      strategy={verticalListSortingStrategy}
    >
      <tbody>
        {filteredTeamMembers.map((member) => {
          const ptTranslation = member.team_member_translations?.find(
            (t: any) => t.language_code === 'pt'
          );
          return (
            <SortableTableRow key={member.id} id={member.id}>
              {/* All your existing table cells */}
              <td>...</td>
              ...
            </SortableTableRow>
          );
        })}
      </tbody>
    </SortableContext>
  </table>
</DndContext>
```

## How It Works

1. **Grip Handle**: Each row gets a draggable grip icon (⋮⋮) in the first column
2. **Drag to Reorder**: Click and drag the grip to reorder rows
3. **Optimistic UI**: The list updates immediately as you drag
4. **Auto-Save**: When you drop, the new order is saved to the database
5. **Persistent**: The display_order column in the database is updated
6. **Website Reflects**: The frontend automatically shows items in the saved order

## Features

✅ **Accessible**: Keyboard navigation support
✅ **Smooth Animations**: CSS transitions for visual feedback
✅ **Optimistic Updates**: Instant UI updates
✅ **Auto-Save**: No save button needed
✅ **Error Handling**: Reverts on failure
✅ **Visual Feedback**: Dimmed item while dragging

## Testing

Once implemented, test by:

1. Go to `http://localhost:3000/admin`
2. Click on "Treatments" or "Team Members"
3. Look for the grip icon (⋮⋮) in the first column
4. Click and drag a row up or down
5. Release to drop in new position
6. Refresh the page - order should persist

## Keyboard Support

- **Tab**: Focus on grip handle
- **Space/Enter**: Activate drag
- **Arrow Keys**: Move item up/down
- **Escape**: Cancel drag

## Troubleshooting

### Dragging doesn't work
- Check that `sensors` are defined
- Verify DndContext wraps the table
- Ensure SortableContext has correct items array

### Order doesn't save
- Check browser console for errors
- Verify server actions are imported correctly
- Check database has display_order column

### Items jump back after drag
- This means the server action failed
- Check the error in console
- Verify database permissions

## Next Steps

1. Update the table markup as shown above
2. Add the "Sort" column header
3. Test drag-and-drop functionality
4. Verify order persists after page reload

## Example Complete Implementation

See the treatments table example:

```tsx
{activeTab === 'treatments' && (
  <div>
    {/* ... header section ... */}

    <div className="p-8">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndTreatments}
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-6 py-3 text-left ...">ID</th>
                  <th className="px-6 py-3 text-left ...">Title (PT)</th>
                  {/* ... other headers ... */}
                </tr>
              </thead>
              <SortableContext
                items={filteredTreatments.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-200">
                  {filteredTreatments.map((treatment) => (
                    <SortableTableRow key={treatment.id} id={treatment.id}>
                      <td className="px-6 py-4 ...">#{treatment.display_order}</td>
                      <td className="px-6 py-4 ...">{/* title */}</td>
                      {/* ... rest of the cells ... */}
                    </SortableTableRow>
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      )}
    </div>
  </div>
)}
```

## Reference

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Sortable Examples](https://docs.dndkit.com/presets/sortable)
