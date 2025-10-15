# Strapi Development Rules

## ⚠️ CRITICAL: Database Access

**NEVER use direct database access with Strapi**

- ❌ Do NOT use SQL queries directly on Strapi database
- ❌ Do NOT use psql or any database client to modify Strapi data
- ❌ Do NOT bypass Strapi's ORM or Document Service

### Why?

Direct database access can:
- **Violate product integrity**
- Break Strapi's internal state management
- Corrupt relations and links
- Bypass validation and lifecycle hooks
- Create inconsistent data that Strapi cannot manage

### Always Use:

1. **Strapi APIs**
   - REST API (`/api/...`)
   - GraphQL API
   - Proper authentication with API tokens

2. **Strapi Admin UI**
   - Content Manager
   - Media Library
   - Settings

3. **Strapi Services** (in custom code)
   - `strapi.documents()`
   - `strapi.entityService`
   - `strapi.query()`

4. **Bootstrap Functions**
   - `src/index.ts` bootstrap method
   - Runs on Strapi startup
   - Uses proper Strapi APIs internally

## API Permissions

If API calls fail with 403/405:
- Enable permissions in **Settings → Roles → Authenticated**
- Or enable in **Settings → Roles → Public** (if appropriate)
- Never bypass with direct DB access

## Correct Workflow

1. Try API calls first
2. If blocked, enable API permissions in admin UI
3. Use admin UI for manual operations
4. Use bootstrap scripts for automated setup
5. NEVER use direct database queries

## This Project

For this CFB website project:
- Photos are uploaded via API (`/api/upload`)
- Team members managed via API (`/api/teams`)
- If API permissions block operations, enable them in admin UI
- Manual linking via Strapi admin is acceptable and safe
