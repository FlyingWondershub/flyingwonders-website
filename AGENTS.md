<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Post-Task Workflow Rules
- Every time code changes are completed, always ask the user if deployment is required.
- If the user agrees/confirms deployment, automatically commit and push the changes to `origin/main`.
- Whenever new pages, routes, or features are created, always ensure SEO metadata, `sitemap.ts` entries, search indexing configurations, and the Admin Dashboard Site Map & Quick Links matrix are automatically updated.
- **Font & Dark/Light Mode Display Rule**: Always ensure all existing and new pages render crisp, readable typography in both Light and Dark mode across Web and Mobile browsers (iOS Safari, Android Chrome). Never use destructive CSS attribute selectors that override inner button/badge text into unreadable colors. Ensure all `<input>`, `<select>`, `<option>`, modals, cards, and buttons maintain guaranteed high contrast and proper font-family inheritance (`var(--font-inter)`, `var(--font-playfair)`).

