---
Task ID: 1
Agent: main
Task: Fix all reported bugs - images not showing, preview not working, phone number display, settings sync, font audit

Work Log:
- Read entire codebase: upload API, product store, admin components, storefront components, settings store, DB schema
- Verified image pipeline: upload saves to `public/uploads/products/`, returns URL `/uploads/products/{filename}`, stored as JSON string in DB, parsed by `formatProduct()` on API read, displayed via `<img src>` tags
- Confirmed image files exist in `public/images/products/` (29 seed images) and `public/uploads/products/` (1 uploaded image)
- Confirmed database has correct image paths in JSON format
- Removed `output: "standalone"` from next.config.ts that could cause Turbopack dev mode static file serving issues
- Added `invalidate()` method to store-settings-store.ts for resetting and re-fetching settings
- Updated src/app/page.tsx to invalidate both product store AND settings store when leaving admin view
- Updated announcement-bar.tsx to rotate between announcement message, phone number, and WhatsApp number
- Delegated comprehensive bug audit to subagent which fixed image error handling in admin-storefront.tsx, admin-products.tsx, and wishlist-page.tsx
- Verified all 15+ page/section components compile and work correctly
- Font size hierarchy verified as consistent

Stage Summary:
- Key fix: Removed `output: "standalone"` from next.config.ts - this was likely causing Turbopack to not serve static files properly in dev mode
- Settings store now properly invalidates when admin changes are made (added invalidate method + hooked to admin→storefront transition)
- Phone number now visible in rotating announcement bar (along with WhatsApp)
- Image error handling improved in admin-storefront.tsx, admin-products.tsx, wishlist-page.tsx
- Dev server compiles cleanly with 0 ESLint errors
- All API endpoints returning 200 OK: /, /api/settings, /api/products, /api/categories, /api/collections
